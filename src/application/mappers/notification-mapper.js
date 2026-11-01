import { Notification } from '../../domain/entities/notification.js';

export class NotificationMapper {
  static toDomain(raw) {
    if (!raw) return null;

    return new Notification({
      id: raw.id,
      userId: raw.userId,
      ticketId: raw.ticketId,
      type: raw.type,
      channel: raw.channel,
      status: raw.status,
      attempts: raw.attempts,
      lastError: raw.lastError,
      deliveredAt: raw.deliveredAt,
      readAt: raw.readAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      user: raw.user || null,
      ticket: raw.ticket || null,
    });
  }

  static toDTO(domain) {
    if (!domain) return null;

    return {
      id: domain.id,
      userId: domain.userId,
      ticketId: domain.ticketId,
      type: domain.type,
      channel: domain.channel,
      status: domain.status,
      attempts: domain.attempts,
      lastError: domain.lastError,
      deliveredAt: domain.deliveredAt,
      readAt: domain.readAt,
      isRead: !!domain.readAt,
      createdAt: domain.createdAt,
      ticket: domain.ticket
        ? {
            id: domain.ticket.id,
            title: domain.ticket.title,
            status: domain.ticket.status,
            priority: domain.ticket.priority,
          }
        : null,
    };
  }
}
