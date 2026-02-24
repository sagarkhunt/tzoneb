import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectDataSource } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { OAuthPayload } from '../../types/jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: readFileSync(join(process.cwd(), 'jwt.key')),
      algorithms: ['ES256'],
    });
  }

  async validate(payload: OAuthPayload) {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { id: payload.id },
      select: { id: true, email: true, firstName: true, lastName: true },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) throw new UnauthorizedException();

    const roles =
      (user as User & { userRoles?: { role: { slug: string } }[] }).userRoles
        ?.map((ur) => ur.role?.slug)
        .filter(Boolean) ?? [];
    return { ...user, roles };
  }
}
