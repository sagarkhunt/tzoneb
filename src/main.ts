import { config } from 'dotenv';
import { resolve } from 'path';

// Load env before app bootstrap (ConfigModule uses src/.env)
config({ path: resolve(process.cwd(), 'src/.env') });
config({ path: resolve(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Security - configure Helmet to allow cross-origin requests (CORS)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS - must allow explicit origin when credentials: true (no wildcard)
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((o) => o.trim())
    .filter(Boolean) || [
    'http://localhost:3000',
    'http://localhost:4200',
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4200',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5000',
    'http://127.0.0.1:5001',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV === 'development' && !origin) {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-Id', 'Accept'],
    exposedHeaders: ['Authorization'],
  });

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation (optional: disable in prod via SWAGGER_ENABLED=false)
  const swaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
  if (swaggerEnabled) {
    const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TZone Travel API')
      .setDescription(
        'TZone Travel expense management backend API. Auth required for protected endpoints.',
      )
      .setVersion('1.0')
      .addServer(apiBaseUrl)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  if (swaggerEnabled) {
    console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  }
}

bootstrap();
