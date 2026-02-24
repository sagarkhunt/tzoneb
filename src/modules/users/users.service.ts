import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(email: string, password: string, firstName?: string, lastName?: string): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });
  }

  async findAll(params?: {
    search?: string;
    page?: number;
    limit?: number;
    roleId?: string;
    departmentId?: string;
    status?: 'active' | 'inactive';
  }): Promise<{
    data: (Omit<User, 'password'> & { department?: { id: string; name: string } | null })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const search = params?.search?.trim();
    const roleId = params?.roleId?.trim();
    const departmentId = params?.departmentId?.trim();
    const status = params?.status;

    const andConditions: object[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      });
    }

    if (roleId) {
      andConditions.push({
        roles: {
          some: { roleId },
        },
      });
    }

    if (departmentId) {
      andConditions.push({ departmentId });
    }

    if (status === 'active') {
      andConditions.push({ isActive: true });
    } else if (status === 'inactive') {
      andConditions.push({ isActive: false });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          departmentId: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            include: {
              role: true,
            },
          },
          department: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findAllForExport(): Promise<
    (Omit<User, 'password'> & { department?: { id: string; name: string } | null; roles?: { role: { id: string; name: string } }[] })[]
  > {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        departmentId: true,
        createdAt: true,
        updatedAt: true,
        roles: { include: { role: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        departmentId: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Partial<User>): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        departmentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({ where: { id } });
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
  }

  async findAllRoles(): Promise<{ id: string; name: string }[]> {
    return this.prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
