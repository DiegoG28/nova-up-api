import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';
import { Category } from './entities/categories.entity';
import { CategoryDto } from './dtos/categories.dto';
import { Department } from './entities/departments.entity';
import { DepartmentDto } from './dtos/departments.dto';

@ApiTags('Catálogos')
@Controller('catalogs')
export class CatalogsController {
   constructor(private readonly catalogsService: CatalogsService) {}

   @ApiOperation({ summary: 'Obtener todas las categorías' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [CategoryDto] })
   @Get('/categories')
   findAllCategories(): Promise<Category[]> {
      return this.catalogsService.findAllCategories();
   }

   @ApiOperation({ summary: 'Obtener todos los departamentos' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [DepartmentDto] })
   @Get('/departments')
   findAllDepartments(): Promise<Department[]> {
      return this.catalogsService.findAllDepartaments();
   }
}
