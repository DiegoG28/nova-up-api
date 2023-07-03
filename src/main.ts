import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './libs/swaggerConfig';
import * as express from 'express';
import * as path from 'path';
import 'dotenv/config';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   const document = SwaggerModule.createDocument(app, swaggerConfig);
   SwaggerModule.setup('api', app, document, {
      customCssUrl:
         'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.1.0/swagger-ui.min.css',
   });

   app.use('/assets', express.static(path.join(__dirname, '../assets')));

   await app.listen(parseInt(process.env.PORT) || 3000);
}
bootstrap();
