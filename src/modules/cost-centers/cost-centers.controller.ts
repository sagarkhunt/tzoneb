import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/auth.decorator';
import { UserRole } from '../../enums/user.enum';
import { ValidationPipe } from '../../pipes/validation.pipe';
import {
  CreateCostCenterDto,
  FindCostCentersQueryDto,
  UpdateCostCenterDto,
} from './cost-centers.dto';
import { CostCentersService } from './cost-centers.service';

@Controller()
@UsePipes(new ValidationPipe({ whitelist: true }))
@ApiTags('Cost Centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Post()
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @ApiBody({ type: CreateCostCenterDto })
  async create(@Body() dto: CreateCostCenterDto) {
    const data = await this.costCentersService.create(dto);
    return { data, message: 'Cost center created successfully' };
  }

  @Put(':id')
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  @ApiBody({ type: UpdateCostCenterDto })
  async update(@Param('id') id: string, @Body() dto: UpdateCostCenterDto) {
    const data = await this.costCentersService.update(id, dto);
    return { data, message: 'Cost center updated successfully' };
  }

  @Get()
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER])
  async findAll(@Query() query: FindCostCentersQueryDto) {
    const data = await this.costCentersService.findAll(query);
    return { data, message: 'Cost centers retrieved successfully' };
  }

  @Get(':id')
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.USER])
  async findOne(@Param('id') id: string) {
    const data = await this.costCentersService.findOne(id);
    return { data, message: 'Cost center retrieved successfully' };
  }

  @Delete(':id')
  @Auth([UserRole.ADMIN, UserRole.SUPER_ADMIN])
  async remove(@Param('id') id: string) {
    await this.costCentersService.remove(id);
    return { message: 'Cost center deleted successfully' };
  }
}
