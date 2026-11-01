import { NotificationMapper } from '../../mappers/notification-mapper.js';

export class ListUserNotifications {
  constructor({ notificationsRepository }) {
    this.notificationsRepository = notificationsRepository;
  }

  async execute({ user, unreadOnly = false, channel = 'IN_APP', page = 1, limit = 20 }) {
    const result = await this.notificationsRepository.findByUserId(user.id, {
      unreadOnly,
      channel,
      page,
      limit,
    });

    const unreadCount = await this.notificationsRepository.countUnread(user.id, channel);

    return {
      data: result.data.map((item) => NotificationMapper.toDTO(item)),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        unreadCount,
      },
    };
  }
}
