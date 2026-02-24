import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentSwaggerDto {
  @ApiProperty({ description: 'Department name (min 2 characters)' })
  name: string;

  @ApiPropertyOptional({ description: 'Department description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the department is active', default: true })
  isActive?: boolean;
}

export class UpdateDepartmentSwaggerDto {
  @ApiPropertyOptional({ description: 'Department name (min 2 characters)' })
  name?: string;

  @ApiPropertyOptional({ description: 'Department description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the department is active' })
  isActive?: boolean;
}
