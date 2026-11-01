import { logger } from '../logging/logger.js';

export class AppSchedulerManager {
  constructor({ schedulers = [] } = {}) {
    this.schedulers = schedulers;
  }

  startAll() {
    for (const scheduler of this.schedulers) {
      try {
        scheduler.start();
      } catch (error) {
        logger.error('Failed to start scheduler', { error: error.message });
      }
    }
  }

  stopAll() {
    for (const scheduler of this.schedulers) {
      try {
        scheduler.stop();
      } catch (error) {
        logger.error('Failed to stop scheduler', { error: error.message });
      }
    }
  }
}
