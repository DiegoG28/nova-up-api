import {
   ConflictException,
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dtos/create-users.dto';
import { CatalogsService } from '../catalogs/catalogs.service';
import { Errors } from 'src/libs/errors';

@Injectable()
export class UsersService {
   constructor(
      @InjectRepository(User)
      private readonly usersRepository: Repository<User>,
      private readonly catalogsService: CatalogsService,
   ) {}

   async findAll(loggedInUserId: number): Promise<User[]> {
      const users = this.usersRepository.find({
         where: {
            id: Not(In([1, loggedInUserId])),
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

      if (!user) throw new NotFoundException(Errors.USER_NOT_FOUND);

      return user;
   }

   async create(user: CreateUserDto): Promise<User | null> {
      const newUser = new User();

      const role = await this.catalogsService.findRoleById(user.roleId);

      newUser.role = role;

      const department = await this.catalogsService.findDepartmentById(
         user.departmentId,
      );

      newUser.department = department;

      const existingUser = await this.usersRepository.findOne({
         where: { email: user.email },
         relations: ['role', 'department'],
      });
      if (existingUser)
         throw new ConflictException(Errors.EMAIL_ALREADY_EXISTS);

      newUser.email = user.email;

      const savedUser = await this.usersRepository.save(newUser);
      return savedUser;
   }

   async remove(id: number, loggedInUserId: number): Promise<User | null> {
      if (id === loggedInUserId)
         throw new ForbiddenException(Errors.CANNOT_DELETE_OWN_ACCOUNT);

      const user = await this.usersRepository.findOne({
         where: { id },
         relations: ['role', 'department'],
      });

      if (!user) return null;
      await this.usersRepository.delete(id);
      return user;
   }

   async update(
      id: number,
      user: CreateUserDto,
      loggedInUserId: number,
   ): Promise<User | null> {
      if (id === loggedInUserId)
         throw new ForbiddenException(Errors.CANNOT_UPDATE_OWN_ACCOUNT);

      const newUser = new User();
      const role = await this.catalogsService.findRoleById(user.roleId);

      if (!role) return null;

      newUser.role = role;

      const department = await this.catalogsService.findDepartmentById(
         user.departmentId,
      );

      if (!department) return null;

      newUser.department = department;

      const existingUser = await this.usersRepository.findOne({
         where: { email: user.email },
         relations: ['role', 'department'],
      });

      if (existingUser && existingUser.id !== id)
         throw new ConflictException(Errors.EMAIL_ALREADY_EXISTS);

      newUser.email = user.email;

      const updateResult = await this.usersRepository.update(id, {
         email: newUser.email,
         role: newUser.role,
      });
      if (updateResult.affected === 0) return null;
      return newUser;
   }
}
