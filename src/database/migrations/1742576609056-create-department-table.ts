import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateDepartmentTable1742576609056 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'department',
        columns: [
          { name: 'id', type: 'char', length: '26', isPrimary: true },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'managerId', type: 'char', length: '26', isNullable: true },
          { name: 'annualBudget', type: 'decimal', precision: 15, scale: 2, default: 0 },
          { name: 'organizationId', type: 'char', length: '26', isNullable: false },
          { name: 'deletedAt', type: 'timestamp with time zone', isNullable: true },
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
      'department',
      new TableForeignKey({
        columnNames: ['managerId'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'department',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('department');
    if (!table) return;
    for (const fk of table.foreignKeys) {
      await queryRunner.dropForeignKey('department', fk);
    }
    await queryRunner.dropTable('department');
  }
}
