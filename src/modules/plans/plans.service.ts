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
import { CreatePlanDto, GetPlansQueryDto, UpdatePlanDto } from './plans.dto';

@Injectable()
export class PlansService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private getRepository() {
    return this.dataSource.getRepository(Plan);
  }

  async create(body: CreatePlanDto, user: User) {
    const existing = await this.getRepository().findOne({ where: { name: body.name } });
    if (existing) {
      throw new ConflictException('Plan with this name already exists');
    }

    const description: string[] | null =
      body.description == null
        ? null
        : Array.isArray(body.description)
          ? body.description
          : [body.description];

    const plan = await this.getRepository().save({
      name: body.name,
      description: description ?? null,
      price: String(body.price ?? 0),
      isActive: body.isActive ?? true,
      pricePerUser: body.pricePerUser ?? 0,
      cycle: body.cycle ?? null,
      createdBy: user,
    });

    return this.findOne(plan.id);
  }

  async update(id: string, body: UpdatePlanDto) {
    const repo = this.getRepository();
    const plan = await repo.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    if (body.name !== undefined && body.name !== plan.name) {
      const existing = await repo.findOne({ where: { name: body.name } });
      if (existing) {
        throw new ConflictException('Plan with this name already exists');
      }
    }

    const description: string[] | null | undefined =
      body.description === undefined
        ? undefined
        : body.description == null
          ? null
          : Array.isArray(body.description)
            ? body.description
            : [body.description];
    Object.assign(plan, {
      ...(body.name !== undefined && { name: body.name }),
      ...(description !== undefined && { description }),
      ...(body.price !== undefined && { price: String(body.price) }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.pricePerUser !== undefined && { pricePerUser: body.pricePerUser }),
      ...(body.cycle !== undefined && { cycle: body.cycle ?? null }),
    });
    return await repo.save(plan);
  }

  async findAll(query: GetPlansQueryDto) {
    const qb = this.getRepository().createQueryBuilder('plan').orderBy('plan.price', 'ASC');

    if (query.isActive !== undefined && query.isActive !== '') {
      const active = query.isActive === 'true';
      qb.andWhere('plan.isActive = :isActive', { isActive: active });
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const plan = await this.getRepository()
      .createQueryBuilder('plan')
      .where('plan.id = :id', { id })
      .getOne();
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async remove(id: string) {
    console.log(id);
    const repo = this.getRepository();
    const plan = await repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan with ID not found`);

    const orgCount = await this.dataSource.getRepository(Organization).count({
      where: { planId: id },
    });
    if (orgCount > 0)
      throw new ConflictException(
        'Cannot delete plan with assigned organizations. Reassign organizations first.',
      );

    return await repo.remove(plan);
  }
}
