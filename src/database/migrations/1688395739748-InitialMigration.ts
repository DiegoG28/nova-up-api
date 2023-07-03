import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1688395739748 implements MigrationInterface {
    name = 'InitialMigration1688395739748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`categoria\` (\`id_categoria\` int NOT NULL AUTO_INCREMENT, \`nombre_categoria\` varchar(150) NOT NULL, PRIMARY KEY (\`id_categoria\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recurso\` (\`id_recurso\` int NOT NULL AUTO_INCREMENT, \`nombre_recurso\` varchar(120) NOT NULL, \`tipo_recurso\` enum ('Pdf', 'Enlace', 'Imagen') NOT NULL, \`id_publicacion\` int NULL, PRIMARY KEY (\`id_recurso\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`alumno\` (\`matricula\` int NOT NULL, \`nombre_alumno\` varchar(150) NOT NULL, \`apellidos_alumno\` varchar(150) NOT NULL, PRIMARY KEY (\`matricula\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`registro\` (\`id_registro\` int NOT NULL AUTO_INCREMENT, \`alumno_matricula\` int NULL, \`id_publicacion\` int NULL, PRIMARY KEY (\`id_registro\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`publicacion\` (\`id_publicacion\` int NOT NULL AUTO_INCREMENT, \`titulo_publicacion\` varchar(120) NOT NULL, \`descripcion\` text NOT NULL, \`resumen\` varchar(90) NOT NULL, \`fecha\` datetime NOT NULL, \`fecha_evento\` datetime NULL, \`aprobado\` tinyint NOT NULL, \`cancelado\` tinyint NOT NULL, \`tipo_publicacion\` enum ('Evento', 'Convocatoria externa', 'Convocatoria interna', 'Proyecto') NOT NULL, \`fijado\` tinyint NOT NULL, \`etiquetas\` text NOT NULL, \`comentario\` varchar(255) NULL, \`id_categoria\` int NULL, \`id_carrera\` int NULL, PRIMARY KEY (\`id_publicacion\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rol\` (\`id_rol\` int NOT NULL AUTO_INCREMENT, \`nombre_rol\` varchar(120) NOT NULL, PRIMARY KEY (\`id_rol\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`departamento\` (\`id_departamento\` int NOT NULL AUTO_INCREMENT, \`nombre_depto\` varchar(120) NOT NULL, PRIMARY KEY (\`id_departamento\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`usuario\` (\`id_usuario\` int NOT NULL AUTO_INCREMENT, \`correo\` varchar(255) NOT NULL, \`clave\` varchar(10) NOT NULL, \`id_rol\` int NULL, \`id_departamento\` int NULL, PRIMARY KEY (\`id_usuario\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`carrera\` (\`id_carrera\` int NOT NULL AUTO_INCREMENT, \`nombre_carrera\` varchar(150) NOT NULL, PRIMARY KEY (\`id_carrera\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`usuario-carrera\` (\`id_usuario\` int NOT NULL, \`id_carrera\` int NOT NULL, INDEX \`IDX_86c7366684635c882f6ac4a7f8\` (\`id_usuario\`), INDEX \`IDX_eb63b62330d71a86ab64b129f0\` (\`id_carrera\`), PRIMARY KEY (\`id_usuario\`, \`id_carrera\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`recurso\` ADD CONSTRAINT \`FK_0271858854b96137befdd4e1963\` FOREIGN KEY (\`id_publicacion\`) REFERENCES \`publicacion\`(\`id_publicacion\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`registro\` ADD CONSTRAINT \`FK_eaad2b562da213947ed3db8842c\` FOREIGN KEY (\`alumno_matricula\`) REFERENCES \`alumno\`(\`matricula\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`registro\` ADD CONSTRAINT \`FK_930071132721f545c299fe3efcc\` FOREIGN KEY (\`id_publicacion\`) REFERENCES \`publicacion\`(\`id_publicacion\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` ADD CONSTRAINT \`FK_b62df2c1cdb9126f37647d90025\` FOREIGN KEY (\`id_categoria\`) REFERENCES \`categoria\`(\`id_categoria\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`publicacion\` ADD CONSTRAINT \`FK_82b73351cd3bbda8167990bab2f\` FOREIGN KEY (\`id_carrera\`) REFERENCES \`carrera\`(\`id_carrera\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_3628e9894c4b014d61a01cb21dd\` FOREIGN KEY (\`id_rol\`) REFERENCES \`rol\`(\`id_rol\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuario\` ADD CONSTRAINT \`FK_62b68676176f06eeabb8a361a99\` FOREIGN KEY (\`id_departamento\`) REFERENCES \`departamento\`(\`id_departamento\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`usuario-carrera\` ADD CONSTRAINT \`FK_86c7366684635c882f6ac4a7f8b\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuario\`(\`id_usuario\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`usuario-carrera\` ADD CONSTRAINT \`FK_eb63b62330d71a86ab64b129f01\` FOREIGN KEY (\`id_carrera\`) REFERENCES \`carrera\`(\`id_carrera\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`usuario-carrera\` DROP FOREIGN KEY \`FK_eb63b62330d71a86ab64b129f01\``);
        await queryRunner.query(`ALTER TABLE \`usuario-carrera\` DROP FOREIGN KEY \`FK_86c7366684635c882f6ac4a7f8b\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_62b68676176f06eeabb8a361a99\``);
        await queryRunner.query(`ALTER TABLE \`usuario\` DROP FOREIGN KEY \`FK_3628e9894c4b014d61a01cb21dd\``);
        await queryRunner.query(`ALTER TABLE \`publicacion\` DROP FOREIGN KEY \`FK_82b73351cd3bbda8167990bab2f\``);
        await queryRunner.query(`ALTER TABLE \`publicacion\` DROP FOREIGN KEY \`FK_b62df2c1cdb9126f37647d90025\``);
        await queryRunner.query(`ALTER TABLE \`registro\` DROP FOREIGN KEY \`FK_930071132721f545c299fe3efcc\``);
        await queryRunner.query(`ALTER TABLE \`registro\` DROP FOREIGN KEY \`FK_eaad2b562da213947ed3db8842c\``);
        await queryRunner.query(`ALTER TABLE \`recurso\` DROP FOREIGN KEY \`FK_0271858854b96137befdd4e1963\``);
        await queryRunner.query(`DROP INDEX \`IDX_eb63b62330d71a86ab64b129f0\` ON \`usuario-carrera\``);
        await queryRunner.query(`DROP INDEX \`IDX_86c7366684635c882f6ac4a7f8\` ON \`usuario-carrera\``);
        await queryRunner.query(`DROP TABLE \`usuario-carrera\``);
        await queryRunner.query(`DROP TABLE \`carrera\``);
        await queryRunner.query(`DROP TABLE \`usuario\``);
        await queryRunner.query(`DROP TABLE \`departamento\``);
        await queryRunner.query(`DROP TABLE \`rol\``);
        await queryRunner.query(`DROP TABLE \`publicacion\``);
        await queryRunner.query(`DROP TABLE \`registro\``);
        await queryRunner.query(`DROP TABLE \`alumno\``);
        await queryRunner.query(`DROP TABLE \`recurso\``);
        await queryRunner.query(`DROP TABLE \`categoria\``);
    }

}
