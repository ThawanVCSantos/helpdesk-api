import { PrismaNotificationsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-notifications-repository.js';
import { MailService } from '../../../infrastructure/email/mail-service.js';

import { ListUserNotifications } from '../../../application/use-cases/notifications/list-user-notifications.js';
import { MarkNotificationAsRead } from '../../../application/use-cases/notifications/mark-notification-as-read.js';
import { MarkAllNotificationsAsRead } from '../../../application/use-cases/notifications/mark-all-notifications-as-read.js';
import { ProcessPendingNotificationsJob } from '../../../infrastructure/jobs/process-pending-notifications-job.js';
import { NotificationsController } from '../../../presentation/http/controllers/notifications-controller.js';

export const makeNotificationsController = () => {
  const notificationsRepository = new PrismaNotificationsRepository();
  const mailService = new MailService();

  const listUserNotifications = new ListUserNotifications({ notificationsRepository });
  const markNotificationAsRead = new MarkNotificationAsRead({ notificationsRepository });
  const markAllNotificationsAsRead = new MarkAllNotificationsAsRead({ notificationsRepository });

  const processPendingNotificationsJob = new ProcessPendingNotificationsJob({
    notificationsRepository,
    mailService,
  });

  return new NotificationsController({
    listUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    processPendingNotificationsJob,
  });
};
