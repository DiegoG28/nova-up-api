import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
   .setTitle('Nova UPQROO')
   .setDescription(
      'API para la página web Nova de la Universidad Politécnica de Quintana Roo',
   )
   .setVersion('1.0')
   .addBearerAuth()
   .addServer('http://localhost:3000/', 'Desarrollo Local')
   .addServer('http://servicios.upqroo.edu.mx/nova-up-api', 'Producción')
   .build();
