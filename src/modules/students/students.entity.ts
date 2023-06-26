import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EventRegistration } from '../event-registrations/event-registrations.entity';

@Entity({ name: 'alumno' })
export class Student {
   @ApiProperty()
   @PrimaryGeneratedColumn({ name: 'matricula' })
   tuition: number;

   @ApiProperty()
   @OneToMany(
      () => EventRegistration,
      (eventRegistration) => eventRegistration.student,
   )
   eventRegistrations: EventRegistration[];

   @ApiProperty()
   @Column({ name: 'nombre_alumno', length: 150 })
   name: string;

   @ApiProperty()
   @Column({ name: 'apellidos_alumno', length: 150 })
   lastName: string;
}
