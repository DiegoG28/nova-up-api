import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './students.entity';

// This module is only used to register the Student entity with TypeORM.
// It was created for a future implementation.
@Module({
   imports: [TypeOrmModule.forFeature([Student])],
})
export class StudentsModule {}
