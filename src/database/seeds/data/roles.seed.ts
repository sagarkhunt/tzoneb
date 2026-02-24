import { RoleName, RoleSlug } from '../../../enums/role.enum';

/**
 * Roles to seed into the `roles` table.
 * Uses RoleSlug and RoleName enums for consistency.
 */
export const ROLES_SEED = [
  {
    role: RoleName.SUPER_ADMIN,
    slug: RoleSlug.SUPER_ADMIN,
    description: 'Super Administrator with full system access',
  },
  {
    role: RoleName.ADMIN,
    slug: RoleSlug.ADMIN,
    description: 'Administrator role with user management access',
  },
  {
    role: RoleName.MANAGER,
    slug: RoleSlug.MANAGER,
    description: 'Manager role with employee management access',
  },
  {
    role: RoleName.FINANCE,
    slug: RoleSlug.FINANCE,
    description: 'Finance role with financial data access',
  },
  {
    role: RoleName.COMPANY,
    slug: RoleSlug.COMPANY,
    description: 'Company role with organization-level access',
  },
  {
    role: RoleName.EMPLOYEE,
    slug: RoleSlug.EMPLOYEE,
    description: 'Employee role with basic user access',
  },
] as const;

export type RoleSeedSlug = (typeof ROLES_SEED)[number]['slug'];
