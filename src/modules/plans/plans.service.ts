import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreatePlanDto, UpdatePlanDto } from '@common/schemas/plan.schema';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePlanDto) {
    const existing = await this.prisma.plan.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('Plan with this name already exists');
    }

    return this.prisma.plan.create({ data });
  }

  async findAll() {
    return this.prisma.plan.findMany({
      include: {
        _count: {
          select: { organizations: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { organizations: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    return plan;
  }

  async update(id: string, data: UpdatePlanDto) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    if (data.name && data.name !== plan.name) {
      const existing = await this.prisma.plan.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException('Plan with this name already exists');
      }
    }

    return this.prisma.plan.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { organizations: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }

    if (plan._count.organizations > 0) {
      throw new ConflictException(
        'Cannot delete plan with assigned organizations. Reassign organizations first.',
      );
    }

    return this.prisma.plan.delete({ where: { id } });
  }
}
