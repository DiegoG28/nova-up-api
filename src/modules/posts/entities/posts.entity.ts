import {
   Entity,
   Column,
   PrimaryGeneratedColumn,
   ManyToOne,
   JoinColumn,
   OneToMany,
} from 'typeorm';
import { PostCategory } from './categories.entity';
import { Career } from 'src/modules/careers/careers.entity';
import { PostAsset } from './assets.entity';
import { EventRegistration } from '../../event-registrations/event-registrations.entity';

enum PostTypeEnum {
   Event = 'Evento',
   ExternalConvocatory = 'Convocatoria externa',
   InternalConvocatory = 'Convocatoria interna',
   Project = 'Proyecto',
}

@Entity({ name: 'publicacion' })
export class Post {
   @PrimaryGeneratedColumn({ name: 'id_publicacion' })
   id: number;

   @ManyToOne(() => PostCategory, (postCategory) => postCategory.posts)
   @JoinColumn({ name: 'id_categoria' })
   category: PostCategory;

   @ManyToOne(() => Career, (career) => career.posts)
   @JoinColumn({ name: 'id_carrera' })
   career: Career;

   @OneToMany(() => PostAsset, (postAsset) => postAsset.post)
   assets: PostAsset[];

   @OneToMany(
      () => EventRegistration,
      (eventRegistration) => eventRegistration.post,
   )
   eventRegistrations: EventRegistration[];

   @Column({ name: 'titulo_publicacion', length: 120 })
   title: string;

   @Column({ type: 'text', name: 'descripcion' })
   description: string;

   @Column({ name: 'resumen', length: 90 })
   summary: string;

   @Column({ name: 'fecha' })
   publishDate: Date;

   @Column({ name: 'fecha_evento', nullable: true })
   eventDate: Date;

   @Column({ name: 'aprobado' })
   isApproved: boolean;

   @Column({ name: 'cancelado' })
   isCanceled: boolean;

   @Column({
      type: 'enum',
      enum: PostTypeEnum,
      name: 'tipo_publicacion',
   })
   type: PostTypeEnum;

   @Column({ name: 'fijado' })
   isPinned: boolean;

   @Column({ type: 'text', name: 'etiquetas' })
   tags: string;

   @Column({ name: 'comentario', length: 255, nullable: true })
   comments: string;
}
