import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailProcessor } from './email.queue';
import { FileProcessingProcessor } from './file-processing.queue';
import { NotificationsProcessor } from './notifications.queue';
import { CleanupProcessor } from './cleanup.queue';
import { QueuesService } from './queues.service';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'file-processing' },
      { name: 'notifications' },
      { name: 'cleanup' },
    ),
  ],
  providers: [
    EmailProcessor,
    FileProcessingProcessor,
    NotificationsProcessor,
    CleanupProcessor,
    QueuesService,
  ],
  exports: [QueuesService, BullModule],
})
export class QueuesModule {}
