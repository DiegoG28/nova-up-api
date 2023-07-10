import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { Department } from './departments.entity';
import { DepartmentDto } from './dtos/departments.dto';

@ApiTags('Departamentos')
@Controller('departments')
export class DepartmentsController {
   constructor(private readonly departmentsService: DepartmentsService) {}

   @ApiOperation({ summary: 'Obtener todos los departamentos' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [DepartmentDto] })
   @Get()
   findAll(): Promise<Department[]> {
      return this.departmentsService.findAll();
   }
}
