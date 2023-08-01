import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
   imports: [
      ConfigModule.forRoot(),
      UsersModule,
      JwtModule.register({
         global: true,
         secret: process.env.JWT_SECRET,
         signOptions: { expiresIn: '18h' },
      }),
   ],
   controllers: [AuthController],
   providers: [
      AuthService,
      {
         provide: APP_GUARD,
         useClass: AuthGuard,
      },
   ],
})
export class AuthModule {}
