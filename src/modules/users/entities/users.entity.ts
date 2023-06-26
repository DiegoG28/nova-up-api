import {
   Column,
   Entity,
   JoinColumn,
   JoinTable,
   ManyToMany,
   ManyToOne,
   PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './roles.entity';
import { UserDepartment } from './department.entity';
import { Career } from 'src/modules/careers/careers.entity';

@Entity({ name: 'usuario' })
export class User {
   @PrimaryGeneratedColumn({ name: 'id_usuario' })
   id: number;

   @ManyToOne(() => UserRole, (userRole) => userRole.users)
   @JoinColumn({ name: 'id_rol' })
   role: UserRole;

   @ManyToOne(() => UserDepartment, (userDepartment) => userDepartment.users)
   @JoinColumn({ name: 'id_departamento' })
   department: UserDepartment;

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
