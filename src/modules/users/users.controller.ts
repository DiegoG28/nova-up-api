import {
   Body,
   Controller,
   Delete,
   Get,
   Param,
   Post,
   Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CreateUserDto } from './dtos/create-users.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersDto } from './dtos/users.dto';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
   constructor(private readonly usersService: UsersService) {}

   @ApiOperation({ summary: 'Obtener todos los usuarios' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [UsersDto] })
   @Get()
   findAll(): Promise<User[]> {
      return this.usersService.findAll();
   }

   @ApiOperation({ summary: 'Obtener un usuario por email' })
   @ApiParam({ name: 'email', description: 'Email del usuario' })
   @ApiResponse({ status: 200, description: 'Éxito', type: UsersDto })
   @Get(':email')
   findOne(@Param('email') email: string): Promise<User> {
      return this.usersService.findOne(email);
   }

   @ApiOperation({ summary: 'Crear un nuevo usuario' })
   @ApiResponse({
      status: 201,
      description: 'Usuario creado',
      type: UsersDto,
   })
   @Post()
   async create(@Body() user: CreateUserDto) {
      const newUser = this.usersService.create(user);
      return newUser;
   }
   @ApiOperation({ summary: 'Eliminar un usuario' })
   @ApiParam({ name: 'id', description: 'Id del usuario' })
   @ApiResponse({
      status: 200,
      description: 'Usuario eliminado',
      type: UsersDto,
   })
   @Delete(':id')
   remove(@Param('id') id: number): Promise<User> {
      return this.usersService.remove(id);
   }

   @ApiOperation({ summary: 'Actualizar un usuario' })
   @ApiParam({ name: 'id', description: 'Id del usuario' })
   @ApiResponse({
      status: 200,
      description: 'Usuario actualizado',
      type: CreateUserDto,
   })
   @Put(':id')
   update(@Param('id') id: number, @Body() user: CreateUserDto) {
      return this.usersService.update(id, user);
   }
}
