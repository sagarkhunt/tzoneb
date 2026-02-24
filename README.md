# Demo - Production-Ready NestJS Backend

A modern, scalable backend application built with NestJS, TypeScript, and a comprehensive tech stack designed for enterprise-grade applications.

## Tech Stack

| Purpose | Technology |
|---------|-----------|
| **Runtime** | Node.js 20 + TypeScript |
| **Framework** | NestJS |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT + RBAC |
| **Validation** | Zod |
| **Cache** | Redis |
| **File Storage** | Azure Blob / AWS S3 |
| **Queue** | BullMQ (Redis) |
| **API Docs** | Swagger |
| **Logging** | Winston |

## Features

- ✅ **Authentication & Authorization**: JWT-based auth with Role-Based Access Control (RBAC)
- ✅ **Database**: PostgreSQL with Prisma ORM for type-safe database access
- ✅ **Caching**: Redis integration for high-performance caching
- ✅ **File Storage**: Azure Blob Storage / AWS S3 support
- ✅ **Background Jobs**: BullMQ for async task processing
- ✅ **API Documentation**: Auto-generated Swagger/OpenAPI docs
- ✅ **Validation**: Zod schemas for request validation
- ✅ **Logging**: Winston for structured logging
- ✅ **Security**: Helmet, CORS, rate limiting
- ✅ **Health Checks**: Database and service health monitoring
- ✅ **Docker Support**: Full containerization with Docker Compose
- ✅ **Testing**: Unit, integration, and E2E tests

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── app.controller.ts       # Root controller
├── app.service.ts          # Root service
├── config/                 # Configuration modules
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── storage.config.ts
├── common/                 # Shared utilities
│   ├── decorators/         # Custom decorators
│   ├── filters/            # Exception filters
│   ├── guards/             # Auth & RBAC guards
│   ├── interceptors/       # Request/response interceptors
│   ├── pipes/              # Validation pipes
│   └── schemas/            # Zod validation schemas
├── modules/                # Feature modules
│   ├── auth/               # Authentication module
│   ├── users/              # Users module
│   ├── storage/            # File storage module
│   └── health/             # Health check module
├── database/               # Database layer
│   ├── prisma.service.ts
│   └── database.module.ts
└── queues/                 # Background job processors
    ├── email.queue.ts
    ├── file-processing.queue.ts
    ├── notifications.queue.ts
    └── cleanup.queue.ts
```

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 15 or higher
- Redis 7 or higher
- Docker & Docker Compose (for containerized setup)

## Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd demo

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the `.env` file and configure your environment variables:

```bash
# The .env file is already configured in src/.env
# Update the following values as needed:
# - JWT secrets (change from defaults!)
# - Database credentials
# - Redis connection
# - Storage provider credentials (Azure or S3)
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

This will create:
- Admin user: `admin@example.com` / `admin123`
- Roles: `admin`, `user`

### 4. Development Setup (Option A: Local)

```bash
# Start PostgreSQL and Redis locally
# Make sure they're running on default ports (5432 and 6379)

# Start development server with hot reload
npm run start:dev
```

### 4. Development Setup (Option B: Docker Compose)

```bash
# Start only infrastructure services (PostgreSQL + Redis)
docker-compose -f docker-compose.dev.yml up -d

# Then run the app locally
npm run start:dev

# Or start everything with Docker
docker-compose up -d
```

### 5. Access the Application

- **API**: http://localhost:5000
- **API Documentation (Swagger)**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/api/v1/health
- **Redis Commander** (if using dev compose): http://localhost:8081

## Available Scripts

### Development
```bash
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debug mode
```

### Production
```bash
npm run build          # Build for production
npm run start:prod     # Start production server
```

### Database
```bash
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

### Testing
```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run E2E tests
```

### Code Quality
```bash
npm run lint           # Lint code
npm run format         # Format code with Prettier
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### Users
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (Admin only)
- `POST /api/v1/users/:userId/roles/:roleId` - Assign role (Admin only)

### Storage
- `POST /api/v1/storage/upload` - Upload file
- `GET /api/v1/storage/files` - List all files
- `DELETE /api/v1/storage/:filename` - Delete file
- `GET /api/v1/storage/signed-url/:filename` - Get signed URL

### Health
- `GET /api/v1/health` - Application health status

## Docker Deployment

### Production Build

```bash
# Build the Docker image
docker build -t demo-app .

# Run with Docker Compose
docker-compose up -d
```

### Development with Docker

```bash
# Start infrastructure only (PostgreSQL + Redis)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Variables

Key environment variables (see `src/.env` for complete list):

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `STORAGE_PROVIDER` | Storage provider (`azure` or `s3`) | `azure` |

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **RBAC**: Role-based access control
- **Rate Limiting**: Protection against brute force attacks
- **Helmet**: Security headers
- **CORS**: Configurable CORS policies
- **Input Validation**: Zod schema validation
- **Password Hashing**: bcrypt for secure password storage

## Background Jobs

The application includes several background job queues:

- **Email Queue**: Async email sending
- **File Processing Queue**: Image resizing, video transcoding
- **Notifications Queue**: Push notifications, SMS
- **Cleanup Queue**: Periodic cleanup of expired tokens and old logs

## Logging

Winston logger configured with:
- Console output (colorized for development)
- File rotation for errors
- Combined logs file
- Structured JSON logging in production

## Health Monitoring

Health check endpoint monitors:
- Database connectivity
- Redis connectivity
- Application status

Access at: `GET /api/v1/health`

## Best Practices

- **Type Safety**: Full TypeScript coverage with strict mode
- **Dependency Injection**: Leveraging NestJS DI container
- **Modular Architecture**: Feature-based module organization
- **Error Handling**: Global exception filters
- **API Documentation**: Swagger annotations on all endpoints
- **Testing**: Comprehensive test coverage
- **Code Quality**: ESLint + Prettier configuration

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs postgres
```

### Redis Connection Issues
```bash
# Check if Redis is running
docker-compose ps

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
