import { RoleSlug } from 'src/enums/role.enum';

/**
 * Initial users to seed: super admin and admin.
 * Matches tzoneb copy Prisma seed. Passwords can be overridden via env (SUPER_ADMIN_PASSWORD).
 */
export const INITIAL_USERS_SEED = [
  {
    email: 'superadmin@tzone.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
    firstName: 'Super',
    lastName: 'Admin',
    roleSlug: RoleSlug.SUPER_ADMIN,
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    roleSlug: RoleSlug.ADMIN,
  },
] as const;

export type InitialUserRoleSlug = (typeof INITIAL_USERS_SEED)[number]['roleSlug'];
