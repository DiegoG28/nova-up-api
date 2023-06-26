import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/roles.entity';
import { UserDepartment } from './entities/department.entity';
import { User } from './entities/users.entity';

@Module({
   imports: [TypeOrmModule.forFeature([UserRole, UserDepartment, User])],
})
export class UsersModule {}
