import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
   .setTitle('Nova UPQROO')
   .setDescription(
      'API para la página web Nova de la Universidad Politécnica de Quintana Roo',
   )
   .setVersion('1.0')
   .addBearerAuth()
   .addServer(process.env.NODE_ENV === 'production' ? 'nova-up-api' : '')
   .build();
