import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { StudentsModule } from './modules/students/students.module';
import { DatabaseModule } from './database/database.module';
import { PostsModule } from './modules/posts/posts.module';
import { CareersModule } from './modules/careers/careers.module';
import { EventRegistrationsModule } from './modules/event-registrations/event-registrations.module';

@Module({
   imports: [
      ConfigModule.forRoot(),
      StudentsModule,
      PostsModule,
      CareersModule,
      EventRegistrationsModule,
      DatabaseModule,
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
