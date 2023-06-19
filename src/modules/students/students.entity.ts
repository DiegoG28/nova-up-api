import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'alumno' })
export class Student {
  @ApiProperty()
  @PrimaryGeneratedColumn({ name: 'id_alumno' })
  id: number;

  @ApiProperty()
  @Column({ name: 'matricula' })
  tuition: number;

  @ApiProperty()
  @Column({ name: 'nombre_alumno', length: 150 })
  name: string;

  @ApiProperty()
  @Column({ name: 'apellidos_alumno', length: 150 })
  lastName: string;
}
