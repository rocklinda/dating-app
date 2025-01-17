import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUniqueMatchUserConstraint1737015140424
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      ` ALTER TABLE matches ADD CONSTRAINT unique_match_user UNIQUE (user1_id, user2_id);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE matches DROP CONSTRAINT unique_match_user;`,
    );
  }
}
