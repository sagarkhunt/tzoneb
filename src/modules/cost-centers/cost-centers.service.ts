import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CostCenter } from '../../database/entities/cost-center.entity';
import { CreateCostCenterDto } from './cost-centers.dto';

@Injectable()
export class CostCentersService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private getRepo() {
    return this.dataSource.getRepository(CostCenter);
  }

  async create(body: CreateCostCenterDto) {
    const repo = this.getRepo();
    const existing = await repo.findOne({
      where: { code: body.code, organizationId: body.organizationId },
    });
    if (existing) {
      throw new ConflictException('Cost center with this code already exists in this organization');
    }

    const cc = repo.create({
      code: body.code,
      name: body.name,
      departmentId: body.departmentId ?? null,
      organizationId: body.organizationId,
    });
    const saved = await repo.save(cc);
    return this.findOne(saved.id);
  }

  async update(id: string, body: { code?: string; name?: string; departmentId?: string }) {
    const repo = this.getRepo();
    const cc = await repo.findOne({ where: { id } });
    if (!cc) throw new NotFoundException('Cost center not found');

    if (body.code !== undefined && body.code !== cc.code) {
      const existing = await repo.findOne({
        where: { code: body.code, organizationId: cc.organizationId },
      });
      if (existing) throw new ConflictException('Cost center with this code already exists');
    }

    Object.assign(cc, {
      ...(body.code !== undefined && { code: body.code }),
      ...(body.name !== undefined && { name: body.name }),
      ...(body.departmentId !== undefined && { departmentId: body.departmentId ?? null }),
    });
    await repo.save(cc);
    return this.findOne(id);
  }

  async findAll(query: {
    search?: string;
    organizationId?: string;
    departmentId?: string;
    limit?: number;
    cursor?: string;
  }) {
    const { search, organizationId, departmentId, limit = 10, cursor } = query;
    const repo = this.getRepo();
    const qb = repo
      .createQueryBuilder('cc')
      .leftJoinAndSelect('cc.department', 'department')
      .leftJoinAndSelect('cc.organization', 'organization')
      .orderBy('cc.createdAt', 'DESC')
      .addOrderBy('cc.id', 'DESC')
      .take((limit ?? 10) + 1);

    if (search?.trim()) {
      qb.andWhere('(LOWER(cc.name) LIKE LOWER(:search) OR LOWER(cc.code) LIKE LOWER(:search))', {
        search: `%${search.trim()}%`,
      });
    }
    if (organizationId?.trim()) {
      qb.andWhere('cc.organizationId = :organizationId', { organizationId: organizationId.trim() });
    }
    if (departmentId?.trim()) {
      qb.andWhere('cc.departmentId = :departmentId', { departmentId: departmentId.trim() });
    }
    if (cursor?.trim()) {
      const cursorCc = await repo.findOne({ where: { id: cursor }, select: ['id', 'createdAt'] });
      if (cursorCc) {
        qb.andWhere('(cc.createdAt, cc.id) < (:cursorCreatedAt, :cursorId)', {
          cursorCreatedAt: cursorCc.createdAt,
          cursorId: cursorCc.id,
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
    const cc = await this.getRepo().findOne({
      where: { id },
      relations: ['department', 'organization'],
    });
    if (!cc) throw new NotFoundException('Cost center not found');
    return cc;
  }

  async remove(id: string) {
    const repo = this.getRepo();
    const cc = await repo.findOne({ where: { id } });
    if (!cc) throw new NotFoundException('Cost center not found');
    await repo.softRemove(cc);
    return { deleted: true };
  }
}
