import {
   Entity,
   PrimaryGeneratedColumn,
   Column,
   OneToMany,
   ManyToMany,
} from 'typeorm';
import { Post } from '../posts/entities/posts.entity';
import { User } from '../users/users.entity';

@Entity({ name: 'carrera' })
export class Career {
   @PrimaryGeneratedColumn({ name: 'id_carrera' })
   id: number;

   @OneToMany(() => Post, (post) => post.career)
   posts: Post[];

   @ManyToMany(() => User, (user) => user.careers)
   users: User[];

   @Column({ name: 'nombre_carrera', length: 150 })
   name: string;
}
