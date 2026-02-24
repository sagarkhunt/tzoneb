import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@common/constants/roles.constant';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get users with search, pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return paginated users' })
  findAll(@Query() query: FindUsersQueryDto) {
    return this.usersService.findAll({
      search: query.search?.trim() || undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      roleId: query.roleId?.trim() || undefined,
      departmentId: query.departmentId?.trim() || undefined,
      status: query.status,
    });
  }

  @Get('roles')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Return all roles' })
  getRoles() {
    return this.usersService.findAllRoles();
  }

  @Get('export')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Export all users for Excel' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  exportAll() {
    return this.usersService.findAllForExport();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':userId/roles/:roleId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  assignRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.usersService.assignRole(userId, roleId);
  }

  @Delete(':userId/roles/:roleId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.usersService.removeRole(userId, roleId);
  }
}
