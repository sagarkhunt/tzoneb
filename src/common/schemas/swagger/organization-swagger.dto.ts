import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationSwaggerDto {
  @ApiProperty({ description: 'Organization name (min 2 characters)' })
  name: string;

  @ApiProperty({ description: 'Admin email address' })
  adminEmail: string;

  @ApiProperty({ description: 'Plan ID (UUID)' })
  planId: string;

  @ApiPropertyOptional({ description: 'License count', default: 1, minimum: 1 })
  licenseCount?: number;
}

export class UpdateOrganizationSwaggerDto {
  @ApiPropertyOptional({ description: 'Organization name (min 2 characters)' })
  name?: string;

  @ApiPropertyOptional({ description: 'Admin email address' })
  adminEmail?: string;

  @ApiPropertyOptional({ description: 'Plan ID (UUID)' })
  planId?: string;

  @ApiPropertyOptional({ description: 'License count', minimum: 1 })
  licenseCount?: number;

  @ApiPropertyOptional({ description: 'Whether the organization is active' })
  isActive?: boolean;
}
