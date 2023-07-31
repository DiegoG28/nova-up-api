import {
   Column,
   Entity,
   JoinColumn,
   ManyToOne,
   OneToMany,
   PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../catalogs/entities/roles.entity';
import { Department } from 'src/modules/catalogs/entities/departments.entity';
import { Post } from '../posts/posts.entity';

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

   @OneToMany(() => Post, (post) => post.user)
   posts: Post[];

   @Column({ name: 'correo', length: 255, unique: true })
   email: string;
}
