import { IsJWT } from 'class-validator';
import { User } from 'src/modules/users/users.entity';

export class SignInDto {
   @IsJWT()
   googleToken: string;
}

export class SignInResponseDto {
   accessToken: string;
}

export class JwtPayload {
   sub: number;
   user: User;
}
