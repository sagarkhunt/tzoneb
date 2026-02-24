import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/roles.constant';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { CreateDepartmentSchema, UpdateDepartmentSchema, CreateDepartmentDto, UpdateDepartmentDto } from '@common/schemas/department.schema';
import { CreateDepartmentSwaggerDto, UpdateDepartmentSwaggerDto } from '@common/schemas/swagger';

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateDepartmentSchema))
  @ApiOperation({ summary: 'Create a new department' })
  @ApiBody({ type: CreateDepartmentSwaggerDto })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 409, description: 'Department name already exists' })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Return all departments' })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Return department' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update department' })
  @ApiBody({ type: UpdateDepartmentSwaggerDto })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateDepartmentSchema)) updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  @ApiResponse({ status: 409, description: 'Cannot delete department with assigned employees' })
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
