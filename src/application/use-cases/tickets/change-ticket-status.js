import { BadRequestError } from '../../../domain/errors/bad-request-error.js';
import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { TicketMapper } from '../../mappers/ticket-mapper.js';
import { VALID_STATUSES, calculateClosedAt } from '../../../shared/utils/ticket-status.js';
import { logger } from '../../../infrastructure/logging/logger.js';

export { VALID_STATUSES };

export class ChangeTicketStatus {
  constructor({ ticketsRepository, ticketEventsRepository, dispatchTicketNotifications = null }) {
    this.ticketsRepository = ticketsRepository;
    this.ticketEventsRepository = ticketEventsRepository;
    this.dispatchTicketNotifications = dispatchTicketNotifications;
  }

  async execute({ id, actorUser, status }) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new NotFoundError('Chamado não encontrado');
    }

    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestError(`Status inválido: ${status}`);
    }

    if (ticket.status === status) {
      return TicketMapper.toDTO(ticket);
    }

    const closedAt = calculateClosedAt(status, ticket.closedAt);

    const updated = await this.ticketsRepository.update(id, {
      status,
      closedAt,
    });

    await this.ticketEventsRepository.create({
      ticketId: id,
      userId: actorUser.id,
      type: 'STATUS_CHANGED',
      metadata: {
        oldStatus: ticket.status,
        newStatus: status,
      },
    });

    if (this.dispatchTicketNotifications) {
      try {
        await this.dispatchTicketNotifications.execute({
          ticket: updated,
          actorUserId: actorUser.id,
          type: 'STATUS_CHANGED',
        });
      } catch (error) {
        logger.error('Failed to dispatch ticket notifications', {
          ticketId: id,
          actorUserId: actorUser.id,
          type: 'STATUS_CHANGED',
          error: error.message,
        });
      }
    }

    return TicketMapper.toDTO(updated);
  }
}
