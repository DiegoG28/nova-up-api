import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './libs/swaggerConfig';
import * as express from 'express';
import * as path from 'path';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
   const app = await NestFactory.create(AppModule, { cors: true });

   const document = SwaggerModule.createDocument(app, swaggerConfig);
   SwaggerModule.setup('api-docs', app, document, {
      customCssUrl:
         'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.1.0/swagger-ui.min.css',
   });

   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         forbidNonWhitelisted: true,
      }),
   );

   app.use('/assets', express.static(path.join(__dirname, '../assets')));
   app.use('/docs', express.static(path.join(__dirname, '../docs')));

   await app.listen(process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
}
bootstrap();
