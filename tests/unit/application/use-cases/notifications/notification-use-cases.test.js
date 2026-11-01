import { describe, it, expect, vi } from 'vitest';
import { ListUserNotifications } from '../../../../../src/application/use-cases/notifications/list-user-notifications.js';
import { MarkNotificationAsRead } from '../../../../../src/application/use-cases/notifications/mark-notification-as-read.js';
import { MarkAllNotificationsAsRead } from '../../../../../src/application/use-cases/notifications/mark-all-notifications-as-read.js';
import { DispatchTicketNotifications } from '../../../../../src/application/use-cases/notifications/dispatch-ticket-notifications.js';
import { ProcessPendingNotificationsJob } from '../../../../../src/infrastructure/jobs/process-pending-notifications-job.js';
import { NOTIFICATION_STATUS } from '../../../../../src/shared/constants/notifications.js';
import { NotFoundError } from '../../../../../src/domain/errors/not-found-error.js';
import { Notification } from '../../../../../src/domain/entities/notification.js';
import { NotificationMapper } from '../../../../../src/application/mappers/notification-mapper.js';

describe('Notification Use Cases & Worker', () => {
  it('ListUserNotifications: should list notifications and calculate unread count', async () => {
    const notificationsRepository = {
      findByUserId: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'notif-1',
            userId: 'user-1',
            type: 'STATUS_CHANGED',
            channel: 'IN_APP',
            status: 'DELIVERED',
            readAt: null,
            createdAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      countUnread: vi.fn().mockResolvedValue(1),
    };

    const useCase = new ListUserNotifications({ notificationsRepository });
    const result = await useCase.execute({ user: { id: 'user-1' } });

    expect(result.data).toHaveLength(1);
    expect(result.pagination.unreadCount).toBe(1);
    expect(result.data[0].isRead).toBe(false);
  });

  it('MarkNotificationAsRead: should mark as read when found and owned by user', async () => {
    const notificationsRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
        readAt: null,
      }),
      markAsRead: vi.fn().mockResolvedValue({
        id: 'notif-1',
        userId: 'user-1',
        readAt: new Date(),
      }),
    };

    const useCase = new MarkNotificationAsRead({ notificationsRepository });
    const result = await useCase.execute({ notificationId: 'notif-1', user: { id: 'user-1' } });

    expect(result.readAt).toBeDefined();
    expect(notificationsRepository.markAsRead).toHaveBeenCalledWith('notif-1', 'user-1');
  });

  it('MarkNotificationAsRead: should throw NotFoundError when notification belongs to another user', async () => {
    const notificationsRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'notif-1',
        userId: 'other-user',
        readAt: null,
      }),
    };

    const useCase = new MarkNotificationAsRead({ notificationsRepository });
    await expect(
      useCase.execute({ notificationId: 'notif-1', user: { id: 'user-1' } })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('MarkAllNotificationsAsRead: should mark all unread notifications', async () => {
    const notificationsRepository = {
      markAllAsRead: vi.fn().mockResolvedValue(5),
    };

    const useCase = new MarkAllNotificationsAsRead({ notificationsRepository });
    const result = await useCase.execute({ user: { id: 'user-1' } });

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(5);
  });

  it('DispatchTicketNotifications: should generate both IN_APP and EMAIL notifications for requester and assignee', async () => {
    const notificationsRepository = {
      createMany: vi.fn().mockImplementation((items) => items),
    };

    const useCase = new DispatchTicketNotifications({ notificationsRepository });
    const created = await useCase.execute({
      ticket: { id: 't1', requesterId: 'req-1', assignedUserId: 'agent-1' },
      actorUserId: 'req-1', // actor is requester, so only agent gets notified
      type: 'NEW_COMMENT',
    });

    expect(created).toHaveLength(2); // 1 IN_APP, 1 EMAIL
    expect(created[0].userId).toBe('agent-1');
  });

  it('DispatchTicketNotifications: should handle missing recipients, actor notification, and default type', async () => {
    const notificationsRepository = { createMany: vi.fn().mockImplementation((items) => items) };
    const useCase = new DispatchTicketNotifications({ notificationsRepository });

    await expect(useCase.execute({ ticket: null, actorUserId: 'u1' })).resolves.toEqual([]);
    await expect(
      useCase.execute({ ticket: { id: 't1', requesterId: 'u1' }, actorUserId: 'u1' })
    ).resolves.toEqual([]);

    const created = await useCase.execute({
      ticket: { id: 't1', requesterId: 'u1', assignedUserId: 'u2' },
      actorUserId: 'u1',
      notifyActor: true,
    });
    expect(created).toHaveLength(4);
    expect(created.every((item) => item.type === 'STATUS_CHANGED')).toBe(true);
    expect(notificationsRepository.createMany).toHaveBeenCalledTimes(1);
  });

  it('Notification and mapper: should handle nulls, defaults, and ticket DTOs', () => {
    expect(NotificationMapper.toDomain(null)).toBeNull();
    expect(NotificationMapper.toDTO(null)).toBeNull();

    const notification = new Notification({ id: 'n1', userId: 'u1', type: 'STATUS_CHANGED', channel: 'IN_APP' });
    expect(notification.status).toBe('PENDING');
    expect(notification.attempts).toBe(0);
    expect(NotificationMapper.toDTO(notification)).toMatchObject({
      id: 'n1',
      isRead: false,
      ticket: null,
    });

    notification.readAt = new Date();
    notification.ticket = { id: 't1', title: 'Printer', status: 'OPEN', priority: 'HIGH' };
    expect(NotificationMapper.toDTO(notification)).toMatchObject({
      isRead: true,
      ticket: { id: 't1', title: 'Printer', status: 'OPEN', priority: 'HIGH' },
    });
  });

  it('ProcessPendingNotificationsJob: should deliver emails and update status to DELIVERED', async () => {
    const notificationsRepository = {
      findPendingEmails: vi.fn().mockResolvedValue([
        {
          id: 'notif-email-1',
          attempts: 0,
          status: 'PENDING',
          user: { name: 'João', email: 'joao@example.com' },
          ticket: { id: 'ticket-12345678-uuid', title: 'Computador quebrado', status: 'OPEN' },
          type: 'STATUS_CHANGED',
        },
      ]),
      updateStatus: vi.fn().mockResolvedValue({}),
    };

    const mailService = {
      sendMail: vi.fn().mockResolvedValue({ messageId: 'msg-1' }),
    };

    const job = new ProcessPendingNotificationsJob({
      notificationsRepository,
      mailService,
    });

    const result = await job.run({ batchSize: 10, maxAttempts: 10 });
    expect(result.processed).toBe(1);
    expect(result.succeeded).toBe(1);
    expect(mailService.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'joao@example.com' })
    );
    expect(notificationsRepository.updateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'notif-email-1',
        status: NOTIFICATION_STATUS.DELIVERED,
      })
    );
  });

  it('ProcessPendingNotificationsJob: should retry up to 10 attempts and mark FAILED when exceeding limit', async () => {
    const notificationsRepository = {
      findPendingEmails: vi.fn().mockResolvedValue([
        {
          id: 'notif-email-failing',
          attempts: 9, // will become 10
          status: 'PENDING',
          user: { name: 'Maria', email: 'maria@example.com' },
          ticket: { id: 'ticket-uuid', title: 'Erro de rede' },
          type: 'TICKET_ASSIGNED',
        },
      ]),
      updateStatus: vi.fn().mockResolvedValue({}),
    };

    const mailService = {
      sendMail: vi.fn().mockRejectedValue(new Error('SMTP timeout')),
    };

    const job = new ProcessPendingNotificationsJob({
      notificationsRepository,
      mailService,
    });

    const result = await job.run({ batchSize: 10, maxAttempts: 10 });
    expect(result.processed).toBe(1);
    expect(result.failed).toBe(1);
    expect(notificationsRepository.updateStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'notif-email-failing',
        status: NOTIFICATION_STATUS.FAILED,
        attempts: 10,
        lastError: 'SMTP timeout',
      })
    );
  });
});
