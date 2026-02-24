import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userRole: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email,
        password: 'hashed',
        firstName: null,
        lastName: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(email, password);
      
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email });

      await expect(service.create(email, password)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        roles: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);
      
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (result) {
        expect(result.id).toBe(userId);
      }
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
