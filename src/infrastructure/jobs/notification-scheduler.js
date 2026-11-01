import schedule from 'node-schedule';
import { logger } from '../logging/logger.js';

export class NotificationScheduler {
  constructor({ processPendingNotificationsJob, cronSchedule = process.env.NOTIFICATION_CRON_SCHEDULE || '*/1 * * * *' }) {
    this.processPendingNotificationsJob = processPendingNotificationsJob;
    this.cronSchedule = cronSchedule;
    this.job = null;
  }

  start() {
    if (this.job) return;

    logger.info(`Starting notification scheduler with cron: "${this.cronSchedule}"`);
    this.job = schedule.scheduleJob(this.cronSchedule, async () => {
      try {
        await this.processPendingNotificationsJob.run();
      } catch (error) {
        logger.error('Error running scheduled notification job', { error: error.message });
      }
    });
  }

  stop() {
    if (this.job) {
      this.job.cancel();
      this.job = null;
      logger.info('Notification scheduler stopped');
    }
  }
}
