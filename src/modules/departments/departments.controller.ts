import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/auth.decorator';
import { UserRole } from '../../enums/user.enum';
import { ValidationPipe } from '../../pipes/validation.pipe';
import {
  CreateDepartmentDto,
  FindDepartmentsQueryDto,
  UpdateDepartmentDto,
} from './departments.dto';
import { DepartmentsService } from './departments.service';

@Controller()
@UsePipes(new ValidationPipe({ whitelist: true }))
@ApiTags('Departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @ApiBody({ type: CreateDepartmentDto })
  async create(@Body() dto: CreateDepartmentDto) {
    const data = await this.departmentsService.create(dto);
    return { data, message: 'Department created successfully' };
  }

  @Put(':id')
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @ApiBody({ type: UpdateDepartmentDto })
  async update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    const data = await this.departmentsService.update(id, dto);
    return { data, message: 'Department updated successfully' };
  }

  @Get()
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER])
  async findAll(@Query() query: FindDepartmentsQueryDto) {
    const data = await this.departmentsService.findAll(query);
    return { data, message: 'Departments retrieved successfully' };
  }

  @Get(':id')
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER])
  async findOne(@Param('id') id: string) {
    const data = await this.departmentsService.findOne(id);
    return { data, message: 'Department retrieved successfully' };
  }

  @Delete(':id')
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async remove(@Param('id') id: string) {
    await this.departmentsService.remove(id);
    return { message: 'Department deleted successfully' };
  }
}
