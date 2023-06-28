import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './libs/swaggerConfig';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

   const document = SwaggerModule.createDocument(app, swaggerConfig);
   SwaggerModule.setup('api', app, document, {
      customCssUrl:
         'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      customJs: [
         'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
         'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
      ],
   });

   await app.listen(3000);
}
bootstrap();
