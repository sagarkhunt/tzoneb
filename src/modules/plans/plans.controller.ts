import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/auth.decorator';
import { UserRole } from '../../enums/user.enum';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { CreatePlanDto, UpdatePlanDto } from './plans.dto';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@ApiBearerAuth()
@Auth()
@Controller('plans')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Auth([UserRole.ADMIN])
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiBody({ type: CreatePlanDto })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  @ApiResponse({ status: 409, description: 'Plan with this name already exists' })
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Get()
  @Auth([UserRole.ADMIN, UserRole.USER])
  @ApiOperation({ summary: 'Get all plans' })
  @ApiResponse({ status: 200, description: 'Return all plans with organization count' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @Auth([UserRole.ADMIN, UserRole.USER])
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Return plan with organization count' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @Auth([UserRole.ADMIN])
  @ApiOperation({ summary: 'Update plan' })
  @ApiBody({ type: UpdatePlanDto })
  @ApiResponse({ status: 200, description: 'Plan updated successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 409, description: 'Plan name already exists' })
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @Auth([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete plan' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete plan with assigned organizations' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
