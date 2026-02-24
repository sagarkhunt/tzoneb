import { ConfigifyModule } from '@itgorillaz/configify';
import { Module } from '@nestjs/common';
import { CommandRunnerModule } from 'nest-commander';
import { DatabaseModule } from '../database/database.module';
import { GlobalModule } from '../modules/global/global.module';
import { CreateAdminUserCommand } from './create-admin-user.command';
import { SeedInitialCommand } from './seed-initial.command';
import { SeedRolesCommand } from './seed-roles.command';

@Module({
  imports: [ConfigifyModule.forRootAsync(), DatabaseModule, CommandRunnerModule, GlobalModule],
  controllers: [],
  providers: [CreateAdminUserCommand, SeedInitialCommand, SeedRolesCommand],
})
export class CommandsModule {}
