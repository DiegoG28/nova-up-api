import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CatalogsService } from './catalogs.service';
import { CatalogDto } from './dtos/catalog.dto';
import { Category } from './entities/categories.entity';
import { Department } from './entities/departments.entity';
import { Public } from '../auth/auth.decorators';

@ApiTags('Catálogos')
@Public()
@Controller('catalogs')
export class CatalogsController {
   constructor(private readonly catalogsService: CatalogsService) {}

   @ApiOperation({ summary: 'Obtener todas las categorías' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [CatalogDto] })
   @Get('/categories')
   findAllCategories(): Promise<Category[]> {
      return this.catalogsService.findAllCategories();
   }

   @ApiOperation({ summary: 'Obtener todos los departamentos' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [CatalogDto] })
   @Get('/departments')
   findAllDepartments(): Promise<Department[]> {
      return this.catalogsService.findAllDepartaments();
   }

   @ApiOperation({ summary: 'Obtener todos los roles' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [CatalogDto] })
   @Get('/roles')
   findAllRoles(): Promise<Department[]> {
      return this.catalogsService.findAllRoles();
   }
}
