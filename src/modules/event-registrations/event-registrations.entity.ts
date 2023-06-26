import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from '../students/students.entity';
import { Post } from '../posts/entities/posts.entity';

@Entity({ name: 'registro' })
export class EventRegistration {
   @PrimaryGeneratedColumn({ name: 'id_registro' })
   id: number;

   @ManyToOne(() => Student, (student) => student.eventRegistrations)
   @JoinColumn({ name: 'alumno_matricula' })
   student: Student;

   @ManyToOne(() => Post, (post) => post.eventRegistrations)
   @JoinColumn({ name: 'id_publicacion' })
   post: Post;
}
