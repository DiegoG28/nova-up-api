import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './students.entity';
import { CreateStudentDto } from './dtos/create-student.dto';

@Injectable()
export class StudentsService {
   constructor(
      @InjectRepository(Student)
      private readonly studentsRepository: Repository<Student>,
   ) {}

   findAll(): Promise<Student[]> {
      return this.studentsRepository.find();
   }

   findOne(tuition: number): Promise<Student | null> {
      return this.studentsRepository.findOneBy({ tuition });
   }

   async create(createStudentDto: CreateStudentDto): Promise<Student> {
      const newStudent = this.studentsRepository.create(createStudentDto);
      return this.studentsRepository.save(newStudent);
   }

   async remove(tuition: number): Promise<void> {
      await this.studentsRepository.delete(tuition);
   }
}
