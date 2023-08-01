import {
   Body,
   Controller,
   Delete,
   Get,
   Param,
   ParseIntPipe,
   Post,
   Put,
   Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CreateUserDto } from './dtos/create-users.dto';
import {
   ApiBearerAuth,
   ApiOperation,
   ApiParam,
   ApiResponse,
   ApiTags,
} from '@nestjs/swagger';
import { UsersDto } from './dtos/users.dto';
import { Roles } from '../auth/auth.decorators';
import { RequestWithPayload } from 'src/libs/interfaces';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
   constructor(private readonly usersService: UsersService) {}

   @ApiOperation({ summary: 'Obtener todos los usuarios' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [UsersDto] })
   @Roles('Admin')
   @Get()
   findAll(@Req() req: RequestWithPayload): Promise<User[]> {
      const loggedInUserId = req.userPayload.sub;
      return this.usersService.findAll(loggedInUserId);
   }

   @ApiOperation({ summary: 'Obtener un usuario por email' })
   @ApiParam({ name: 'email', description: 'Email del usuario' })
   @ApiResponse({ status: 200, description: 'Éxito', type: UsersDto })
   @Roles('Admin')
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
   @Roles('Admin')
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
   @Roles('Admin')
   @Delete(':id')
   remove(
      @Req() req: RequestWithPayload,
      @Param('id') id: number,
   ): Promise<User | null> {
      const loggedInUserId = req.userPayload.sub;
      return this.usersService.remove(id, loggedInUserId);
   }

   @ApiOperation({ summary: 'Actualizar un usuario' })
   @ApiParam({ name: 'id', description: 'Id del usuario' })
   @ApiResponse({
      status: 200,
      description: 'Usuario actualizado',
      type: CreateUserDto,
   })
   @Roles('Admin')
   @Put(':id')
   update(
      @Req() req: RequestWithPayload,
      @Param('id', ParseIntPipe) id: number,
      @Body() user: CreateUserDto,
   ) {
      const loggedInUserId = req.userPayload.sub;
      return this.usersService.update(id, user, loggedInUserId);
   }
}
