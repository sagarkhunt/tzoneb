import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class CreateCostCenterTable1742576609057 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cost_center',
        columns: [
          { name: 'id', type: 'char', length: '26', isPrimary: true },
          { name: 'code', type: 'varchar', length: '50', isUnique: false, isNullable: false },
          { name: 'name', type: 'text', isNullable: false },
          { name: 'departmentId', type: 'char', length: '26', isNullable: true },
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
      'cost_center',
      new TableForeignKey({
        columnNames: ['departmentId'],
        referencedTableName: 'department',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
    await queryRunner.createForeignKey(
      'cost_center',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.addColumn(
      'department',
      new TableColumn({
        name: 'costCenterId',
        type: 'char',
        length: '26',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'department',
      new TableForeignKey({
        columnNames: ['costCenterId'],
        referencedTableName: 'cost_center',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const deptTable = await queryRunner.getTable('department');
    const ccTable = await queryRunner.getTable('cost_center');

    if (deptTable) {
      const costCenterFk = deptTable.foreignKeys.find(
        (k) => k.columnNames.indexOf('costCenterId') !== -1,
      );
      if (costCenterFk) await queryRunner.dropForeignKey('department', costCenterFk);
      await queryRunner.dropColumn('department', 'costCenterId');
    }

    if (ccTable) {
      for (const fk of ccTable.foreignKeys) {
        await queryRunner.dropForeignKey('cost_center', fk);
      }
      await queryRunner.dropTable('cost_center');
    }
  }
}
