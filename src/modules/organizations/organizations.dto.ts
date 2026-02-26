import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  adminEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminFirstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adminLastName?: string;

  @ApiProperty({ description: 'Plan ID for the organization purchase' })
  @IsString()
  @Length(26, 26)
  @IsNotEmpty()
  planId: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  licenseCount?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateOrganizationDto extends PartialType(
  OmitType(CreateOrganizationDto, ['adminEmail', 'adminFirstName', 'adminLastName']),
) {}

export class FindOrganizationsQueryDto {
  @ApiPropertyOptional({ description: 'Search by organization name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Cursor for pagination (id of last item from previous response)',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by plan ID' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], description: 'Filter by status' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
