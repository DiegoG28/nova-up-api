import {
   CanActivate,
   ExecutionContext,
   Injectable,
   UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './dtos/sign-in.dto';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.decorators';

@Injectable()
export class AuthGuard implements CanActivate {
   constructor(
      private jwtService: JwtService,
      private configService: ConfigService,
      private reflector: Reflector,
   ) {}

   async canActivate(context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
         IS_PUBLIC_KEY,
         [context.getHandler(), context.getClass()],
      );

      const jwtSecret = this.configService.get<string>('JWT_SECRET');

      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);

      if (!token && !isPublic) {
         throw new UnauthorizedException(
            'Token not provided. Please verify that the token is being provided in the Authorization header using the Bearer scheme.',
         );
      }

      try {
         if (token) {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(
               token,
               {
                  secret: jwtSecret,
               },
            );

            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['userPayload'] = payload;
         }
      } catch (err) {
         throw new UnauthorizedException(err.message);
      }

      return true;
   }

   private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
   }
}
