import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPES,
} from '../../../shared/constants/notifications.js';

export class DispatchTicketNotifications {
  constructor({ notificationsRepository }) {
    this.notificationsRepository = notificationsRepository;
  }

  async execute({ ticket, actorUserId, type, notifyActor = false }) {
    if (!ticket) return [];

    const recipientUserIds = new Set();

    if (ticket.requesterId && (notifyActor || ticket.requesterId !== actorUserId)) {
      recipientUserIds.add(ticket.requesterId);
    }

    if (ticket.assignedUserId && (notifyActor || ticket.assignedUserId !== actorUserId)) {
      recipientUserIds.add(ticket.assignedUserId);
    }

    if (recipientUserIds.size === 0) {
      return [];
    }

    const items = [];
    for (const recipientId of recipientUserIds) {
      items.push({
        userId: recipientId,
        ticketId: ticket.id,
        type: type || NOTIFICATION_TYPES.STATUS_CHANGED,
        channel: NOTIFICATION_CHANNELS.IN_APP,
        status: NOTIFICATION_STATUS.DELIVERED,
      });

      items.push({
        userId: recipientId,
        ticketId: ticket.id,
        type: type || NOTIFICATION_TYPES.STATUS_CHANGED,
        channel: NOTIFICATION_CHANNELS.EMAIL,
        status: NOTIFICATION_STATUS.PENDING,
      });
    }

    return this.notificationsRepository.createMany(items);
  }
}
