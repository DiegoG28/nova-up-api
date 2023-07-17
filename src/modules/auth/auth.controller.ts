import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignInResponseDto } from './dtos/sign-in.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './auth.decorators';

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
   @Public()
   @Post('login')
   async signIn(@Body() signInDto: SignInDto) {
      try {
         return await this.authService.signIn(signInDto.googleToken);
      } catch (err) {
         throw err;
      }
   }
}
