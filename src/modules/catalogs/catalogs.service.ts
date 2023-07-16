import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/categories.entity';
import { Repository } from 'typeorm';
import { Department } from './entities/departments.entity';
import { Role } from './entities/roles.entity';

@Injectable()
export class CatalogsService {
   constructor(
      @InjectRepository(Category)
      private readonly categoriesRepository: Repository<Category>,

      @InjectRepository(Department)
      private readonly departmentsRepository: Repository<Department>,

      @InjectRepository(Role)
      private readonly rolesRepository: Repository<Role>,
   ) {}

   findAllCategories(): Promise<Category[]> {
      return this.categoriesRepository.find();
   }

   findAllDepartaments(): Promise<Department[]> {
      return this.departmentsRepository.find();
   }

   findAllRoles(): Promise<Role[]> {
      return this.rolesRepository.find();
   }
}
