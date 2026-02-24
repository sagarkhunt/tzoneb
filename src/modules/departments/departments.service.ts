import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '@common/schemas/department.schema';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw new ConflictException('Department with this name already exists');
    }

    return this.prisma.department.create({ data });
  }

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: string, data: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    if (data.name && data.name !== department.name) {
      const existing = await this.prisma.department.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException('Department with this name already exists');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    if (department._count.employees > 0) {
      throw new ConflictException(
        'Cannot delete department with assigned employees. Reassign employees first.',
      );
    }

    return this.prisma.department.delete({ where: { id } });
  }
}
