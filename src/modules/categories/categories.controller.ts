import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Category } from './categories.entity';
import { CategoriesDto } from './dtos/categories.dto';

@ApiTags('Categorias')
@Controller('categories')
export class CategoriesController {
   constructor(private readonly categoriesService: CategoriesService) {}

   @ApiOperation({ summary: 'Obtener todas las categorias' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [CategoriesDto] })
   @Get()
   findAll(): Promise<Category[]> {
      return this.categoriesService.findAll();
   }
}
