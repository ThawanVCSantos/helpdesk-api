export class NotificationsController {
  constructor({
    listUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    processPendingNotificationsJob,
  }) {
    this.listUserNotifications = listUserNotifications;
    this.markNotificationAsRead = markNotificationAsRead;
    this.markAllNotificationsAsRead = markAllNotificationsAsRead;
    this.processPendingNotificationsJob = processPendingNotificationsJob;
  }

  list = async (req, res, next) => {
    try {
      const user = req.user;
      const { page, limit, unreadOnly, channel } = req.validated?.query || req.query || {};

      const result = await this.listUserNotifications.execute({
        user,
        page,
        limit,
        unreadOnly,
        channel,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req, res, next) => {
    try {
      const user = req.user;
      const { id } = req.params;

      const result = await this.markNotificationAsRead.execute({
        notificationId: id,
        user,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req, res, next) => {
    try {
      const user = req.user;
      const { channel } = req.body || {};

      const result = await this.markAllNotificationsAsRead.execute({
        user,
        channel,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  triggerJob = async (req, res, next) => {
    try {
      const result = await this.processPendingNotificationsJob.run();
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
