/**
 * Roles to seed into the `roles` table.
 * Matches tzoneb copy Prisma seed: role (display name), slug (machine name), description.
 */
export const ROLES_SEED = [
  { role: 'Super Admin', slug: 'super_admin', description: 'Super Administrator with full system access' },
  { role: 'Admin', slug: 'admin', description: 'Administrator role with user management access' },
  { role: 'Manager', slug: 'manager', description: 'Manager role with employee management access' },
  { role: 'Finance', slug: 'finance', description: 'Finance role with financial data access' },
  { role: 'Company', slug: 'company', description: 'Company role with organization-level access' },
  { role: 'Employee', slug: 'employee', description: 'Employee role with basic user access' },
] as const;

export type RoleSeedSlug = (typeof ROLES_SEED)[number]['slug'];
