import {
   Column,
   Entity,
   ManyToOne,
   PrimaryGeneratedColumn,
   JoinColumn,
} from 'typeorm';
import { Post } from './posts.entity';

enum AssetTypeEnum {
   PDF = 'Pdf',
   Link = 'Enlace',
   Image = 'Imagen',
}

@Entity({ name: 'recursos' })
export class PostAsset {
   @PrimaryGeneratedColumn({ name: 'id_recurso' })
   id: number;

   @ManyToOne(() => Post, (post) => post.assets)
   @JoinColumn({ name: 'id_publicacion' })
   post: Post;

   @Column({ name: 'nombre_recurso', length: 120 })
   name: string;

   @Column({ type: 'enum', enum: AssetTypeEnum, name: 'tipo_recurso' })
   type: AssetTypeEnum;
}
