import { MigrationInterface, QueryRunner } from "typeorm";

export class ExcludePostAsset1689877602394 implements MigrationInterface {
    name = 'ExcludePostAsset1689877602394'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`recurso\` DROP FOREIGN KEY \`FK_0271858854b96137befdd4e1963\``);
        await queryRunner.query(`ALTER TABLE \`recurso\` CHANGE \`id_publicacion\` \`id_publicacion\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_3628e9894c4b014d61a01cb21dd\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_62b68676176f06eeabb8a361a99\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`correo\` \`correo\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD UNIQUE INDEX \`IDX_349ecb64acc4355db443ca17cb\` (\`correo\`)`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`id_rol\` \`id_rol\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`id_departamento\` \`id_departamento\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` DROP FOREIGN KEY \`FK_b62df2c1cdb9126f37647d90025\``);
        await queryRunner.query(`ALTER TABLE \`publicacion\` DROP FOREIGN KEY \`FK_b0cd676ac183ff45644252a0265\``);
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`fecha_evento\` \`fecha_evento\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`comentario\` \`comentario\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`id_categoria\` \`id_categoria\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`id_usuario\` \`id_usuario\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`registro\` DROP FOREIGN KEY \`FK_eaad2b562da213947ed3db8842c\``);
        await queryRunner.query(`ALTER TABLE \`registro\` DROP FOREIGN KEY \`FK_930071132721f545c299fe3efcc\``);
        await queryRunner.query(`ALTER TABLE \`registro\` CHANGE \`alumno_matricula\` \`alumno_matricula\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`registro\` CHANGE \`id_publicacion\` \`id_publicacion\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`recurso\` ADD CONSTRAINT \`FK_0271858854b96137befdd4e1963\` FOREIGN KEY (\`id_publicacion\`) REFERENCES \`publicacion\`(\`id_publicacion\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_3628e9894c4b014d61a01cb21dd\` FOREIGN KEY (\`id_rol\`) REFERENCES \`rol\`(\`id_rol\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_62b68676176f06eeabb8a361a99\` FOREIGN KEY (\`id_departamento\`) REFERENCES \`departamento\`(\`id_departamento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` ADD CONSTRAINT \`FK_b62df2c1cdb9126f37647d90025\` FOREIGN KEY (\`id_categoria\`) REFERENCES \`categoria\`(\`id_categoria\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` ADD CONSTRAINT \`FK_b0cd676ac183ff45644252a0265\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuario\`(\`id_usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`registro\` ADD CONSTRAINT \`FK_eaad2b562da213947ed3db8842c\` FOREIGN KEY (\`alumno_matricula\`) REFERENCES \`alumno\`(\`matricula\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`registro\` ADD CONSTRAINT \`FK_930071132721f545c299fe3efcc\` FOREIGN KEY (\`id_publicacion\`) REFERENCES \`publicacion\`(\`id_publicacion\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`registro\` DROP FOREIGN KEY \`FK_930071132721f545c299fe3efcc\``);
        await queryRunner.query(`ALTER TABLE \`registro\` DROP FOREIGN KEY \`FK_eaad2b562da213947ed3db8842c\``);
        await queryRunner.query(`ALTER TABLE \`publicacion\` DROP FOREIGN KEY \`FK_b0cd676ac183ff45644252a0265\``);
        await queryRunner.query(`ALTER TABLE \`publicacion\` DROP FOREIGN KEY \`FK_b62df2c1cdb9126f37647d90025\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_62b68676176f06eeabb8a361a99\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_3628e9894c4b014d61a01cb21dd\``);
        await queryRunner.query(`ALTER TABLE \`recurso\` DROP FOREIGN KEY \`FK_0271858854b96137befdd4e1963\``);
        await queryRunner.query(`ALTER TABLE \`registro\` CHANGE \`id_publicacion\` \`id_publicacion\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`registro\` CHANGE \`alumno_matricula\` \`alumno_matricula\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`registro\` ADD CONSTRAINT \`FK_930071132721f545c299fe3efcc\` FOREIGN KEY (\`id_publicacion\`) REFERENCES \`publicacion\`(\`id_publicacion\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`registro\` ADD CONSTRAINT \`FK_eaad2b562da213947ed3db8842c\` FOREIGN KEY (\`alumno_matricula\`) REFERENCES \`alumno\`(\`matricula\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`id_usuario\` \`id_usuario\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`id_categoria\` \`id_categoria\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`comentario\` \`comentario\` varchar(255) COLLATE "utf8mb4_general_ci" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` CHANGE \`fecha_evento\` \`fecha_evento\` datetime NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` ADD CONSTRAINT \`FK_b0cd676ac183ff45644252a0265\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuario\`(\`id_usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` ADD CONSTRAINT \`FK_b62df2c1cdb9126f37647d90025\` FOREIGN KEY (\`id_categoria\`) REFERENCES \`categoria\`(\`id_categoria\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`id_departamento\` \`id_departamento\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`id_rol\` \`id_rol\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP INDEX \`IDX_349ecb64acc4355db443ca17cb\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` CHANGE \`correo\` \`correo\` varchar(255) COLLATE "utf8mb4_general_ci" NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_62b68676176f06eeabb8a361a99\` FOREIGN KEY (\`id_departamento\`) REFERENCES \`departamento\`(\`id_departamento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_3628e9894c4b014d61a01cb21dd\` FOREIGN KEY (\`id_rol\`) REFERENCES \`rol\`(\`id_rol\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recurso\` CHANGE \`id_publicacion\` \`id_publicacion\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`recurso\` ADD CONSTRAINT \`FK_0271858854b96137befdd4e1963\` FOREIGN KEY (\`id_publicacion\`) REFERENCES \`publicacion\`(\`id_publicacion\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
