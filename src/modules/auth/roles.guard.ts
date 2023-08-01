import {
   Injectable,
   CanActivate,
   ExecutionContext,
   UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../users/users.entity';
import { Errors } from 'src/libs/errors';

@Injectable()
export class RolesGuard implements CanActivate {
   constructor(private readonly reflector: Reflector) {}

   canActivate(context: ExecutionContext): boolean {
      const roles = this.reflector.get<string[]>('roles', context.getHandler());
      if (!roles) {
         // if no roles are required, anyone can access
         return true;
      }

      const request = context.switchToHttp().getRequest();
      const user: User = request.userPayload.user;

      if (!user) {
         throw new UnauthorizedException(Errors.NO_USER_LOGGED_IN);
      }

      const hasRole = roles.includes(user.role.name);

      if (user && user.role.name && hasRole) {
         return true;
      }

      throw new UnauthorizedException(Errors.ACCESS_DENIED_TO_RESOURCE);
   }
}
