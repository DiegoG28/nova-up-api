import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from '../posts/entities/posts.entity';

@Entity({ name: 'carrera' })
export class Career {
   @PrimaryGeneratedColumn({ name: 'id_carrera' })
   id: number;

   @Column({ name: 'nombre_carrera', length: 150 })
   name: string;

   @OneToMany(() => Post, (post) => post.career)
   posts: Post;
}
