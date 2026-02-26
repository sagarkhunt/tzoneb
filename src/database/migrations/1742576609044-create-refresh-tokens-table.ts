import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRefreshTokensTable1742576609044 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '26',
            isPrimary: true,
          },
          { name: 'token', type: 'text' },
          { name: 'userId', type: 'char', length: '26' },
          {
            name: 'expiresAt',
            type: 'timestamp with time zone',
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({ columnNames: ['userId'], name: 'refresh_tokens_userId_idx' }),
    );
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({ columnNames: ['token'], name: 'refresh_tokens_token_idx' }),
    );

    await queryRunner.createForeignKey(
      'refresh_tokens',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('refresh_tokens');
    if (!table) return;
    for (const fk of table.foreignKeys) {
      await queryRunner.dropForeignKey('refresh_tokens', fk);
    }
    await queryRunner.dropTable('refresh_tokens');
  }
}
