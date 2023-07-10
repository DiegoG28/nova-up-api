import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';
import { Category } from './entities/categories.entity';
import { CategoryDto } from './dtos/categories.dto';

@ApiTags('Catálogos')
@Controller('catalogs')
export class CatalogsController {
   constructor(private readonly categoriesService: CatalogsService) {}

   @ApiOperation({ summary: 'Obtener todas las categorías' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [CategoryDto] })
   @Get('/categories')
   findAll(): Promise<Category[]> {
      return this.categoriesService.findAllCategories();
   }
}
