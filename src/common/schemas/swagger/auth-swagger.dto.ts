import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginSwaggerDto {
  @ApiProperty({ description: 'User email address', example: 'superadmin@tzone.com' })
  email: string;

  @ApiProperty({ description: 'User password', example: 'SuperAdmin@123' })
  password: string;
}

import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterSwaggerDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password (min 8 chars, must include uppercase, lowercase, and number)',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ description: 'First name', minLength: 2 })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', minLength: 2 })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class RefreshTokenSwaggerDto {
  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;
}

export class LogoutSwaggerDto {
  @ApiPropertyOptional({ description: 'Refresh token to invalidate (optional)' })
  refreshToken?: string;
}
