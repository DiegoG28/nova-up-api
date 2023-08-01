import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { JwtPayload, SignInResponseDto } from './dtos/sign-in.dto';
import { Errors } from 'src/libs/errors';

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
         throw new UnauthorizedException(Errors.INVALID_GOOGLE_TOKEN);

      const { email } = googlePayload;

      if (!email)
         throw new UnauthorizedException(Errors.NO_EMAIL_IN_GOOGLE_TOKEN);

      const user = await this.usersService.findOne(email);

      const payload: JwtPayload = { sub: user.id, user };

      return {
         accessToken: await this.jwtService.signAsync(payload),
      };
   }
}
