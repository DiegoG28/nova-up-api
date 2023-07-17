import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { JwtPayload, SignInResponseDto } from './dtos/sign-in.dto';

@Injectable()
export class AuthService {
   constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
      private configService: ConfigService,
   ) {}

   async signIn(googleToken: string): Promise<SignInResponseDto> {
      const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

      const client = new OAuth2Client(googleClientId);

      const ticket = await client.verifyIdToken({
         idToken: googleToken,
         audience: googleClientId,
      });
      const googlePayload = ticket.getPayload();

      if (!googlePayload)
         throw new UnauthorizedException('Invalid Google token.');

      const { email } = googlePayload;

      if (!email)
         throw new UnauthorizedException('Email not provided in Google token.');

      const user = await this.usersService.findOne(email);

      const payload: JwtPayload = { sub: user.id, user };

      return {
         accessToken: await this.jwtService.signAsync(payload),
      };
   }
}
