import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateUserRolesTable1742576609041 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '26',
            isPrimary: true,
          },
          { name: 'userId', type: 'char', length: '26' },
          { name: 'roleId', type: 'char', length: '26' },
          { name: 'addedById', type: 'char', length: '26', isNullable: true },
          { name: 'organizationId', type: 'char', length: '26', isNullable: true },
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
      'user_roles',
      new TableIndex({ columnNames: ['userId'], name: 'user_roles_userId_idx' }),
    );
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({ columnNames: ['roleId'], name: 'user_roles_roleId_idx' }),
    );
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({ columnNames: ['addedById'], name: 'user_roles_addedById_idx' }),
    );
    await queryRunner.createIndex(
      'user_roles',
      new TableIndex({ columnNames: ['organizationId'], name: 'user_roles_organizationId_idx' }),
    );
    await queryRunner.createUniqueConstraint(
      'user_roles',
      new TableUnique({
        name: 'user_roles_userId_roleId_key',
        columnNames: ['userId', 'roleId'],
      }),
    );

    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'user_roles',
      new TableForeignKey({
        columnNames: ['addedById'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
    // organizationId: add FK when organizations table exists; until then column only
    // await queryRunner.createForeignKey('user_roles', new TableForeignKey({ ... }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_roles');
    if (!table) return;
    for (const fk of table.foreignKeys) {
      await queryRunner.dropForeignKey('user_roles', fk);
    }
    const uniqueConstraint = table.uniques?.find((u) => u.name === 'user_roles_userId_roleId_key');
    if (uniqueConstraint) {
      await queryRunner.dropUniqueConstraint('user_roles', uniqueConstraint);
    }
    await queryRunner.dropTable('user_roles');
  }
}
