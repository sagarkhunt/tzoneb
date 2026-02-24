import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { join } from 'path';

// Load env - process.cwd() is project root when running "npm run prisma:seed"
config({ path: join(process.cwd(), 'src', '.env') });
config({ path: join(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create all 6 roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Super Administrator with full system access',
      permissions: {
        all: ['*'],
      },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator role with user management access',
      permissions: {
        users: ['create', 'read', 'update', 'delete'],
        roles: ['read'],
        resources: ['create', 'read', 'update', 'delete'],
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Manager role with employee management access',
      permissions: {
        employees: ['create', 'read', 'update'],
        reports: ['read'],
        resources: ['read', 'update'],
      },
    },
  });

  const financeRole = await prisma.role.upsert({
    where: { name: 'finance' },
    update: {},
    create: {
      name: 'finance',
      description: 'Finance role with financial data access',
      permissions: {
        transactions: ['create', 'read', 'update', 'delete'],
        reports: ['read', 'export'],
        invoices: ['create', 'read', 'update'],
      },
    },
  });

  const companyRole = await prisma.role.upsert({
    where: { name: 'company' },
    update: {},
    create: {
      name: 'company',
      description: 'Company role with organization-level access',
      permissions: {
        company: ['read', 'update'],
        employees: ['read'],
        resources: ['read'],
      },
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      description: 'Employee role with basic user access',
      permissions: {
        profile: ['read', 'update'],
        resources: ['read'],
      },
    },
  });

  // Create departments
  const departments = [
    { name: 'Engineering', description: 'Software development and engineering' },
    { name: 'Marketing', description: 'Marketing and communications' },
    { name: 'Sales', description: 'Sales and business development' },
    { name: 'Human Resources', description: 'HR and people management' },
    { name: 'Finance', description: 'Financial operations and accounting' },
    { name: 'Operations', description: 'Business operations and logistics' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: {
        name: dept.name,
        description: dept.description,
      },
    });
  }

  // Create plans
  const plans = [
    { name: 'Basic', description: 'Basic plan with limited features', price: 9.99 },
    { name: 'Professional', description: 'Professional plan with advanced features', price: 29.99 },
    { name: 'Enterprise', description: 'Enterprise plan with full access and priority support', price: 99.99 },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
      },
    });
  }

  // Create super admin user (update password on re-seed to fix stale hashes)
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
  const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 10);
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@tzone.com' },
    update: {
      password: hashedSuperAdminPassword,
      isActive: true,
    },
    create: {
      email: 'superadmin@tzone.com',
      password: hashedSuperAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
    },
  });

  // Assign super admin role to super admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });

  // Create admin user (for backward compatibility)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('Database seeded successfully!');
  console.log('\n=== Created Departments ===');
  departments.forEach((dept, i) => console.log(`${i + 1}. ${dept.name} - ${dept.description}`));
  console.log('\n=== Created Plans ===');
  plans.forEach((plan, i) => console.log(`${i + 1}. ${plan.name} - $${plan.price}/mo - ${plan.description}`));
  console.log('\n=== Created Roles ===');
  console.log('1. super_admin - Full system access');
  console.log('2. admin - User and resource management');
  console.log('3. manager - Employee management');
  console.log('4. finance - Financial data management');
  console.log('5. company - Organization-level access');
  console.log('6. employee - Basic user access');
  console.log('\n=== Created Users ===');
  console.log('Super Admin:');
  console.log('  Email: superadmin@tzone.com');
  console.log('  Password:', superAdminPassword === 'SuperAdmin@123' ? 'SuperAdmin@123 (default)' : '[from env]');
  console.log('\nAdmin User:');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
