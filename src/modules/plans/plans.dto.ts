import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'User ID of the creator' })
  @IsOptional()
  @IsUUID()
  createdBy?: string;
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
