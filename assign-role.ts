import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'sagarkhunt4521@gmail.com';
  const roleName = 'super_admin';

  let role = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        name: roleName,
        description: 'Super Administrator',
      },
    });
    console.log(`Created role: ${roleName}`);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User with email ${email} not found`);
    return;
  }

  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId: user.id,
      roleId: role.id,
    },
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    });
    console.log(`Assigned role ${roleName} to ${email}`);
  } else {
    console.log(`User ${email} already has role ${roleName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
