import { MigrationInterface, QueryRunner } from "typeorm";

export class PublishDateNullableTrue1691000400271 implements MigrationInterface {
    name = 'PublishDateNullableTrue1691000400271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`publicacion\` DROP COLUMN \`resumen\``);
        await queryRunner.query(`ALTER TABLE \`publicacion\` ADD \`resumen\` varchar(110) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`fecha\` \`fecha\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`fecha\` \`fecha\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` DROP COLUMN \`resumen\``);
        await queryRunner.query(`ALTER TABLE \`publicacion\` ADD \`resumen\` varchar(90) NOT NULL`);
    }

}
