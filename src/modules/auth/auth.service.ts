import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

import { UsersService } from '../users/users.service';
import { SignInResponseDto } from './dtos/sign-in.dto';

@Injectable()
export class AuthService {
   constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
      private configService: ConfigService,
   ) {}

   async signIn(googleToken: string): Promise<SignInResponseDto | null> {
      const client = new OAuth2Client(
         this.configService.get<string>('GOOGLE_CLIENT_ID'),
      );

      let googlePayload: TokenPayload;
      try {
         const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
         });
         googlePayload = ticket.getPayload();
      } catch (e) {
         throw new UnauthorizedException('Invalid Google token.');
      }

      const email = googlePayload['email'];

      const user = await this.usersService.findOne(email);

      if (!user) {
         return null;
      }
      const payload = { sub: user.id, user: user };

      return {
         accessToken: await this.jwtService.signAsync(payload),
      };
   }
}
