import { IsJWT } from 'class-validator';

export class SignInDto {
   @IsJWT()
   googleToken: string;
}

export class SignInResponseDto {
   accessToken: string;
}
