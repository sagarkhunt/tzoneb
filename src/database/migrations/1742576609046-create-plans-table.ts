import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePlansTable1742576609046 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'plans',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '26',
            isPrimary: true,
          },
          { name: 'name', type: 'text' },
          { name: 'description', type: 'text', isArray: true, isNullable: true },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdBy', type: 'char', length: '26', isNullable: true },
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
      'plans',
      new TableForeignKey({
        columnNames: ['createdBy'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('plans');
    if (!table) return;
    const fk = table.foreignKeys.find((k) => k.columnNames.indexOf('createdBy') !== -1);
    if (fk) await queryRunner.dropForeignKey('plans', fk);
    await queryRunner.dropTable('plans');
  }
}
