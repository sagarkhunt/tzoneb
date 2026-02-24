# Migration Guide: Express to NestJS

This document outlines the migration from the old Express.js application to the new NestJS architecture.

## What Changed

### Architecture
- **Old**: Simple Express.js with basic routing
- **New**: Full NestJS modular architecture with dependency injection

### Database Access
- **Old**: Direct PostgreSQL pool connections via `pg`
- **New**: Prisma ORM with type-safe queries and migrations

### Authentication
- **Old**: None
- **New**: Full JWT authentication with refresh tokens and RBAC

### API Structure
- **Old**: Single `app.js` file
- **New**: Modular structure with separate modules for auth, users, storage, etc.

## Migration Steps Completed

1. ✅ **Project Structure**: Created NestJS project with TypeScript
2. ✅ **Database Layer**: Migrated from `pg` to Prisma ORM
3. ✅ **Authentication**: Added JWT auth with refresh tokens
4. ✅ **Authorization**: Implemented RBAC with roles and permissions
5. ✅ **Validation**: Added Zod schemas for input validation
6. ✅ **Caching**: Integrated Redis for performance
7. ✅ **File Storage**: Added Azure Blob/S3 support
8. ✅ **Background Jobs**: Implemented BullMQ queues
9. ✅ **Documentation**: Added Swagger API docs
10. ✅ **Logging**: Integrated Winston logger
11. ✅ **Testing**: Added unit and E2E tests
12. ✅ **Docker**: Created Docker Compose setup

## Old vs New Endpoints

### Old
```
GET / - Simple health check
```

### New
```
GET /api/v1/ - API status
GET /api/v1/health - Health check with database status

# Authentication
POST /api/v1/auth/register - Register user
POST /api/v1/auth/login - Login
POST /api/v1/auth/refresh - Refresh token
POST /api/v1/auth/logout - Logout

# Users
GET /api/v1/users - List users (admin only)
GET /api/v1/users/:id - Get user
PATCH /api/v1/users/:id - Update user
DELETE /api/v1/users/:id - Delete user (admin only)

# Storage
POST /api/v1/storage/upload - Upload file
GET /api/v1/storage/files - List files
DELETE /api/v1/storage/:filename - Delete file
GET /api/v1/storage/signed-url/:filename - Get signed URL
```

## Database Schema Migration

The old database connection has been replaced with Prisma. New tables created:

- `users` - User accounts with email and password
- `roles` - Role definitions (admin, user, etc.)
- `user_roles` - Many-to-many relationship between users and roles
- `refresh_tokens` - JWT refresh token storage

To migrate existing data:

```bash
# Run migrations
npm run prisma:migrate

# Seed initial data (creates admin user and roles)
npm run prisma:seed
```

## Configuration Changes

### Old (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=database
```

### New (.env)
The new `.env` file includes all the above plus:
- JWT secrets
- Redis configuration
- Storage provider settings
- Rate limiting settings
- API prefix configuration

See `.env.example` for all variables.

## Code Examples

### Old Way (Express)
```javascript
const express = require("express");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  // ...
});

app.get("/", (req, res) => {
  res.send("Server is running");
});
```

### New Way (NestJS)
```typescript
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get API status' })
  getStatus() {
    return this.appService.getStatus();
  }
}
```

## Running the New Application

### Development
```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start dev server
npm run start:dev
```

### Production
```bash
# Build
npm run build

# Start
npm run start:prod
```

### With Docker
```bash
# Development (just infrastructure)
docker-compose -f docker-compose.dev.yml up -d

# Production (full stack)
docker-compose up -d
```

## Testing

The new application includes comprehensive testing:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Rollback Plan

If you need to rollback to the old Express application:

1. The old files are preserved (you can archive them first)
2. Keep the old `.env` configuration
3. Switch back to using `node src/server.js`

## Support

For any migration issues or questions, please refer to:
- README.md for full documentation
- Swagger docs at http://localhost:5000/api/docs
- NestJS documentation: https://docs.nestjs.com

## Next Steps

1. Test all endpoints using Swagger UI
2. Verify database migrations
3. Configure storage provider (Azure or S3)
4. Set up Redis for production
5. Update CI/CD pipelines
6. Train team on NestJS patterns
