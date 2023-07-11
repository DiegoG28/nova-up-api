import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/categories.entity';
import { Repository } from 'typeorm';
import { Department } from './entities/departments.entity';

@Injectable()
export class CatalogsService {
   constructor(
      @InjectRepository(Category)
      private readonly categoriesRepository: Repository<Category>,

      @InjectRepository(Department)
      private readonly departmentsRepository: Repository<Department>,
   ) {}

   findAllCategories(): Promise<Category[]> {
      return this.categoriesRepository.find();
   }

   findAllDepartaments(): Promise<Department[]> {
      return this.departmentsRepository.find();
   }
}
