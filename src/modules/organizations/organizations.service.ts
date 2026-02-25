import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Organization } from '../../database/entities/organization.entity';
import { User } from '../../database/entities/user.entity';
import {
  CreateOrganizationDto,
  FindOrganizationsQueryDto,
  UpdateOrganizationDto,
} from './organizations.dto';
import { getAdminCredentialsEmailHtml } from 'src/templates/admin-organization';
import { RoleSlug } from 'src/enums/role.enum';
import { Role } from 'src/database/entities/role.entity';
import { UserRole as UserRoleEntity } from 'src/database/entities/user-role.entity';
import { BcryptService } from 'src/services/bcrypt.service';
import { generateSecurePassword } from 'src/services/password.util';
import { PurchasePlan } from 'src/database/entities/purchase-plan.entity';
import { Plan } from 'src/database/entities/plan.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly bcryptService: BcryptService,
  ) {}

  async create(body: CreateOrganizationDto, user: User) {
    const userRepo = this.dataSource.getRepository(User);
    const orgRepo = this.dataSource.getRepository(Organization);
    const roleRepo = this.dataSource.getRepository(Role);
    const userRoleRepo = this.dataSource.getRepository(UserRoleEntity);
    const purchasePlanRepo = this.dataSource.getRepository(PurchasePlan);
    const planRepo = this.dataSource.getRepository(Plan);

    const existingUser = await userRepo.findOne({
      where: { email: body.adminEmail.toLowerCase() },
    });
    if (existingUser) throw new ConflictException('Admin email already exists');

    const adminRole = await roleRepo.findOne({ where: { slug: RoleSlug.ADMIN } });
    if (!adminRole) throw new BadRequestException('Admin role not found');

    const password = generateSecurePassword();
    const admin = userRepo.create({
      email: body.adminEmail.toLowerCase(),
      password: this.bcryptService.hashSync(password),
      firstName: body.adminFirstName ?? null,
      lastName: body.adminLastName ?? null,
    });
    const savedAdmin = await userRepo.save(admin);

    await userRoleRepo.save({
      userId: savedAdmin.id,
      roleId: adminRole.id,
      addedById: null,
      organizationId: null,
    });

    const existingName = await orgRepo.findOne({ where: { name: body.name } });
    if (existingName) throw new ConflictException('Organization name already exists');

    const org = orgRepo.create({
      name: body.name,
      userId: savedAdmin.id,
      licenseCount: body.licenseCount ?? 0,
      isActive: body.isActive ?? true,
    });
    const savedOrg = await orgRepo.save(org);

    const plan = await planRepo.findOne({ where: { id: body.planId } });
    if (!plan) throw new BadRequestException('Invalid plan ID');

    await purchasePlanRepo.save({
      organizationId: savedOrg.id,
      planId: body.planId,
      userId: savedAdmin.id,
      createdById: user.id,
    });

    // await getAdminCredentialsEmailHtml({
    //   organizationName: savedOrg.name,
    //   adminEmail: savedAdmin.email,
    //   password,
    // });

    return this.findOne(savedOrg.id);
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const repo = this.dataSource.getRepository(Organization);
    const org = await repo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');

    if (dto.name !== undefined && dto.name !== org.name) {
      const existing = await repo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('Organization name already exists');
    }

    Object.assign(org, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.licenseCount !== undefined && { licenseCount: dto.licenseCount }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
    return repo.save(org);
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
      .leftJoinAndSelect('org.purchasePlans', 'purchasePlans', 'purchasePlans.deletedAt IS NULL')
      .leftJoinAndSelect('purchasePlans.plan', 'plan')
      .leftJoinAndSelect('org.user', 'user')
      .orderBy('org.createdAt', 'DESC');

    if (search?.trim()) {
      qb.andWhere('LOWER(org.name) LIKE LOWER(:search)', {
        search: `%${search.trim()}%`,
      });
    }
    if (userId?.trim()) qb.andWhere('org.userId = :userId', { userId: userId.trim() });
    if (planId?.trim()) {
      qb.innerJoin(
        'org.purchasePlans',
        'ppFilter',
        'ppFilter.planId = :planId AND ppFilter.deletedAt IS NULL',
      );
      qb.setParameter('planId', planId.trim());
      qb.distinct(true);
    }
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
      relations: ['purchasePlans', 'purchasePlans.plan', 'user'],
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
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
      relations: ['purchasePlans', 'purchasePlans.plan', 'user'],
      order: { createdAt: 'DESC' },
    });
  }
}
