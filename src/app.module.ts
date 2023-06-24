import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { StudentsModule } from './modules/students/students.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [ConfigModule.forRoot(), StudentsModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
