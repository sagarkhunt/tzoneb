import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateRolePermissionTable1742576609043 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'role_permission',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v1()',
          },
          { name: 'roleId', type: 'uuid' },
          { name: 'permissionId', type: 'uuid' },
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
      'role_permission',
      new TableIndex({ columnNames: ['roleId'], name: 'role_permission_roleId_idx' }),
    );
    await queryRunner.createIndex(
      'role_permission',
      new TableIndex({ columnNames: ['permissionId'], name: 'role_permission_permissionId_idx' }),
    );
    await queryRunner.createUniqueConstraint(
      'role_permission',
      new TableUnique({
        name: 'role_permission_roleId_permissionId_key',
        columnNames: ['roleId', 'permissionId'],
      }),
    );

    await queryRunner.createForeignKey(
      'role_permission',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'role_permission',
      new TableForeignKey({
        columnNames: ['permissionId'],
        referencedTableName: 'permission',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('role_permission');
    if (!table) return;
    for (const fk of table.foreignKeys) {
      await queryRunner.dropForeignKey('role_permission', fk);
    }
    const unique = table.uniques?.find((u) => u.name === 'role_permission_roleId_permissionId_key');
    if (unique) await queryRunner.dropUniqueConstraint('role_permission', unique);
    await queryRunner.dropTable('role_permission');
  }
}
