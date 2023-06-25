import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './students.entity';
import { CreateStudentDto } from './dtos/CreateStudentDto';

@Injectable()
export class StudentsService {
   constructor(
      @InjectRepository(Student)
      private readonly studentsRepository: Repository<Student>,
   ) {}

   findAll(): Promise<Student[]> {
      return this.studentsRepository.find();
   }

   findOne(id: number): Promise<Student | null> {
      return this.studentsRepository.findOneBy({ id });
   }

   async create(createStudentDto: CreateStudentDto): Promise<Student> {
      const newStudent = this.studentsRepository.create(createStudentDto);
      return this.studentsRepository.save(newStudent);
   }

   async remove(id: number): Promise<void> {
      await this.studentsRepository.delete(id);
   }
}
