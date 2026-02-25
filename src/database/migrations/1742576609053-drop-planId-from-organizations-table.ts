import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPlanIdFromOrganizationsTable1742576609053
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('organizations');
    if (!table) return;
    const planFk = table.foreignKeys.find((k) => k.columnNames.indexOf('planid') !== -1);
    if (planFk) await queryRunner.dropForeignKey('organizations', planFk);
    await queryRunner.dropColumn('organizations', 'planid');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD "planid" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD CONSTRAINT "FK_organizations_plan" FOREIGN KEY ("planid") REFERENCES "plans"("id") ON DELETE SET NULL`,
    );
  }
}
