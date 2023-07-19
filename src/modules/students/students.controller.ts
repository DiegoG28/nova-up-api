import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from './students.entity';
import { CreateStudentDto } from './dtos/create-student.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentDto } from './dtos/students.dto.ts';

@ApiTags('Estudiantes')
@Controller('students')
export class StudentsController {
   constructor(private readonly studentsService: StudentsService) {}

   @ApiOperation({ summary: 'Obtener todos los estudiantes' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [StudentDto] })
   @Get()
   findAll(): Promise<Student[]> {
      return this.studentsService.findAll();
   }

   @ApiOperation({ summary: 'Obtener un estudiante por ID' })
   @ApiParam({ name: 'tuition', description: 'Matrícula del estudiante' })
   @ApiResponse({ status: 200, description: 'Éxito', type: StudentDto })
   @Get(':tuition')
   findOne(@Param('tuition') tuition: string): Promise<Student | null> {
      return this.studentsService.findOne(parseInt(tuition, 10));
   }

   @ApiOperation({ summary: 'Crear un nuevo estudiante' })
   @ApiResponse({
      status: 201,
      description: 'Estudiante creado',
      type: StudentDto,
   })
   @Post()
   async create(@Body() createStudentDto: CreateStudentDto) {
      const newStudent = this.studentsService.create(createStudentDto);
      return newStudent;
   }
}
