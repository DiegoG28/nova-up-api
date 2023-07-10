import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/roles.entity';
import { UserDepartment } from './entities/department.entity';
import { User } from './entities/users.entity';
import { CreateUserDto } from './dtos/create-users.dto';

@Injectable()
export class UsersService {
   constructor(
      @InjectRepository(UserRole)
      private readonly userRoleRepository: Repository<UserRole>,
      @InjectRepository(UserDepartment)
      private readonly userDepartmentRepository: Repository<UserDepartment>,
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
   ) {}

   findAll(): Promise<User[]> {
      const users = this.userRepository.find({
         relations: ['role', 'department'],
      });
      return users;
   }

   findOne(email: string): Promise<User | null> {
      return this.userRepository.findOne({
         where: { email },
         relations: ['role', 'department'],
      });
   }

   async create(user: CreateUserDto): Promise<User | null> {
      const newUser = new User();
      newUser.role = await this.userRoleRepository.findOneBy({ id: user.role });
      newUser.department = await this.userDepartmentRepository.findOneBy({
         id: user.department,
      });
      newUser.email = user.email;
      newUser.password = user.password;

      if (!newUser.role || !newUser.department) {
         return null;
      }

      const savedUser = await this.userRepository.save(newUser);
      return savedUser;
   }

   async remove(id: number): Promise<User> {
      const user = await this.userRepository.findOne({
         where: { id },
         relations: ['role', 'department'],
      });
      await this.userRepository.delete(id);
      return user;
   }

   async update(id: number, user: CreateUserDto): Promise<User | null> {
      const newUser = new User();
      newUser.role = await this.userRoleRepository.findOneBy({
         id: user.role,
      });

      newUser.department = await this.userDepartmentRepository.findOneBy({
         id: user.department,
      });

      newUser.email = user.email;
      newUser.password = user.password;

      if (!newUser.role || !newUser.department) {
         return null;
      }

      const updateResult = await this.userRepository.update(id, {
         email: newUser.email,
         password: newUser.password,
         role: newUser.role,
      });
      if (updateResult.affected === 0) {
         return null;
      }
      return newUser;
   }
}
