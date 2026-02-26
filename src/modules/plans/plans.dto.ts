import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Plan description as text or array of feature strings (stored as JSON when array)',
  })
  @IsOptional()
  description?: string | string[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'Price per user' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerUser?: number;

  @ApiPropertyOptional({ default: 1, description: 'Users allowed per plan' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  userPerPlan?: number;

  @ApiPropertyOptional({ description: 'Billing cycle (e.g. monthly, yearly)' })
  @IsOptional()
  @IsString()
  cycle?: string;
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}

export class GetPlansQueryDto {
  @ApiPropertyOptional({ enum: ['true', 'false'], description: 'Filter by active status' })
  @IsOptional()
  @IsString()
  isActive?: string;
}
