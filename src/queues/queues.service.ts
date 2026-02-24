import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailJobData } from './email.queue';
import { FileProcessingJobData } from './file-processing.queue';
import { NotificationJobData } from './notifications.queue';

@Injectable()
export class QueuesService {
  private readonly logger = new Logger(QueuesService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('file-processing') private fileProcessingQueue: Queue,
    @InjectQueue('notifications') private notificationsQueue: Queue,
    @InjectQueue('cleanup') private cleanupQueue: Queue,
  ) {}

  async addEmailJob(data: EmailJobData, priority = 1) {
    const job = await this.emailQueue.add('send', data, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    this.logger.log(`Email job added: ${job.id}`);
    return job;
  }

  async addFileProcessingJob(data: FileProcessingJobData, priority = 1) {
    const job = await this.fileProcessingQueue.add('process', data, {
      priority,
      attempts: 2,
      timeout: 300000, // 5 minutes
    });
    this.logger.log(`File processing job added: ${job.id}`);
    return job;
  }

  async addNotificationJob(data: NotificationJobData, priority = 1) {
    const job = await this.notificationsQueue.add('send', data, {
      priority,
      attempts: 3,
    });
    this.logger.log(`Notification job added: ${job.id}`);
    return job;
  }

  async scheduleCleanupJobs() {
    // Schedule cleanup of expired tokens every hour
    await this.cleanupQueue.add(
      'expired-tokens',
      {},
      {
        repeat: {
          cron: '0 * * * *', // Every hour
        },
      },
    );

    // Schedule log cleanup daily at midnight
    await this.cleanupQueue.add(
      'old-logs',
      {},
      {
        repeat: {
          cron: '0 0 * * *', // Daily at midnight
        },
      },
    );

    this.logger.log('Cleanup jobs scheduled');
  }
}
