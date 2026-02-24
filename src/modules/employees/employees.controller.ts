import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/roles.constant';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '@common/schemas/employee.schema';
import { CreateEmployeeSwaggerDto, UpdateEmployeeSwaggerDto } from '@common/schemas/swagger';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiBody({ type: CreateEmployeeSwaggerDto })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid role, department, or manager ID' })
  create(@Body(new ZodValidationPipe(CreateEmployeeSchema)) createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Return all employees with role, department, and manager details' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Get('managers')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all active employees for manager dropdown' })
  @ApiResponse({ status: 200, description: 'Return list of employees (id, fullName, email) for manager selection' })
  findAllManagers() {
    return this.employeesService.findAllManagers();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Return employee with full details' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update employee' })
  @ApiBody({ type: UpdateEmployeeSwaggerDto })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateEmployeeSchema)) updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete employee with subordinates' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
