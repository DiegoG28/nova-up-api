import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../catalogs/roles/roles.entity';
import { User } from './users.entity';
import { CreateUserDto } from './dtos/create-users.dto';
import { Department } from '../catalogs/departments/departments.entity';

@Injectable()
export class UsersService {
   constructor(
      @InjectRepository(User)
      private readonly usersRepository: Repository<User>,
      @InjectRepository(Role)
      private readonly rolesRepository: Repository<Role>,
      @InjectRepository(Department)
      private readonly departmentsRepository: Repository<Department>,
   ) {}

   findAll(): Promise<User[]> {
      const users = this.usersRepository.find({
         relations: ['role', 'department'],
      });
      return users;
   }

   findOne(email: string): Promise<User | null> {
      return this.usersRepository.findOne({
         where: { email },
         relations: ['role', 'department'],
      });
   }

   async create(user: CreateUserDto): Promise<User | null> {
      const newUser = new User();
      newUser.role = await this.rolesRepository.findOneBy({
         id: user.roleId,
      });
      newUser.department = await this.departmentsRepository.findOneBy({
         id: user.departmentId,
      });
      newUser.email = user.email;
      newUser.password = user.password;

      if (!newUser.role || !newUser.department) {
         return null;
      }

      const savedUser = await this.usersRepository.save(newUser);
      return savedUser;
   }

   async remove(id: number): Promise<User> {
      const user = await this.usersRepository.findOne({
         where: { id },
         relations: ['role', 'department'],
      });
      await this.usersRepository.delete(id);
      return user;
   }

   async update(id: number, user: CreateUserDto): Promise<User | null> {
      const newUser = new User();
      newUser.role = await this.rolesRepository.findOneBy({
         id: user.roleId,
      });

      newUser.department = await this.departmentsRepository.findOneBy({
         id: user.departmentId,
      });

      newUser.email = user.email;
      newUser.password = user.password;

      if (!newUser.role || !newUser.department) {
         return null;
      }

      const updateResult = await this.usersRepository.update(id, {
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
