import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from 'typeorm';

export class CreatePermissionTable1742576609042 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'permission',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '26',
            isPrimary: true,
          },
          { name: 'module', type: 'varchar' },
          { name: 'action', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
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
      'permission',
      new TableIndex({ columnNames: ['module'], name: 'permission_module_idx' }),
    );
    await queryRunner.createIndex(
      'permission',
      new TableIndex({ columnNames: ['action'], name: 'permission_action_idx' }),
    );
    await queryRunner.createUniqueConstraint(
      'permission',
      new TableUnique({
        name: 'permission_module_action_key',
        columnNames: ['module', 'action'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('permission');
    if (!table) return;
    const unique = table.uniques?.find((u) => u.name === 'permission_module_action_key');
    if (unique) await queryRunner.dropUniqueConstraint('permission', unique);
    await queryRunner.dropTable('permission');
  }
}
