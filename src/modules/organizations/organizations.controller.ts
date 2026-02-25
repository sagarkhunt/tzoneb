import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/auth.decorator';
import { UserRole } from '../../enums/user.enum';
import { ValidationPipe } from '../../pipes/validation.pipe';
import {
  CreateOrganizationDto,
  FindOrganizationsQueryDto,
  UpdateOrganizationDto,
} from './organizations.dto';
import { OrganizationsService } from './organizations.service';
import { User } from 'src/database/entities/user.entity';
import { AuthUser } from 'src/decorators/user.decorator';

@Controller()
@UsePipes(new ValidationPipe({ whitelist: true }))
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Auth([UserRole.ADMIN])
  @ApiBody({ type: CreateOrganizationDto })
  async create(@Body() dto: CreateOrganizationDto, @AuthUser() user: User) {
    const data = await this.organizationsService.create(dto, user);
    return {
      data,
      message: 'Organization created successfully',
    };
  }

  @Put(':id')
  @Auth([UserRole.ADMIN])
  @ApiBody({ type: UpdateOrganizationDto })
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    const data = await this.organizationsService.update(id, dto);
    return {
      data,
      message: 'Organization updated successfully',
    };
  }

  @Get('stats')
  @Auth([UserRole.ADMIN, UserRole.USER])
  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiResponse({ status: 200, description: 'Return organization stats' })
  getStats() {
    return {
      data: this.organizationsService.getStats(),
      message: 'Organization stats retrieved successfully',
    };
  }

  @Get('export')
  @Auth([UserRole.ADMIN, UserRole.USER])
  @ApiOperation({ summary: 'Export all organizations' })
  @ApiResponse({ status: 200, description: 'Return all organizations' })
  exportAll() {
    return {
      data: this.organizationsService.findAllForExport(),
      message: 'Organizations exported successfully',
    };
  }

  @Get()
  @Auth([UserRole.ADMIN, UserRole.USER])
  @ApiOperation({ summary: 'Get organizations with search, pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return paginated organizations' })
  findAll(@Query() query: FindOrganizationsQueryDto) {
    return this.organizationsService.findAll({
      search: query.search?.trim() || undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      userId: query.userId?.trim() || undefined,
      planId: query.planId?.trim() || undefined,
      status: query.status,
    });
  }

  @Get(':id')
  @Auth([UserRole.ADMIN, UserRole.USER])
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Return organization with plan details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string) {
    return {
      data: this.organizationsService.findOne(id),
      message: 'Organization retrieved successfully',
    };
  }

  @Delete(':id')
  @Auth([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
