import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/users.entity';

@Entity({ name: 'rol' })
export class Role {
   @PrimaryGeneratedColumn({ name: 'id_rol' })
   id: number;

   @Column({ name: 'nombre_rol', length: 120 })
   name: string;

   @OneToMany(() => User, (user) => user.role)
   users: User[];
}
