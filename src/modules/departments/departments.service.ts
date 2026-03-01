import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Department } from '../../database/entities/department.entity';
import { CreateDepartmentDto } from './departments.dto';

@Injectable()
export class DepartmentsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private getRepo() {
    return this.dataSource.getRepository(Department);
  }

  async create(body: CreateDepartmentDto) {
    const repo = this.getRepo();
    const existing = await repo.findOne({
      where: { name: body.name, organizationId: body.organizationId },
    });
    if (existing) {
      throw new ConflictException('Department with this name already exists in this organization');
    }

    const dept = repo.create({
      name: body.name,
      managerId: body.managerId ?? null,
      annualBudget: String(body.annualBudget ?? 0),
      costCenterId: body.costCenterId ?? null,
      organizationId: body.organizationId,
    });
    const saved = await repo.save(dept);
    return this.findOne(saved.id);
  }

  async update(
    id: string,
    body: { name?: string; managerId?: string; annualBudget?: number; costCenterId?: string },
  ) {
    const repo = this.getRepo();
    const dept = await repo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');

    if (body.name !== undefined && body.name !== dept.name) {
      const existing = await repo.findOne({
        where: { name: body.name, organizationId: dept.organizationId },
      });
      if (existing) throw new ConflictException('Department with this name already exists');
    }

    Object.assign(dept, {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.managerId !== undefined && { managerId: body.managerId ?? null }),
      ...(body.annualBudget !== undefined && { annualBudget: String(body.annualBudget) }),
      ...(body.costCenterId !== undefined && { costCenterId: body.costCenterId ?? null }),
    });
    await repo.save(dept);
    return this.findOne(id);
  }

  async findAll(query: {
    search?: string;
    organizationId?: string;
    limit?: number;
    cursor?: string;
  }) {
    const { search, organizationId, limit = 10, cursor } = query;
    const repo = this.getRepo();
    const qb = repo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.manager', 'manager')
      .leftJoinAndSelect('d.costCenter', 'costCenter')
      .leftJoinAndSelect('d.organization', 'organization')
      .orderBy('d.createdAt', 'DESC')
      .addOrderBy('d.id', 'DESC')
      .take((limit ?? 10) + 1);

    if (search?.trim()) {
      qb.andWhere('LOWER(d.name) LIKE LOWER(:search)', { search: `%${search.trim()}%` });
    }
    if (organizationId?.trim()) {
      qb.andWhere('d.organizationId = :organizationId', { organizationId: organizationId.trim() });
    }
    if (cursor?.trim()) {
      const cursorDept = await repo.findOne({ where: { id: cursor }, select: ['id', 'createdAt'] });
      if (cursorDept) {
        qb.andWhere('(d.createdAt, d.id) < (:cursorCreatedAt, :cursorId)', {
          cursorCreatedAt: cursorDept.createdAt,
          cursorId: cursorDept.id,
        });
      }
    }

    const items = await qb.getMany();
    const hasNext = items.length > limit;
    if (hasNext) items.pop();
    const nextCursor = hasNext && items.length ? items[items.length - 1]?.id : null;

    return {
      results: items,
      nextCursor,
      hasNext: !!nextCursor,
      limit: limit ?? 10,
    };
  }

  async findOne(id: string) {
    const dept = await this.getRepo().findOne({
      where: { id },
      relations: ['manager', 'costCenter', 'organization'],
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async remove(id: string) {
    const repo = this.getRepo();
    const dept = await repo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');
    await repo.softRemove(dept);
    return { deleted: true };
  }
}
