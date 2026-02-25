import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPricePerUserCycleToPlansTable1742576609051 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'plans',
      new TableColumn({
        name: 'pricePerUser',
        type: 'integer',
        default: 0,
        isNullable: false,
      }),
    );
    await queryRunner.addColumn(
      'plans',
      new TableColumn({
        name: 'cycle',
        type: 'text',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('plans', 'pricePerUser');
    await queryRunner.dropColumn('plans', 'cycle');
  }
}
