import {
   Column,
   Entity,
   JoinColumn,
   JoinTable,
   ManyToMany,
   ManyToOne,
   PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../catalogs/roles/roles.entity';
import { Career } from 'src/modules/careers/careers.entity';
import { Department } from 'src/modules/catalogs/departments/departments.entity';

@Entity({ name: 'usuario' })
export class User {
   @PrimaryGeneratedColumn({ name: 'id_usuario' })
   id: number;

   @ManyToOne(() => Role, (role) => role.users)
   @JoinColumn({ name: 'id_rol' })
   role: Role;

   @ManyToOne(() => Department, (department) => department.users)
   @JoinColumn({ name: 'id_departamento' })
   department: Department;

   @ManyToMany(() => Career, (career) => career.users)
   @JoinTable({
      name: 'usuario-carrera',
      joinColumn: {
         name: 'id_usuario',
      },
      inverseJoinColumn: {
         name: 'id_carrera',
      },
   })
   careers: Career[];

   @Column({ name: 'correo', length: 255 })
   email: string;

   @Column({ name: 'clave', length: 10 })
   password: string;
}
