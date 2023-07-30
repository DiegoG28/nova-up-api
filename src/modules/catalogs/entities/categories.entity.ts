import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Post } from '../../posts/posts.entity';

@Entity({ name: 'categoria' })
export class Category {
   @PrimaryGeneratedColumn({ name: 'id_categoria' })
   id: number;

   @Column({ name: 'nombre_categoria', length: 150 })
   name: string;

   @OneToMany(() => Post, (post) => post.category)
   posts: Post[];
}
