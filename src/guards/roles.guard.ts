import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { UserRole } from '../enums/user.enum';

const ROLE_TO_SLUGS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['admin', 'super_admin'],
  [UserRole.SUPER_ADMIN]: ['super_admin'],
  [UserRole.USER]: ['employee', 'user', 'manager', 'company', 'finance'],
};

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = request.user as { roles?: string[]; email?: string } | undefined;

    if (user) {
      const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
      if (!requiredRoles || requiredRoles.length === 0) return true;
      const userSlugs = user.roles ?? [];
      const hasAccess = requiredRoles.some((r) =>
        ROLE_TO_SLUGS[r]?.some((slug) => userSlugs.includes(slug)),
      );
      if (!hasAccess) {
        this.logger.debug(
          `Forbidden: user ${user.email} has roles [${userSlugs.join(', ')}], ` +
            `required one of [${requiredRoles.join(', ')}]`,
        );
        throw new ForbiddenException(
          `Insufficient permissions. Required role: ${requiredRoles.join(' or ')}.`,
        );
      }
      return true;
    }

    const allowed = this.reflector.get<boolean>('allowed', context.getHandler());
    if (allowed) return allowed;

    return false;
  }
}
