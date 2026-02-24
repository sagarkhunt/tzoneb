import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { UserRole } from '../enums/user.enum';

const ROLE_TO_SLUGS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['admin', 'super_admin'],
  [UserRole.USER]: ['employee', 'user', 'manager', 'company', 'finance'],
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const user = request.user as { roles?: string[] } | undefined;

    if (user) {
      const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());
      if (!requiredRoles || requiredRoles.length === 0) return true;
      const userSlugs = user.roles ?? [];
      return requiredRoles.some((r) =>
        ROLE_TO_SLUGS[r]?.some((slug) => userSlugs.includes(slug)),
      );
    }

    const allowed = this.reflector.get<boolean>('allowed', context.getHandler());
    if (allowed) return allowed;

    return false;
  }
}
