import { UserRole, RoleSlug } from '../../../enums/role.enum';

/**
 * Roles to seed into the `roles` table.
 * Uses RoleSlug and UserRole enums for consistency.
 */
export const ROLES_SEED = [
  {
    role: UserRole.SUPER_ADMIN,
    slug: RoleSlug.SUPER_ADMIN,
    description: 'Super Administrator with full system access',
  },
  {
    role: UserRole.ADMIN,
    slug: RoleSlug.ADMIN,
    description: 'Administrator role with user management access',
  },
  {
    role: UserRole.MANAGER,
    slug: RoleSlug.MANAGER,
    description: 'Manager role with employee management access',
  },
  {
    role: UserRole.FINANCE,
    slug: RoleSlug.FINANCE,
    description: 'Finance role with financial data access',
  },
  {
    role: UserRole.COMPANY,
    slug: RoleSlug.COMPANY,
    description: 'Company role with organization-level access',
  },
  {
    role: UserRole.EMPLOYEE,
    slug: RoleSlug.EMPLOYEE,
    description: 'Employee role with basic user access',
  },
] as const;

export type RoleSeedSlug = (typeof ROLES_SEED)[number]['slug'];
