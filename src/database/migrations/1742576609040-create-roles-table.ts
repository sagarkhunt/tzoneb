import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRolesTable1742576609040 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v1()',
          },
          { name: 'role', type: 'varchar', isUnique: true },
          { name: 'slug', type: 'varchar', isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'parentRoleId', type: 'uuid', isNullable: true },
          {
            name: 'deletedAt',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({ columnNames: ['role'], name: 'roles_role_idx' }),
    );
    await queryRunner.createIndex(
      'roles',
      new TableIndex({ columnNames: ['slug'], name: 'roles_slug_idx' }),
    );

    await queryRunner.createForeignKey(
      'roles',
      new TableForeignKey({
        columnNames: ['parentRoleId'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('roles');
    if (!table) return;
    const fk = table.foreignKeys.find((k) => k.columnNames.indexOf('parentRoleId') !== -1);
    if (fk) await queryRunner.dropForeignKey('roles', fk);
    await queryRunner.dropTable('roles');
  }
}
