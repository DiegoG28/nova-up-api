import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignInResponseDto } from './dtos/sign-in.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
   constructor(private authService: AuthService) {}

   @ApiOperation({ summary: 'Autentificación con Google' })
   @ApiResponse({
      status: 201,
      description: 'Usuario logueado exitosamente',
      type: SignInResponseDto,
   })
   @Post('login')
   signIn(@Body() signInDto: SignInDto) {
      try {
         const signInResponse = this.authService.signIn(signInDto.googleToken);
         if (!signInResponse) {
            throw new UnauthorizedException('Unauthorized user');
         }
      } catch (err) {
         throw err;
      }
   }
}
