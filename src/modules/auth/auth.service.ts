import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthConfig } from '../../config/auth.config';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { User } from '../../database/entities/user.entity';
import { BcryptService } from '../../services/bcrypt.service';
import { OAuthPayload } from '../../types/jwt';
import { LoginDto, SignupDto } from './auth.dto';

type UserWithRoles = User & { userRoles?: { role: { role: string } }[] };

@Injectable()
export class AuthService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
    private readonly authConfig: AuthConfig,
  ) {}

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = await this.jwtService.signAsync({ sub: userId, type: 'refresh' }, {
      secret: this.authConfig.jwtRefreshSecret,
      expiresIn: this.authConfig.jwtRefreshExpiresIn,
      algorithm: 'HS256',
    } as Parameters<JwtService['signAsync']>[1]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.authConfig.refreshTokenDays);

    const refreshTokenEntity = this.dataSource.getRepository(RefreshToken).create({
      token,
      userId,
      expiresAt,
    });
    await this.dataSource.getRepository(RefreshToken).save(refreshTokenEntity);

    return token;
  }

  async signup(body: SignupDto) {
    const u = await this.dataSource.getRepository(User).findOneBy({
      email: body.email,
    });

    if (u) throw new BadRequestException('Already signed up. Please login to continue');

    const user = this.dataSource.getRepository(User).create({
      ...body,
      password: this.bcryptService.hashSync(body.password),
    });

    return await this.dataSource.getRepository(User).save(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.dataSource.getRepository(User).findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
      },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) throw new BadRequestException('User not found');

    if (!this.bcryptService.compareSync(password, user.password)) {
      throw new BadRequestException('Invalid password');
    }

    return this.issueTokensForUser(user as UserWithRoles);
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.dataSource.getRepository(RefreshToken).findOne({
      where: { token: refreshToken },
      relations: ['user', 'user.userRoles', 'user.userRoles.role'],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.dataSource.getRepository(RefreshToken).delete({ id: tokenRecord.id });

    const user = tokenRecord.user as UserWithRoles;
    return this.issueTokensForUser(user);
  }

  private async issueTokensForUser(user: UserWithRoles) {
    const roles = this.getUserRoles(user);
    const signOptions = { expiresIn: this.authConfig.accessTokenExpiry } as Parameters<
      JwtService['signAsync']
    >[1];

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
          roles,
        } as OAuthPayload & { roles: string[] },
        signOptions,
      ),
      this.generateRefreshToken(user.id),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
    };
  }

  private getUserRoles(user: UserWithRoles): string[] {
    return user.userRoles?.map((ur) => ur.role.role) ?? [];
  }

  async logout(user: User) {
    await this.dataSource.getRepository(RefreshToken).delete({ userId: user.id });
  }
}
