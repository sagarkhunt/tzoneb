import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrganizationsTable1742576609047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'organizations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v1()',
          },
          { name: 'name', type: 'text' },
          { name: 'userId', type: 'uuid', isNullable: true },
          { name: 'planid', type: 'uuid', isNullable: true },
          { name: 'licenseCount', type: 'integer', default: 0 },
          { name: 'isActive', type: 'boolean', default: true },
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

    await queryRunner.createForeignKey(
      'organizations',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'organizations',
      new TableForeignKey({
        columnNames: ['planid'],
        referencedTableName: 'plans',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('organizations');
    if (!table) return;
    const planFk = table.foreignKeys.find((k) => k.columnNames.indexOf('planid') !== -1);
    if (planFk) await queryRunner.dropForeignKey('organizations', planFk);
    const userFk = table.foreignKeys.find((k) => k.columnNames.indexOf('userId') !== -1);
    if (userFk) await queryRunner.dropForeignKey('organizations', userFk);
    await queryRunner.dropTable('organizations');
  }
}
