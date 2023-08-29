import {
   Entity,
   Column,
   PrimaryGeneratedColumn,
   ManyToOne,
   JoinColumn,
   OneToMany,
} from 'typeorm';
import { Category } from '../catalogs/entities/categories.entity';
import { Asset } from '../assets/assets.entity';
import { EventRegistration } from '../../entities/event-registrations.entity';
import { User } from 'src/modules/users/users.entity';

export enum PostTypeEnum {
   Event = 'Evento',
   ExternalConvocatory = 'Convocatoria externa',
   InternalConvocatory = 'Convocatoria interna',
   Project = 'Proyecto',
   Research = 'Investigación',
}

export enum PostStatusEnum {
   Approved = 'aprobado',
   Pending = 'pendiente',
   Rejected = 'rechazado',
}

@Entity({ name: 'publicacion' })
export class Post {
   @PrimaryGeneratedColumn({ name: 'id_publicacion' })
   id: number;

   @ManyToOne(() => Category, (category) => category.posts)
   @JoinColumn({ name: 'id_categoria' })
   category: Category;

   @ManyToOne(() => User, (user) => user.posts, { onDelete: 'SET NULL' })
   @JoinColumn({ name: 'id_usuario' })
   user: User;

   @OneToMany(() => Asset, (asset) => asset.post)
   assets: Asset[];

   @OneToMany(
      () => EventRegistration,
      (eventRegistration) => eventRegistration.post,
   )
   eventRegistrations: EventRegistration[];

   @Column({ name: 'titulo_publicacion', length: 120 })
   title: string;

   @Column({ type: 'text', name: 'descripcion' })
   description: string;

   @Column({ name: 'resumen', length: 110 })
   summary: string;

   @Column({
      type: 'enum',
      enum: PostStatusEnum,
      name: 'status',
      default: PostStatusEnum.Pending,
   })
   status: PostStatusEnum;

   @Column({ type: 'datetime', name: 'fecha', nullable: true })
   publishDate: Date | null;

   @Column({ type: 'datetime', name: 'fecha_evento', nullable: true })
   eventDate: Date | null;

   @Column({
      type: 'enum',
      enum: PostTypeEnum,
      name: 'tipo_publicacion',
   })
   type: PostTypeEnum;

   @Column({ name: 'fijado', default: false })
   isPinned: boolean;

   @Column({ type: 'text', name: 'etiquetas' })
   tags: string;

   @Column({ type: 'varchar', name: 'comentario', length: 255, nullable: true })
   comments: string | null;
}
