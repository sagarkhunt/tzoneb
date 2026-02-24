import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from '@common/schemas/organization.schema';
import { UsersService } from '../users/users.service';
import { QueuesService } from '../../queues/queues.service';
import {
  getAdminCredentialsEmailHtml,
  getExistingAdminEmailHtml,
} from './templates/admin-credentials-email.template';

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private queuesService: QueuesService,
  ) {}

  async create(data: CreateOrganizationDto) {
    // Check organization name uniqueness
    const existingName = await this.prisma.organization.findUnique({
      where: { name: data.name },
    });
    if (existingName) {
      throw new ConflictException('Organization with this name already exists');
    }

    // Check admin email uniqueness
    const existingEmail = await this.prisma.organization.findUnique({
      where: { adminEmail: data.adminEmail },
    });
    if (existingEmail) {
      throw new ConflictException('Organization with this admin email already exists');
    }

    // Validate plan exists
    const plan = await this.prisma.plan.findUnique({ where: { id: data.planId } });
    if (!plan) {
      throw new BadRequestException(`Plan with ID ${data.planId} not found`);
    }

    const organization = await this.prisma.organization.create({
      data: {
        name: data.name,
        adminEmail: data.adminEmail,
        planId: data.planId,
        licenseCount: data.licenseCount,
      },
      include: {
        plan: {
          select: { id: true, name: true, description: true, price: true },
        },
      },
    });

    // Create admin user and send credentials email
    const adminRole = await this.prisma.role.findUnique({ where: { name: 'admin' } });
      let password: string;
    if (adminRole) {
      const adminEmailLower = data.adminEmail.trim().toLowerCase();
      const existingUser = await this.prisma.user.findUnique({ where: { email: adminEmailLower } });

      if (!existingUser) {
        const password = generateSecurePassword();
        const user = await this.usersService.create(adminEmailLower, password, 'Admin', data.name);
        await this.usersService.assignRole(user.id, adminRole.id);

        const html = getAdminCredentialsEmailHtml({
          organizationName: data.name,
          adminEmail: adminEmailLower,
          password,
        });
        await this.queuesService.addEmailJob({
          to: adminEmailLower,
          subject: `Your TZone Travel Admin Account – ${data.name}`,
          body: `You have been set up as Administrator for ${data.name}. Email: ${adminEmailLower}, Password: ${password}, Role: Admin`,
          html,
        });
      } else {
        // Assign admin role to existing user and send notification
        const hasAdminRole = await this.prisma.userRole.findFirst({
          where: { userId: existingUser.id, roleId: adminRole.id },
        });
        if (!hasAdminRole) {
          await this.usersService.assignRole(existingUser.id, adminRole.id);
        }
        const html = getExistingAdminEmailHtml({
          organizationName: data.name,
          adminEmail: adminEmailLower,
        });
        await this.queuesService.addEmailJob({
          to: adminEmailLower,
          subject: `Admin Access – ${data.name}`,
          body: `You have been assigned as Administrator for ${data.name}. Sign in with your existing credentials.`,
          html,
        });
      }
    }

    return organization;
  }

  async findAllForExport() {
    return this.prisma.organization.findMany({
      include: {
        plan: {
          select: { id: true, name: true, description: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const orgs = await this.prisma.organization.findMany({
      where: { isActive: true },
      include: {
        plan: { select: { price: true } },
      },
    });
    const totalOrganizations = orgs.length;
    const totalSeats = orgs.reduce((sum, o) => sum + o.licenseCount, 0);
    const mrr = orgs.reduce((sum, o) => {
      const price = o.plan?.price ? Number(o.plan.price) : 0;
      return sum + price;
    }, 0);
    return {
      totalOrganizations,
      totalUsers: totalSeats,
      mrr: Math.round(mrr * 1000) / 1000,
      trialCount: 0,
    };
  }

  async findAll(params?: {
    search?: string;
    page?: number;
    limit?: number;
    planId?: string;
    status?: 'active' | 'inactive';
  }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params?.search?.trim()) {
      const s = params.search.trim().toLowerCase();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' as const } },
        { adminEmail: { contains: s, mode: 'insensitive' as const } },
      ];
    }
    if (params?.planId) where.planId = params.planId;
    if (params?.status === 'active') where.isActive = true;
    if (params?.status === 'inactive') where.isActive = false;

    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        include: {
          plan: {
            select: { id: true, name: true, description: true, price: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      organizations: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        plan: {
          select: { id: true, name: true, description: true, price: true },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async update(id: string, data: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({ where: { id } });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    // Check name uniqueness if name is being updated
    if (data.name && data.name !== organization.name) {
      const existingName = await this.prisma.organization.findUnique({
        where: { name: data.name },
      });
      if (existingName) {
        throw new ConflictException('Organization with this name already exists');
      }
    }

    // Check admin email uniqueness if email is being updated
    if (data.adminEmail && data.adminEmail !== organization.adminEmail) {
      const existingEmail = await this.prisma.organization.findUnique({
        where: { adminEmail: data.adminEmail },
      });
      if (existingEmail) {
        throw new ConflictException('Organization with this admin email already exists');
      }
    }

    // Validate plan exists if planId is being updated
    if (data.planId) {
      const plan = await this.prisma.plan.findUnique({ where: { id: data.planId } });
      if (!plan) {
        throw new BadRequestException(`Plan with ID ${data.planId} not found`);
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data,
      include: {
        plan: {
          select: { id: true, name: true, description: true, price: true },
        },
      },
    });
  }

  async remove(id: string) {
    const organization = await this.prisma.organization.findUnique({ where: { id } });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return this.prisma.organization.delete({ where: { id } });
  }
}
