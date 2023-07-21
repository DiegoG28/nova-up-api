import {
   Column,
   Entity,
   ManyToOne,
   PrimaryGeneratedColumn,
   JoinColumn,
} from 'typeorm';
import { Post } from '../posts/entities/posts.entity';
import { Exclude } from 'class-transformer';

export enum AssetTypeEnum {
   PDF = 'Pdf',
   Link = 'Enlace',
   Image = 'Imagen',
}

@Entity({ name: 'recurso' })
export class Asset {
   @PrimaryGeneratedColumn({ name: 'id_recurso' })
   id: number;

   @ManyToOne(() => Post, (post) => post.assets)
   @Exclude()
   @JoinColumn({ name: 'id_publicacion' })
   post: Post;

   @Column({ name: 'nombre_recurso', length: 120 })
   name: string;

   @Column({ name: 'portada', default: false })
   isCoverImage: boolean;

   @Column({ type: 'enum', enum: AssetTypeEnum, name: 'tipo_recurso' })
   type: AssetTypeEnum;
}
