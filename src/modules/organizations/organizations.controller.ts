import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/roles.constant';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from '@common/schemas/organization.schema';
import { FindOrganizationsQueryDto } from './dto/find-organizations-query.dto';
import { CreateOrganizationSwaggerDto, UpdateOrganizationSwaggerDto } from '@common/schemas/swagger';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiBody({ type: CreateOrganizationSwaggerDto })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 409, description: 'Organization name or admin email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid plan ID' })
  create(
    @Body(new ZodValidationPipe(CreateOrganizationSchema)) createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiResponse({ status: 200, description: 'Return organization stats' })
  getStats() {
    return this.organizationsService.getStats();
  }

  @Get('export')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Export all organizations for Excel' })
  @ApiResponse({ status: 200, description: 'Return all organizations' })
  exportAll() {
    return this.organizationsService.findAllForExport();
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get organizations with search, pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return paginated organizations' })
  findAll(@Query() query: FindOrganizationsQueryDto) {
    return this.organizationsService.findAll({
      search: query.search?.trim() || undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      planId: query.planId?.trim() || undefined,
      status: query.status,
    });
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Return organization with plan details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update organization' })
  @ApiBody({ type: UpdateOrganizationSwaggerDto })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 409, description: 'Name or admin email already exists' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateOrganizationSchema)) updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
