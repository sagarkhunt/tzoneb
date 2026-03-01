import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateCostCenterDto {
  @ApiProperty({ description: 'Cost center code (e.g. CC-XXX)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(26, 26)
  departmentId?: string;

  @ApiProperty()
  @IsString()
  @Length(26, 26)
  @IsNotEmpty()
  organizationId: string;
}

export class UpdateCostCenterDto extends PartialType(CreateCostCenterDto) {}

export class FindCostCentersQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or code' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by organization ID' })
  @IsOptional()
  @IsString()
  @Length(26, 26)
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @IsOptional()
  @IsString()
  @Length(26, 26)
  departmentId?: string;

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
