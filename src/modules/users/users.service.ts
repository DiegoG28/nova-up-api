import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Role } from '../catalogs/entities/roles.entity';
import { User } from './users.entity';
import { CreateUserDto } from './dtos/create-users.dto';
import { Department } from '../catalogs/entities/departments.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
   constructor(
      @InjectRepository(User)
      private readonly usersRepository: Repository<User>,
      @InjectRepository(Role)
      private readonly rolesRepository: Repository<Role>,
      @InjectRepository(Department)
      private readonly departmentsRepository: Repository<Department>,
      private jwtService: JwtService,
   ) {}

   async findAll(token: string): Promise<User[]> {
      const splitToken = token.split(' ')[1];
      const decodedToken: any = this.jwtService.decode(splitToken);

      const users = this.usersRepository.find({
         where: {
            id: Not(In([1, decodedToken.user.id])),
         },
         relations: ['role', 'department'],
      });
      return users;
   }

   async findOne(email: string): Promise<User> {
      const user = await this.usersRepository.findOne({
         where: { email },
         relations: ['role', 'department'],
      });

      if (!user) throw new NotFoundException('User not found');

      return user;
   }

   async create(user: CreateUserDto): Promise<User | null> {
      const newUser = new User();

      const role = await this.rolesRepository.findOneBy({ id: user.roleId });
      if (!role) return null;

      newUser.role = role;

      const department = await this.departmentsRepository.findOneBy({
         id: user.departmentId,
      });

      if (!department) return null;

      newUser.department = department;

      newUser.email = user.email;

      const savedUser = await this.usersRepository.save(newUser);
      return savedUser;
   }

   async remove(id: number): Promise<User | null> {
      const user = await this.usersRepository.findOne({
         where: { id },
         relations: ['role', 'department'],
      });

      if (!user) return null;
      await this.usersRepository.delete(id);
      return user;
   }

   async update(id: number, user: CreateUserDto): Promise<User | null> {
      const newUser = new User();
      const role = await this.rolesRepository.findOneBy({
         id: user.roleId,
      });

      if (!role) return null;

      newUser.role = role;

      const department = await this.departmentsRepository.findOneBy({
         id: user.departmentId,
      });

      if (!department) return null;

      newUser.department = department;

      newUser.email = user.email;

      const updateResult = await this.usersRepository.update(id, {
         email: newUser.email,
         role: newUser.role,
      });
      if (updateResult.affected === 0) return null;
      return newUser;
   }
}
