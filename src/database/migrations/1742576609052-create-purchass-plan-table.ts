import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePurchassPlanTable1742576609052 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'purchass_plan',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '26',
            isPrimary: true,
          },
          { name: 'organizationId', type: 'char', length: '26', isNullable: false },
          { name: 'planId', type: 'char', length: '26', isNullable: false },
          { name: 'userId', type: 'char', length: '26', isNullable: false },
          { name: 'createdBy', type: 'char', length: '26', isNullable: true },
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

    await queryRunner.createForeignKey(
      'purchass_plan',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'purchass_plan',
      new TableForeignKey({
        columnNames: ['planId'],
        referencedTableName: 'plans',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'purchass_plan',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'purchass_plan',
      new TableForeignKey({
        columnNames: ['createdBy'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('purchass_plan');
    if (!table) return;
    const fks = table.foreignKeys;
    for (const fk of fks) {
      await queryRunner.dropForeignKey('purchass_plan', fk);
    }
    await queryRunner.dropTable('purchass_plan');
  }
}
