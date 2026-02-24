import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DropOrganizationsAdminEmail1742576609048 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('organizations');
    const column = table?.findColumnByName('adminEmail');
    if (column) {
      await queryRunner.dropColumn('organizations', 'adminEmail');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'organizations',
      new TableColumn({
        name: 'adminEmail',
        type: 'text',
        isNullable: true,
      }),
    );
  }
}
