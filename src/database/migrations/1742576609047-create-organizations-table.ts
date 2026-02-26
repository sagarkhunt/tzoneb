import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrganizationsTable1742576609047 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'organizations',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '26',
            isPrimary: true,
          },
          { name: 'name', type: 'text' },
          {
            name: 'orgId',
            type: 'text',
            isUnique: true,
            isNullable: false,
          },
          { name: 'userId', type: 'char', length: '26', isNullable: true },
          { name: 'planid', type: 'char', length: '26', isNullable: true },
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

    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS organizations_org_id_seq START 1`);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_organization_org_id()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW."orgId" IS NULL OR NEW."orgId" = '' THEN
          NEW."orgId" := 'ORG-' || LPAD(nextval('organizations_org_id_seq')::text, 3, '0');
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    await queryRunner.query(`DROP TRIGGER IF EXISTS organizations_org_id_trigger ON organizations`);
    await queryRunner.query(`
      CREATE TRIGGER organizations_org_id_trigger
      BEFORE INSERT ON organizations
      FOR EACH ROW EXECUTE FUNCTION set_organization_org_id()
    `);

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
    await queryRunner.query(`DROP TRIGGER IF EXISTS organizations_org_id_trigger ON organizations`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_organization_org_id()`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS organizations_org_id_seq`);
    const planFk = table.foreignKeys.find((k) => k.columnNames.indexOf('planid') !== -1);
    if (planFk) await queryRunner.dropForeignKey('organizations', planFk);
    const userFk = table.foreignKeys.find((k) => k.columnNames.indexOf('userId') !== -1);
    if (userFk) await queryRunner.dropForeignKey('organizations', userFk);
    await queryRunner.dropTable('organizations');
  }
}
