import { NotFoundError } from '../../../domain/errors/not-found-error.js';
import { NotificationMapper } from '../../mappers/notification-mapper.js';

export class MarkNotificationAsRead {
  constructor({ notificationsRepository }) {
    this.notificationsRepository = notificationsRepository;
  }

  async execute({ notificationId, user }) {
    const notification = await this.notificationsRepository.findById(notificationId);
    if (!notification || notification.userId !== user.id) {
      throw new NotFoundError('Notificação não encontrada');
    }

    if (notification.readAt) {
      return NotificationMapper.toDTO(notification);
    }

    const updated = await this.notificationsRepository.markAsRead(notificationId, user.id);
    return NotificationMapper.toDTO(updated);
  }
}
