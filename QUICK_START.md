# Quick Start Guide

## Installation Issue - Windows Permissions

If you're getting EPERM errors during `npm install`, try these solutions:

### Solution 1: Clean Install
```powershell
# Close all terminals, IDEs, and editors
# Delete node_modules folder
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Try install again
npm install
```

### Solution 2: Run as Administrator
```powershell
# Right-click PowerShell or Command Prompt
# Select "Run as Administrator"
# Navigate to project directory
cd "D:\New folder\demo"

# Try install
npm install
```

### Solution 3: Temporary Antivirus Disable
Temporarily disable your antivirus software and try installing again.

### Solution 4: Use Docker (Recommended)
If npm install continues to fail, use Docker instead:

```powershell
# Start infrastructure only
docker-compose -f docker-compose.dev.yml up -d

# This starts PostgreSQL and Redis
# Then you can develop without local npm install issues
```

## Once Dependencies Are Installed

### 1. Generate Prisma Client
```bash
npm run prisma:generate
```

### 2. Run Database Migrations
```bash
npm run prisma:migrate
```

### 3. Seed Database
```bash
npm run prisma:seed
```

This creates:
- Admin user: `admin@example.com` / `admin123`
- User role and admin role

### 4. Start Development Server
```bash
npm run start:dev
```

### 5. Access the Application

- **API**: http://localhost:5000
- **Swagger Docs**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/api/v1/health

## Testing the API

### 1. Register a New User
```bash
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Login
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response includes `accessToken` - use this for authenticated requests.

### 3. Get User Profile
```bash
GET http://localhost:5000/api/v1/users/{id}
Authorization: Bearer {accessToken}
```

## Docker Alternative

If npm install issues persist, use Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## What's Been Migrated

✅ **Complete NestJS Architecture**
- TypeScript configuration
- Modular structure with dependency injection
- Global exception filters and interceptors

✅ **Database Layer**
- Prisma ORM replacing direct pg connections
- Type-safe database queries
- Migration system

✅ **Authentication & Authorization**
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt

✅ **Features**
- Redis caching
- File storage (Azure Blob/S3)
- Background job queues (BullMQ)
- Request validation (Zod)
- API documentation (Swagger)
- Structured logging (Winston)
- Health checks
- Rate limiting

✅ **DevOps**
- Docker and Docker Compose setup
- Production-ready Dockerfile
- Development environment configuration

✅ **Testing**
- Unit tests
- Integration tests
- E2E tests
- Test configuration

✅ **Documentation**
- Comprehensive README
- Migration guide
- API documentation via Swagger
- Code examples

## Environment Variables

The `.env` file in `src/.env` is already configured with:
- Database connection (using your existing credentials)
- JWT secrets (CHANGE THESE IN PRODUCTION!)
- Redis configuration
- Default settings

**IMPORTANT**: Update JWT secrets before deploying to production!

## Next Steps

1. Fix npm install (see solutions above)
2. Run Prisma migrations
3. Seed the database
4. Start the development server
5. Test endpoints in Swagger UI
6. Configure storage provider (Azure or S3) if needed

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in src/.env
PORT=3000
```

### Database Connection Failed
```bash
# Make sure PostgreSQL is running
# Or start with Docker:
docker-compose -f docker-compose.dev.yml up -d postgres
```

### Redis Connection Failed
```bash
# Make sure Redis is running
# Or start with Docker:
docker-compose -f docker-compose.dev.yml up -d redis
```

## Getting Help

- Check README.md for full documentation
- See MIGRATION_GUIDE.md for migration details
- Visit Swagger docs at /api/docs for API reference
- NestJS docs: https://docs.nestjs.com
