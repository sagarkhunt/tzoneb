import { Module } from '@nestjs/common';
import { QueuesNoopService } from './queues-noop.service';
import { QueuesService } from './queues.service';

/** Queues module that runs without Redis. Use when DISABLE_REDIS=true. */
@Module({
  providers: [
    { provide: QueuesService, useClass: QueuesNoopService },
  ],
  exports: [QueuesService],
})
export class QueuesNoopModule {}
