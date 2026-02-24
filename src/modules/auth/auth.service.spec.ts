import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '@database/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    assignRole: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'jwt.secret': 'test-secret',
        'jwt.expiresIn': '15m',
        'jwt.refreshSecret': 'test-refresh-secret',
        'jwt.refreshExpiresIn': '7d',
      };
      return config[key];
    }),
  };

  const mockPrismaService = {
    role: {
      findUnique: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: '$2b$10$valid.hash',
        isActive: true,
        roles: [],
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      
      // Mock bcrypt.compare
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');
      
      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password123');
      
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and refresh token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roles: [],
      };

      mockJwtService.sign.mockReturnValue('mock-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: '1',
        token: 'mock-refresh-token',
        userId: '1',
        expiresAt: new Date(),
      });

      const result = await service.login(mockUser);
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });
  });
});
