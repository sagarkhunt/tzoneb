import { Injectable, Logger } from '@nestjs/common';

/** No-op QueuesService when Redis is disabled (DISABLE_REDIS=true). Email/job queues are skipped. */
@Injectable()
export class QueuesNoopService {
  private readonly logger = new Logger(QueuesNoopService.name);

  async addEmailJob(_data: { to: string; subject: string; body: string; html?: string }, _priority = 1) {
    this.logger.warn('Redis disabled: Email job skipped (run with Redis to enable)');
  }

  async addFileProcessingJob(_data: unknown, _priority = 1) {
    this.logger.warn('Redis disabled: File processing job skipped');
  }

  async addNotificationJob(_data: unknown, _priority = 1) {
    this.logger.warn('Redis disabled: Notification job skipped');
  }

  async scheduleCleanupJobs() {
    this.logger.warn('Redis disabled: Cleanup jobs skipped');
  }
}
