import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { StorageModule } from './modules/storage/storage.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { PlansModule } from './modules/plans/plans.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { QueuesModule } from './queues/queues.module';
import { QueuesNoopModule } from './queues/queues-noop.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, storageConfig],
      envFilePath: 'src/.env',
    }),

    // Winston Logger
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
              return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      ],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
      },
    ]),

    // Redis Cache
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutes default
    }),

    // Bull Queue (skipped when DISABLE_REDIS=true - run without Redis for local dev)
    ...(process.env.DISABLE_REDIS === 'true'
      ? []
      : [
          BullModule.forRoot({
            redis: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379', 10),
              password: process.env.REDIS_PASSWORD || undefined,
              maxRetriesPerRequest: 1,
              retryStrategy: () => null,
            },
          }),
        ]),

    // Feature modules
    DatabaseModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
    EmployeesModule,
    PlansModule,
    OrganizationsModule,
    HealthModule,
    StorageModule,
    process.env.DISABLE_REDIS === 'true' ? QueuesNoopModule : QueuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
