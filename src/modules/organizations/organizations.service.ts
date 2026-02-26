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

    const userRole = userRoleRepo.create({
      userId: savedAdmin.id,
      roleId: adminRole.id,
      addedById: null,
      organizationId: null,
    });
    await userRoleRepo.save(userRole);

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

    const purchasePlan = purchasePlanRepo.create({
      organizationId: savedOrg.id,
      planId: body.planId,
      userId: savedAdmin.id,
      createdBy: user,
    });
    await purchasePlanRepo.save(purchasePlan);

    // await getAdminCredentialsEmailHtml({
    //   organizationName: savedOrg.name,
    //   adminEmail: savedAdmin.email,
    //   password,
    // });

    return this.findOne(savedOrg.id);
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const orgRepo = this.dataSource.getRepository(Organization);
    const purchasePlanRepo = this.dataSource.getRepository(PurchasePlan);
    const planRepo = this.dataSource.getRepository(Plan);

    const org = await orgRepo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');

    if (dto.name !== undefined && dto.name !== org.name) {
      const existing = await orgRepo.findOne({ where: { name: dto.name } });
      if (existing) throw new ConflictException('Organization name already exists');
    }

    if (dto.planId !== undefined) {
      const plan = await planRepo.findOne({ where: { id: dto.planId } });
      if (!plan) throw new BadRequestException('Invalid plan ID');

      const activePurchase = await purchasePlanRepo.findOne({
        where: { organizationId: id },
      });
      if (activePurchase) {
        await purchasePlanRepo.update(activePurchase.id, { planId: dto.planId });
      } else if (org.userId) {
        const purchasePlan = purchasePlanRepo.create({
          organizationId: id,
          planId: dto.planId,
          userId: org.userId,
          createdBy: null,
        });
        await purchasePlanRepo.save(purchasePlan);
      }
    }

    Object.assign(org, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.licenseCount !== undefined && { licenseCount: dto.licenseCount }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    });
    return orgRepo.save(org);
  }

  async findAll(query: FindOrganizationsQueryDto) {
    const { search, cursor, limit = 10, userId, planId, status } = query;
    const repo = this.dataSource.getRepository(Organization);

    const qb = repo
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.purchasePlans', 'purchasePlans', 'purchasePlans.deletedAt IS NULL')
      .leftJoinAndSelect('purchasePlans.plan', 'plan')
      .leftJoinAndSelect('org.user', 'user')
      .orderBy('org.createdAt', 'DESC')
      .addOrderBy('org.id', 'DESC')
      .take(limit + 1);

    if (search?.trim()) {
      qb.andWhere('LOWER(org.name) LIKE LOWER(:search)', {
        search: `%${search.trim()}%`,
      });
    }
    if (userId?.trim()) {
      qb.andWhere('org.userId = :userId', { userId: userId.trim() });
    }
    if (planId?.trim()) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM purchass_plan pp WHERE pp."organizationId" = org.id AND pp."planId" = :planId AND pp."deletedAt" IS NULL)',
        { planId: planId.trim() },
      );
    }
    if (status === 'active') qb.andWhere('org.isActive = :active', { active: true });
    if (status === 'inactive') qb.andWhere('org.isActive = :active', { active: false });

    if (cursor?.trim()) {
      const cursorOrg = await repo.findOne({
        where: { id: cursor.trim() },
        select: ['id', 'createdAt'],
      });
      if (cursorOrg) {
        qb.andWhere('(org.createdAt, org.id) < (:cursorCreatedAt, :cursorId)', {
          cursorCreatedAt: cursorOrg.createdAt,
          cursorId: cursorOrg.id,
        });
      }
    }

    const items = await qb.getMany();
    const hasNext = items.length > limit;
    if (hasNext) items.pop();

    const lastItem = items[items.length - 1];
    const nextCursor = hasNext && lastItem ? lastItem.id : null;

    const results = items.map((org) => {
      const { purchasePlans, ...rest } = org;
      const sorted = (purchasePlans || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      const plan = sorted[0]?.plan ?? null;
      return { ...rest, plan };
    });

    return {
      results,
      nextCursor,
      hasNext: !!nextCursor,
      limit,
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

  async findAllForExport() {
    const orgs = await this.dataSource.getRepository(Organization).find({
      relations: ['purchasePlans', 'purchasePlans.plan', 'user'],
      order: { createdAt: 'DESC' },
    });
    return orgs.map((org) => {
      const { purchasePlans, ...rest } = org;
      const sorted = (purchasePlans || []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      const plan = sorted[0]?.plan ?? null;
      return { ...rest, plan };
    });
  }
}
