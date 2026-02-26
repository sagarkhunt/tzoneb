import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
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

  @Get('export')
  @Auth([UserRole.ADMIN, UserRole.USER])
  async exportAll() {
    return {
      data: await this.organizationsService.findAllForExport(),
      message: 'Organizations exported successfully',
    };
  }

  @Get()
  @Auth([UserRole.ADMIN, UserRole.USER])
  async findAll(@Query() query: FindOrganizationsQueryDto) {
    const data = await this.organizationsService.findAll(query);
    return {
      data,
      message: 'Organizations retrieved successfully',
    };
  }

  @Get(':id')
  @Auth([UserRole.ADMIN, UserRole.USER])
  async findOne(@Param('id') id: string) {
    const data = await this.organizationsService.findOne(id);
    return {
      data,
      message: 'Organization retrieved successfully',
    };
  }

  @Delete(':id')
  @Auth([UserRole.ADMIN])
  async remove(@Param('id') id: string) {
    await this.organizationsService.remove(id);
    return { message: 'Organization deleted successfully' };
  }
}
