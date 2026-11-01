import { PrismaNotificationsRepository } from '../../../infrastructure/database/prisma/repositories/prisma-notifications-repository.js';
import { MailService } from '../../../infrastructure/email/mail-service.js';
import { ProcessPendingNotificationsJob } from '../../../infrastructure/jobs/process-pending-notifications-job.js';
import { NotificationScheduler } from '../../../infrastructure/jobs/notification-scheduler.js';
import { AppSchedulerManager } from '../../../infrastructure/jobs/app-scheduler-manager.js';

export const makeAppSchedulers = () => {
  const notificationsRepository = new PrismaNotificationsRepository();
  const mailService = new MailService();

  const processPendingNotificationsJob = new ProcessPendingNotificationsJob({
    notificationsRepository,
    mailService,
  });

  const notificationScheduler = new NotificationScheduler({
    processPendingNotificationsJob,
  });

  return new AppSchedulerManager({
    schedulers: [notificationScheduler],
  });
};
