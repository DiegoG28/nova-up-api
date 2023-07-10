import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/categories.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CatalogsService {
   constructor(
      @InjectRepository(Category)
      private readonly categoriesRepository: Repository<Category>,
   ) {}

   findAllCategories(): Promise<Category[]> {
      return this.categoriesRepository.find();
   }
}
