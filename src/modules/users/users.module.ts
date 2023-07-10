import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../catalogs/roles/roles.entity';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Department } from '../catalogs/departments/departments.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Role, User, Department])],
   controllers: [UsersController],
   providers: [UsersService],
})
export class UsersModule {}
