import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db-config';

@Module({
   imports: [
      TypeOrmModule.forRoot({
         ...dataSourceOptions,
         autoLoadEntities: true,
      }),
   ],
})
export class DatabaseModule {}
