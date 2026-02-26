import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserPerPlanToPlansTable1742576609054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'plans',
      new TableColumn({
        name: 'userPerPlan',
        type: 'integer',
        default: 1,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('plans', 'userPerPlan');
  }
}
