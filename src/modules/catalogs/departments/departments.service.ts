import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './departments.entity';

@Injectable()
export class DepartmentsService {
   constructor(
      @InjectRepository(Department)
      private readonly departmentsRepository: Repository<Department>,
   ) {}

   findAll(): Promise<Department[]> {
      return this.departmentsRepository.find();
   }
}
