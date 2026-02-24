import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { Role } from '../database/entities/role.entity';
import { ROLES_SEED } from '../database/seeds/data/roles.seed';

@Command({
  name: 'seed-roles',
  description: 'Seed the roles table from database/seeds/data/roles.seed.ts',
})
@Injectable()
export class SeedRolesCommand extends CommandRunner {
  private readonly logger = new Logger(SeedRolesCommand.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async run(): Promise<void> {
    const repo = this.dataSource.getRepository(Role);
    this.logger.log('Seeding roles...');

    for (const row of ROLES_SEED) {
      const existing = await repo.findOne({ where: { slug: row.slug } });
      if (existing) {
        existing.role = row.role;
        existing.description = row.description ?? null;
        await repo.save(existing);
        this.logger.log(`Role "${row.slug}" already exists, updated.`);
      } else {
        const entity = repo.create({
          role: row.role,
          slug: row.slug,
          description: row.description ?? null,
        });
        await repo.save(entity);
        this.logger.log(`Created role: ${row.role} (${row.slug})`);
      }
    }

    this.logger.log('Roles seeded successfully.');
  }
}
