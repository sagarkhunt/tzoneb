import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { UsersModule } from '../users/users.module';
import { QueuesModule } from '../../queues/queues.module';
import { QueuesNoopModule } from '../../queues/queues-noop.module';

@Module({
  imports: [
    UsersModule,
    process.env.DISABLE_REDIS === 'true' ? QueuesNoopModule : QueuesModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
