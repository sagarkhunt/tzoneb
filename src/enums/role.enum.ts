/**
 * Role slugs matching seeded roles in database/seeds/data/roles.seed.ts
 */
export enum RoleSlug {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  FINANCE = 'finance',
  COMPANY = 'company',
  EMPLOYEE = 'employee',
}

/**
 * Display names for roles (for UI / API responses)
 */
export enum RoleName {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  FINANCE = 'Finance',
  COMPANY = 'Company',
  EMPLOYEE = 'Employee',
}
