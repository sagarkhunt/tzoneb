import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/auth.decorator';
import { UserRole } from '../../enums/user.enum';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { CreatePlanDto, GetPlansQueryDto, UpdatePlanDto } from './plans.dto';
import { PlansService } from './plans.service';
import { User } from 'src/database/entities/user.entity';
import { AuthUser } from 'src/decorators/user.decorator';

@Controller()
@UsePipes(new ValidationPipe({ whitelist: true }))
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @Auth([UserRole.SUPER_ADMIN, UserRole.ADMIN])
  @ApiBody({ type: CreatePlanDto })
  async create(@Body() dto: CreatePlanDto, @AuthUser() user: User) {
    const data = await this.plansService.create(dto, user);
    return { data, message: 'Plan created successfully' };
  }

  @Put(':id')
  @Auth([UserRole.ADMIN])
  @ApiOperation({ summary: 'Update plan' })
  @ApiBody({ type: UpdatePlanDto })
  async update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    const data = await this.plansService.update(id, dto);
    return { data, message: 'Plan updated successfully' };
  }

  @Get()
  @Auth([UserRole.ADMIN, UserRole.USER])
  @ApiOperation({ summary: 'List plans' })
  async findAll(@Query() query: GetPlansQueryDto) {
    const data = await this.plansService.findAll(query);
    return { data, message: 'Plans fetched successfully' };
  }

  @Get(':id')
  @Auth([UserRole.ADMIN, UserRole.USER])
  async findOne(@Param('id') id: string) {
    const data = await this.plansService.findOne(id);
    return { data, message: 'Plan fetched successfully' };
  }

  @Delete(':id')
  @Auth([UserRole.ADMIN])
  @ApiOperation({ summary: 'Delete plan' })
  async remove(@Param('id') id: string) {
    await this.plansService.remove(id);
    return { message: 'Plan deleted successfully' };
  }
}
