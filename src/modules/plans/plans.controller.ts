import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/roles.constant';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';
import { CreatePlanSchema, UpdatePlanSchema, CreatePlanDto, UpdatePlanDto } from '@common/schemas/plan.schema';
import { CreatePlanSwaggerDto, UpdatePlanSwaggerDto } from '@common/schemas/swagger';

@ApiTags('Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiBody({ type: CreatePlanSwaggerDto })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 409, description: 'Plan name already exists' })
  create(@Body(new ZodValidationPipe(CreatePlanSchema)) createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'Return all plans' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Return plan' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update plan' })
  @ApiBody({ type: UpdatePlanSwaggerDto })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdatePlanSchema)) updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 409, description: 'Cannot delete plan with assigned organizations' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
