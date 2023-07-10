import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/roles.entity';
import { UserDepartment } from './entities/department.entity';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
   imports: [TypeOrmModule.forFeature([UserRole, UserDepartment, User])],
   controllers: [UsersController],
   providers: [UsersService],
})
export class UsersModule {}
