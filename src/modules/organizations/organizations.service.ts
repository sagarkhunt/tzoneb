import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Organization } from '../../database/entities/organization.entity';
import { Plan } from '../../database/entities/plan.entity';
import { User } from '../../database/entities/user.entity';
import {
  CreateOrganizationDto,
  FindOrganizationsQueryDto,
  UpdateOrganizationDto,
} from './organizations.dto';
import { getAdminCredentialsEmailHtml } from 'src/templates/admin-organization';
import { RoleSlug } from 'src/enums/role.enum';
import { Role } from 'src/database/entities/role.entity';
import { UserRole } from 'src/database/entities/user-role.entity';
import { BcryptService } from 'src/services/bcrypt.service';
import { generateSecurePassword } from 'src/services/password.util';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(body: CreateOrganizationDto, user: User) {
    const repo = this.dataSource.getRepository(Organization);

    const existingName = await repo.findOne({ where: { name: body.name } });
    if (existingName) throw new ConflictException('Organization name already exists');

    if (body.userId) {
      const userExists = await this.dataSource.getRepository(User).findOne({
        where: { id: body.userId },
      });
      if (!userExists) throw new BadRequestException('Invalid user ID');
    }
    if (body.planId) {
      const planExists = await this.dataSource.getRepository(Plan).findOne({
        where: { id: body.planId },
      });
      if (!planExists) throw new BadRequestException('Invalid plan ID');
    }

    const adminRole = await this.dataSource
      .getRepository(Role)
      .findOne({ where: { slug: RoleSlug.ADMIN } });

    const generatePassword = generateSecurePassword();

    const adminOnboarding = await this.dataSource.getRepository(User).save({
      email: body.adminEmail?.toLowerCase(),
      password: this.bcryptService.hashSync(generatePassword),
      roleId: adminRole.id,
    });

    const org = repo.create({
      name: body.name,
      userId: user.id,
      planId: body.planId,
      licenseCount: body.licenseCount ?? 0,
      isActive: body.isActive ?? true,
    });

    const data = await repo.save(org);

    await getAdminCredentialsEmailHtml({
      organizationName: data.name,
      adminEmail: adminOnboarding.email,
      password: generatePassword,
    });

    return data;
  }

  async findAll(params: {
    search?: string;
    page?: number;
    limit?: number;
    userId?: string;
    planId?: string;
    status?: 'active' | 'inactive';
  }) {
    const { search, page = 1, limit = 10, userId, planId, status } = params;
    const repo = this.dataSource.getRepository(Organization);
    const qb = repo
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.plan', 'plan')
      .leftJoinAndSelect('org.user', 'user')
      .orderBy('org.createdAt', 'DESC');

    if (search?.trim()) {
      qb.andWhere('LOWER(org.name) LIKE LOWER(:search)', {
        search: `%${search.trim()}%`,
      });
    }
    if (userId?.trim()) qb.andWhere('org.userId = :userId', { userId: userId.trim() });
    if (planId?.trim()) qb.andWhere('org.planId = :planId', { planId: planId.trim() });
    if (status === 'active') qb.andWhere('org.isActive = :active', { active: true });
    if (status === 'inactive') qb.andWhere('org.isActive = :active', { active: false });

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const org = await this.dataSource.getRepository(Organization).findOne({
      where: { id },
      relations: ['plan', 'user'],
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const repo = this.dataSource.getRepository(Organization);
    const org = await repo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');

    if (dto.name !== undefined && dto.name !== org.name) {
      const existing = await repo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('Organization name already exists');
    }

    if (dto.userId !== undefined && dto.userId) {
      const userExists = await this.dataSource.getRepository(User).findOne({
        where: { id: dto.userId },
      });
      if (!userExists) throw new BadRequestException('Invalid user ID');
    }
    if (dto.planId !== undefined && dto.planId) {
      const planExists = await this.dataSource.getRepository(Plan).findOne({
        where: { id: dto.planId },
      });
      if (!planExists) throw new BadRequestException('Invalid plan ID');
    }

    Object.assign(org, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.userId !== undefined && { userId: dto.userId ?? null }),
      ...(dto.planId !== undefined && { planId: dto.planId ?? null }),
      ...(dto.licenseCount !== undefined && { licenseCount: dto.licenseCount }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
    return repo.save(org);
  }

  async remove(id: string) {
    const repo = this.dataSource.getRepository(Organization);
    const org = await repo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    await repo.remove(org);
    return { deleted: true };
  }

  async getStats() {
    const repo = this.dataSource.getRepository(Organization);
    const active = await repo.count({ where: { isActive: true } });
    const inactive = await repo.count({ where: { isActive: false } });
    const totalSeats = await repo
      .createQueryBuilder('org')
      .select('COALESCE(SUM(org.licenseCount), 0)', 'sum')
      .getRawOne<{ sum: string }>();
    return {
      totalOrganizations: active + inactive,
      active,
      inactive,
      totalSeats: parseInt(totalSeats?.sum ?? '0', 10),
    };
  }

  async findAllForExport() {
    return this.dataSource.getRepository(Organization).find({
      relations: ['plan', 'user'],
      order: { createdAt: 'DESC' },
    });
  }
}
