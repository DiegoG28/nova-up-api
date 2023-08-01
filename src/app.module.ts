import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { PostsModule } from './modules/posts/posts.module';
import { UsersModule } from './modules/users/users.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
   imports: [
      DatabaseModule,
      AuthModule,
      PostsModule,
      UsersModule,
      CatalogsModule,
   ],
})
export class AppModule {}
