import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { PostsModule } from './modules/posts/posts.module';
import { CareersModule } from './modules/careers/careers.module';
import { EventRegistrationsModule } from './modules/event-registrations/event-registrations.module';
import { UsersModule } from './modules/users/users.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';

@Module({
   imports: [
      // StudentsModule,
      PostsModule,
      CareersModule,
      EventRegistrationsModule,
      UsersModule,
      DatabaseModule,
      CatalogsModule,
   ],
   controllers: [AppController],
   providers: [AppService],
})
export class AppModule {}
