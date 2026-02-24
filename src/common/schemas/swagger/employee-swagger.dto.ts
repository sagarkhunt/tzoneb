import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeSwaggerDto {
  @ApiProperty({ description: 'Full name (min 2 characters)' })
  fullName: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Role ID (UUID)' })
  roleId: string;

  @ApiProperty({ description: 'Department ID (UUID)' })
  departmentId: string;

  @ApiPropertyOptional({ description: 'Manager ID (UUID)', nullable: true })
  managerId?: string | null;
}

export class UpdateEmployeeSwaggerDto {
  @ApiPropertyOptional({ description: 'Full name (min 2 characters)' })
  fullName?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  email?: string;

  @ApiPropertyOptional({ description: 'Role ID (UUID)' })
  roleId?: string;

  @ApiPropertyOptional({ description: 'Department ID (UUID)' })
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Manager ID (UUID)', nullable: true })
  managerId?: string | null;

  @ApiPropertyOptional({ description: 'Whether the employee is active' })
  isActive?: boolean;
}
