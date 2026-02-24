import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@database/prisma.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '@common/constants/roles.constant';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles?.map((ur: any) => ur.role.name) || [],
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: payload.roles,
      },
    };
  }

  async register(email: string, password: string, firstName?: string, lastName?: string) {
    const user = await this.usersService.create(email, password, firstName, lastName);

    // Assign default 'employee' role
    const employeeRole = await this.prisma.role.findUnique({ where: { name: UserRole.EMPLOYEE } });
    if (employeeRole) {
      await this.usersService.assignRole(user.id, employeeRole.id);
    }

    const { password: _, ...result } = user;
    return this.login(result);
  }

  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });

    // Generate new tokens
    const { password: _, ...user } = tokenRecord.user;
    return this.login(user);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    } else {
      // Logout from all devices
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      },
    );

    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }
}
