import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './students.entity';
import { CreateStudentDto } from './dtos/CreateStudentDto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Estudiantes')
@Controller('students')
export class StudentsController {
   constructor(private readonly studentsService: StudentsService) {}

   @ApiOperation({ summary: 'Obtener todos los estudiantes' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [Student] })
   @Get()
   findAll(): Promise<Student[]> {
      return this.studentsService.findAll();
   }

   @ApiOperation({ summary: 'Obtener un estudiante por ID' })
   @ApiParam({ name: 'id', description: 'ID del estudiante' })
   @ApiResponse({ status: 200, description: 'Éxito', type: Student })
   @Get(':id')
   findOne(@Param('id') id: string): Promise<Student> {
      return this.studentsService.findOne(parseInt(id, 10));
   }

   @ApiOperation({ summary: 'Crear un nuevo estudiante' })
   @ApiResponse({
      status: 201,
      description: 'Estudiante creado',
      type: Student,
   })
   @Post()
   async create(@Body() createStudentDto: CreateStudentDto) {
      const newStudent = this.studentsService.create(createStudentDto);
      return newStudent;
   }
}
