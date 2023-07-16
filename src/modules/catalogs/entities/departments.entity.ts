import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/users.entity';

@Entity({ name: 'departamento' })
export class Department {
   @PrimaryGeneratedColumn({ name: 'id_departamento' })
   id: number;

   @Column({ name: 'nombre_depto', length: 120 })
   name: string;

   @OneToMany(() => User, (user) => user.department)
   users: User[];
}
