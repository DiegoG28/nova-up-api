import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignInResponseDto } from './dtos/sign-in.dto';

@Injectable()
export class AuthService {
   constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
   ) {}

   async signIn(googleToken: string): Promise<SignInResponseDto | null> {
      //We should decode google token to get user email
      const email = googleToken;

      const user = await this.usersService.findOne(email);

      if (!user) {
         return null;
      }
      const payload = { sub: user.id, user: user };

      //We should generate token and return it here instead a user password
      return {
         accessToken: await this.jwtService.signAsync(payload),
      };
   }
}
