import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { SWIPE_TYPE } from '../../common/constants';

export class CreateUserSwipeActivitiesTable1737006518504
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_swipe_activities',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_id',
            type: 'varchar(36)',
          },
          {
            name: 'swiped_user_id',
            type: 'varchar(36)',
          },
          {
            name: 'swipe_type',
            type: 'enum',
            enum: SWIPE_TYPE,
            default: '"PASS"',
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
        indices: [
          new TableIndex({
            columnNames: ['user_id'],
          }),
          new TableIndex({
            columnNames: ['swiped_user_id'],
          }),
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_swipe_activities', true);
  }
}
