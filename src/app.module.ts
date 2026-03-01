import { ConfigifyModule } from '@itgorillaz/configify';
import { Module } from '@nestjs/common';
import { AuthConfig } from './config/auth.config';
import { RouterModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { GlobalModule } from './modules/global/global.module';
import { CostCentersModule } from './modules/cost-centers/cost-centers.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PlansModule } from './modules/plans/plans.module';

@Module({
  imports: [
    ConfigifyModule.forRootAsync(),
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    PlansModule,
    DepartmentsModule,
    CostCentersModule,
    GlobalModule,
    RouterModule.register([
      { path: 'auth', module: AuthModule },
      { path: 'organizations', module: OrganizationsModule },
      { path: 'plans', module: PlansModule },
      { path: 'departments', module: DepartmentsModule },
      { path: 'cost-centers', module: CostCentersModule },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
