import {
  MAX_NOTIFICATION_ATTEMPTS,
  NOTIFICATION_BATCH_SIZE,
  NOTIFICATION_STATUS,
} from '../../shared/constants/notifications.js';
import { logger } from '../logging/logger.js';

export class ProcessPendingNotificationsJob {
  constructor({ notificationsRepository, mailService }) {
    this.notificationsRepository = notificationsRepository;
    this.mailService = mailService;
    this.isRunning = false;
  }

  async run({ batchSize = NOTIFICATION_BATCH_SIZE, maxAttempts = MAX_NOTIFICATION_ATTEMPTS } = {}) {
    if (this.isRunning) {
      return { skipped: true, reason: 'Already running' };
    }

    this.isRunning = true;
    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    try {
      const pendingNotifications = await this.notificationsRepository.findPendingEmails({
        limit: batchSize,
        maxAttempts,
      });

      for (const notification of pendingNotifications) {
        processed++;
        await this.processSingle(notification, maxAttempts);
        if (notification.status === NOTIFICATION_STATUS.DELIVERED) {
          succeeded++;
        } else {
          failed++;
        }
      }

      return { processed, succeeded, failed };
    } catch (error) {
      logger.error('Error during notification batch processing', { error: error.message });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  async processSingle(notification, maxAttempts) {
    const attempts = notification.attempts + 1;

    await this.notificationsRepository.updateStatus({
      id: notification.id,
      status: NOTIFICATION_STATUS.PROCESSING,
      attempts,
    });

    try {
      const user = notification.user;
      const ticket = notification.ticket;

      if (!user || !user.email) {
        throw new Error('Destinatário da notificação não possui e-mail válido');
      }

      const subject = `[HelpDesk] Atualização no Chamado #${ticket ? ticket.id.substring(0, 8) : 'Geral'}`;
      const messageMap = {
        TICKET_ASSIGNED: 'Você foi atribuído a um chamado ou houve alteração no responsável.',
        NEW_COMMENT: 'Um novo comentário foi adicionado ao seu chamado.',
        STATUS_CHANGED: 'O status do seu chamado foi atualizado.',
        PRIORITY_CHANGED: 'A prioridade do chamado foi alterada.',
        DUE_SOON: 'O chamado está próximo do prazo de vencimento.',
        OVERDUE: 'O prazo do chamado expirou e está em atraso.',
      };

      const notificationMessage = messageMap[notification.type] || 'Houve uma nova atualização no seu chamado.';

      await this.mailService.sendMail({
        to: user.email,
        subject,
        template: 'ticket-notification',
        variables: {
          userName: user.name,
          notificationMessage,
          ticketId: ticket ? ticket.id.substring(0, 8) : null,
          ticketTitle: ticket ? ticket.title : null,
          ticketStatus: ticket ? ticket.status : null,
          ticketPriority: ticket ? ticket.priority : null,
        },
      });

      notification.status = NOTIFICATION_STATUS.DELIVERED;
      await this.notificationsRepository.updateStatus({
        id: notification.id,
        status: NOTIFICATION_STATUS.DELIVERED,
        attempts,
        deliveredAt: new Date(),
        lastError: null,
      });
    } catch (err) {
      const finalStatus = attempts >= maxAttempts ? NOTIFICATION_STATUS.FAILED : NOTIFICATION_STATUS.PENDING;
      notification.status = finalStatus;

      await this.notificationsRepository.updateStatus({
        id: notification.id,
        status: finalStatus,
        attempts,
        lastError: err.message?.substring(0, 1999) || 'Unknown error',
      });

      logger.warn('Failed to send notification email', {
        notificationId: notification.id,
        attempt: attempts,
        maxAttempts,
        error: err.message,
      });
    }
  }
}
