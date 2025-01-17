import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { ACCOUNT_TYPE, SEX_TYPE } from '../../common/constants';

export class CreateUsersTable1736929551810 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'email',
            type: 'varchar(100)',
          },
          {
            name: 'phone',
            type: 'varchar(100)',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar(250)',
          },
          {
            name: 'sex',
            type: 'enum',
            enum: SEX_TYPE,
            default: '"MALE"',
          },
          {
            name: 'account_type',
            type: 'enum',
            enum: ACCOUNT_TYPE,
            default: '"FREE"',
          },
          {
            name: 'password',
            type: 'varchar(60)',
          },
          {
            name: 'daily_swipe_count',
            type: 'int',
            default: '0',
          },
          {
            name: 'last_swipe_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true);
  }
}
