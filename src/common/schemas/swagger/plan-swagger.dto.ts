import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanSwaggerDto {
  @ApiProperty({ description: 'Plan name (min 2 characters)' })
  name: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Plan price', minimum: 0 })
  price?: number;

  @ApiPropertyOptional({ description: 'Whether the plan is active', default: true })
  isActive?: boolean;
}

export class UpdatePlanSwaggerDto {
  @ApiPropertyOptional({ description: 'Plan name (min 2 characters)' })
  name?: string;

  @ApiPropertyOptional({ description: 'Plan description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Plan price', minimum: 0 })
  price?: number;

  @ApiPropertyOptional({ description: 'Whether the plan is active' })
  isActive?: boolean;
}
