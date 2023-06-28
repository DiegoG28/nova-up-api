import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1687982239688 implements MigrationInterface {
    name = 'InitialMigration1687982239688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`alumno\` ADD \`test\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`alumno\` DROP COLUMN \`test\``);
    }

}
