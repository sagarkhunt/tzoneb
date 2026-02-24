import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FindUsersQueryDto {
  @ApiProperty({ required: false, description: 'Filter users by name or email' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  search?: string;

  @ApiProperty({ required: false, description: 'Page number (1-based)', minimum: 1, maximum: 9999 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(9999)
  page?: number;

  @ApiProperty({ required: false, description: 'Items per page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ required: false, description: 'Filter by role ID' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  roleId?: string;

  @ApiProperty({ required: false, description: 'Filter by department ID' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  departmentId?: string;

  @ApiProperty({ required: false, enum: ['active', 'inactive'], description: 'Filter by user status' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
