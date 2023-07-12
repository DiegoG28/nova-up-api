import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/posts.entity';
import { Asset } from './entities/assets.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
   imports: [TypeOrmModule.forFeature([Asset, Post])],
   controllers: [PostsController],
   providers: [PostsService],
})
export class PostsModule {}
