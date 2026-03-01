import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(26, 26)
  managerId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualBudget?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(26, 26)
  costCenterId?: string;

  @ApiProperty()
  @IsString()
  @Length(26, 26)
  @IsNotEmpty()
  organizationId: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}

export class FindDepartmentsQueryDto {
  @ApiPropertyOptional({ description: 'Search by department name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by organization ID' })
  @IsOptional()
  @IsString()
  @Length(26, 26)
  organizationId?: string;

  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;
}
