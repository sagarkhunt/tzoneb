import { Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { Role } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { ROLES_SEED } from '../database/seeds/data/roles.seed';
import { INITIAL_USERS_SEED } from '../database/seeds/data/initial-users.seed';
import { BcryptService } from '../services/bcrypt.service';

@Command({
  name: 'seed-initial',
  description: 'Seed roles, super admin and admin users (mirrors Prisma seed)',
})
export class SeedInitialCommand extends CommandRunner {
  private readonly logger = new Logger(SeedInitialCommand.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly bcryptService: BcryptService,
  ) {
    super();
  }

  async run(): Promise<void> {
    const roleRepo = this.dataSource.getRepository(Role);
    const userRepo = this.dataSource.getRepository(User);
    const userRoleRepo = this.dataSource.getRepository(UserRole);

    this.logger.log('Seeding roles...');
    for (const row of ROLES_SEED) {
      const existing = await roleRepo.findOne({ where: { slug: row.slug } });
      if (existing) {
        existing.role = row.role;
        existing.description = row.description ?? null;
        await roleRepo.save(existing);
        this.logger.log(`Role "${row.slug}" already exists, updated.`);
      } else {
        const entity = roleRepo.create({
          role: row.role,
          slug: row.slug,
          description: row.description ?? null,
        });
        await roleRepo.save(entity);
        this.logger.log(`Created role: ${row.role} (${row.slug})`);
      }
    }

    this.logger.log('Seeding initial users (super admin, admin)...');
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

    for (const row of INITIAL_USERS_SEED) {
      const password = row.roleSlug === 'super_admin' ? superAdminPassword : row.password;
      const hashedPassword = this.bcryptService.hashSync(password);

      let user = await userRepo.findOne({ where: { email: row.email } });
      if (user) {
        user.firstName = row.firstName;
        user.lastName = row.lastName;
        user.password = hashedPassword;
        await userRepo.save(user);
        this.logger.log(`User "${row.email}" already exists, updated.`);
      } else {
        user = userRepo.create({
          email: row.email,
          password: hashedPassword,
          firstName: row.firstName,
          lastName: row.lastName,
        });
        user = await userRepo.save(user);
        this.logger.log(`Created user: ${row.email}`);
      }

      const role = await roleRepo.findOneBy({ slug: row.roleSlug });
      if (!role) {
        this.logger.warn(`Role "${row.roleSlug}" not found, skipping user_role for ${row.email}`);
        continue;
      }

      const existingUr = await userRoleRepo.findOne({
        where: { userId: user.id, roleId: role.id },
      });
      if (!existingUr) {
        await userRoleRepo.save({
          userId: user.id,
          roleId: role.id,
          addedById: null,
          organizationId: null,
        });
        this.logger.log(`Assigned role ${row.roleSlug} to ${row.email}`);
      }
    }

    this.logger.log('Seed complete.');
    this.logger.log(
      'Super Admin: superadmin@tzone.com / ' +
        (process.env.SUPER_ADMIN_PASSWORD ? '[from env]' : 'SuperAdmin@123'),
    );
    this.logger.log('Admin: admin@example.com / admin123');
  }
}
