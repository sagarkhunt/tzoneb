import { Configuration, Value } from '@itgorillaz/configify';
import { IsNumber, IsString } from 'class-validator';

@Configuration()
export class AuthConfig {
  @Value('ACCESS_TOKEN_EXPIRY', { default: '15m' })
  @IsString()
  accessTokenExpiry: string;

  @Value('REFRESH_TOKEN_DAYS', { default: 7, parse: parseInt })
  @IsNumber()
  refreshTokenDays: number;

  @Value('JWT_REFRESH_SECRET', { default: 'default-refresh-secret-change-in-production' })
  @IsString()
  jwtRefreshSecret: string;

  @Value('JWT_REFRESH_EXPIRES_IN', { default: '7d' })
  @IsString()
  jwtRefreshExpiresIn: string;
}
