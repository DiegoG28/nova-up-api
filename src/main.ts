import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './libs/swaggerConfig';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
   const app: NestExpressApplication = await NestFactory.create(AppModule);

   const document = SwaggerModule.createDocument(app, swaggerConfig);
   SwaggerModule.setup('api', app, document);

   await app.listen(3000);
}
bootstrap();
