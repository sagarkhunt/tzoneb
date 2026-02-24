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
import { CreatePlanDto, UpdatePlanDto } from './plans.dto';

@Injectable()
export class PlansService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(data: CreatePlanDto) {
    const repo = this.dataSource.getRepository(Plan);
    const existing = await repo.findOne({ where: { name: data.name } });
    if (existing) {
      throw new ConflictException('Plan with this name already exists');
    }
    if (data.createdBy) {
      const userExists = await this.dataSource.getRepository(User).findOne({
        where: { id: data.createdBy },
      });
      if (!userExists) throw new BadRequestException('Invalid createdBy user ID');
    }
    const description: string[] | null =
      data.description == null
        ? null
        : Array.isArray(data.description)
          ? data.description
          : [data.description];
    return repo.save(
      repo.create({
        name: data.name,
        description,
        price: String(data.price ?? 0),
        isActive: data.isActive ?? true,
        createdById: data.createdBy ?? null,
      }),
    );
  }

  async findAll() {
    return this.dataSource
      .getRepository(Plan)
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.createdBy', 'createdBy')
      .loadRelationCountAndMap('plan.organizationsCount', 'plan.organizations')
      .orderBy('plan.name', 'ASC')
      .getMany();
  }

  async findOne(id: string) {
    const plan = await this.dataSource
      .getRepository(Plan)
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.createdBy', 'createdBy')
      .loadRelationCountAndMap('plan.organizationsCount', 'plan.organizations')
      .where('plan.id = :id', { id })
      .getOne();
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: string, data: UpdatePlanDto) {
    const repo = this.dataSource.getRepository(Plan);
    const plan = await repo.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    if (data.name !== undefined && data.name !== plan.name) {
      const existing = await repo.findOne({ where: { name: data.name } });
      if (existing) {
        throw new ConflictException('Plan with this name already exists');
      }
    }
    if (data.createdBy !== undefined && data.createdBy) {
      const userExists = await this.dataSource.getRepository(User).findOne({
        where: { id: data.createdBy },
      });
      if (!userExists) throw new BadRequestException('Invalid createdBy user ID');
    }
    const description: string[] | null | undefined =
      data.description === undefined
        ? undefined
        : data.description == null
          ? null
          : Array.isArray(data.description)
            ? data.description
            : [data.description];
    Object.assign(plan, {
      ...(data.name !== undefined && { name: data.name }),
      ...(description !== undefined && { description }),
      ...(data.price !== undefined && { price: String(data.price) }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.createdBy !== undefined && { createdById: data.createdBy ?? null }),
    });
    return repo.save(plan);
  }

  async remove(id: string) {
    const repo = this.dataSource.getRepository(Plan);
    const plan = await repo.findOne({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    const orgCount = await this.dataSource.getRepository(Organization).count({
      where: { planId: id },
    });
    if (orgCount > 0) {
      throw new ConflictException(
        'Cannot delete plan with assigned organizations. Reassign organizations first.',
      );
    }
    await repo.remove(plan);
    return { deleted: true };
  }
}
