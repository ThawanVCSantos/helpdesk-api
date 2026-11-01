export class MarkAllNotificationsAsRead {
  constructor({ notificationsRepository }) {
    this.notificationsRepository = notificationsRepository;
  }

  async execute({ user, channel = 'IN_APP' }) {
    const updatedCount = await this.notificationsRepository.markAllAsRead(user.id, channel);
    return {
      success: true,
      updatedCount,
    };
  }
}
