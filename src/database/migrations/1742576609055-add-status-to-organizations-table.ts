import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStatusToOrganizationsTable1742576609055 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'organizations',
      new TableColumn({
        name: 'status',
        type: 'varchar',
        length: '20',
        default: "'active'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('organizations', 'status');
  }
}
