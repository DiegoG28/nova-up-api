import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { EventRegistration } from '../event-registrations/event-registrations.entity';

@Entity({ name: 'alumno' })
export class Student {
   @PrimaryGeneratedColumn({ name: 'matricula' })
   tuition: number;

   @OneToMany(
      () => EventRegistration,
      (eventRegistration) => eventRegistration.student,
   )
   eventRegistrations: EventRegistration[];

   @Column({ name: 'nombre_alumno', length: 150 })
   name: string;

   @Column({ name: 'apellidos_alumno', length: 150 })
   lastName: string;
}
