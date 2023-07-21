import { Injectable, NotFoundException } from '@nestjs/common';
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

   async findCategoryById(id: number): Promise<Category> {
      const category = await this.categoriesRepository.findOne({
         where: { id },
      });
      if (!category) {
         throw new NotFoundException('Category not found');
      }
      return category;
   }

   async findRoleById(id: number): Promise<Role> {
      const role = await this.rolesRepository.findOne({
         where: { id },
      });
      if (!role) {
         throw new NotFoundException('Role not found');
      }
      return role;
   }

   async findDepartmentById(id: number): Promise<Department> {
      const department = await this.departmentsRepository.findOne({
         where: { id },
      });
      if (!department) {
         throw new NotFoundException('Department not found');
      }
      return department;
   }
}
