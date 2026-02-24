import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '@common/schemas/employee.schema';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateEmployeeDto) {
    // Check email uniqueness
    const existingEmployee = await this.prisma.superAdminEmployee.findUnique({
      where: { email: data.email },
    });
    if (existingEmployee) {
      throw new ConflictException('Employee with this email already exists');
    }

    // Validate role exists
    const role = await this.prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) {
      throw new BadRequestException(`Role with ID ${data.roleId} not found`);
    }

    // Validate department exists
    const department = await this.prisma.department.findUnique({
      where: { id: data.departmentId },
    });
    if (!department) {
      throw new BadRequestException(`Department with ID ${data.departmentId} not found`);
    }

    // Validate manager exists (if provided)
    if (data.managerId) {
      const manager = await this.prisma.superAdminEmployee.findUnique({
        where: { id: data.managerId },
      });
      if (!manager) {
        throw new BadRequestException(`Manager with ID ${data.managerId} not found`);
      }
    }

    return this.prisma.superAdminEmployee.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        roleId: data.roleId,
        departmentId: data.departmentId,
        managerId: data.managerId || null,
      },
      include: {
        role: true,
        department: true,
        manager: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.superAdminEmployee.findMany({
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
        department: {
          select: { id: true, name: true },
        },
        manager: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { subordinates: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.superAdminEmployee.findUnique({
      where: { id },
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
        department: {
          select: { id: true, name: true },
        },
        manager: {
          select: { id: true, fullName: true, email: true },
        },
        subordinates: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: string, data: UpdateEmployeeDto) {
    const employee = await this.prisma.superAdminEmployee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== employee.email) {
      const existingEmployee = await this.prisma.superAdminEmployee.findUnique({
        where: { email: data.email },
      });
      if (existingEmployee) {
        throw new ConflictException('Employee with this email already exists');
      }
    }

    // Validate role exists if roleId is being updated
    if (data.roleId) {
      const role = await this.prisma.role.findUnique({ where: { id: data.roleId } });
      if (!role) {
        throw new BadRequestException(`Role with ID ${data.roleId} not found`);
      }
    }

    // Validate department exists if departmentId is being updated
    if (data.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!department) {
        throw new BadRequestException(`Department with ID ${data.departmentId} not found`);
      }
    }

    // Validate manager exists if managerId is being updated
    if (data.managerId) {
      if (data.managerId === id) {
        throw new BadRequestException('Employee cannot be their own manager');
      }
      const manager = await this.prisma.superAdminEmployee.findUnique({
        where: { id: data.managerId },
      });
      if (!manager) {
        throw new BadRequestException(`Manager with ID ${data.managerId} not found`);
      }
    }

    return this.prisma.superAdminEmployee.update({
      where: { id },
      data,
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
        department: {
          select: { id: true, name: true },
        },
        manager: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async remove(id: string) {
    const employee = await this.prisma.superAdminEmployee.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subordinates: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    if (employee._count.subordinates > 0) {
      throw new ConflictException(
        'Cannot delete employee who is a manager of other employees. Reassign subordinates first.',
      );
    }

    return this.prisma.superAdminEmployee.delete({ where: { id } });
  }

  /**
   * Get all employees that can be managers (for the Manager dropdown)
   */
  async findAllManagers() {
    return this.prisma.superAdminEmployee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }
}
