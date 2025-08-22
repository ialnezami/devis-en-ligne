import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class Add2FAFields1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 2FA fields to users table
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'twoFactorEnabled',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'twoFactorSecret',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'backupCodes',
        type: 'text',
        isArray: true,
        default: '{}',
        isNullable: true,
      }),
      new TableColumn({
        name: 'recoveryToken',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'recoveryTokenExpiresAt',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);

    // Add indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_users_twoFactorEnabled" ON "users" ("twoFactorEnabled");
      CREATE INDEX "IDX_users_recoveryToken" ON "users" ("recoveryToken");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`
      DROP INDEX "IDX_users_twoFactorEnabled";
      DROP INDEX "IDX_users_recoveryToken";
    `);

    // Remove 2FA columns
    await queryRunner.dropColumns('users', [
      'twoFactorEnabled',
      'twoFactorSecret',
      'backupCodes',
      'recoveryToken',
      'recoveryTokenExpiresAt',
    ]);
  }
}
