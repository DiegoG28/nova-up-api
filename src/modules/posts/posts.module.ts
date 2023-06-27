import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCategory } from './entities/categories.entity';
import { Post } from './entities/posts.entity';
import { PostAsset } from './entities/assets.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
   imports: [TypeOrmModule.forFeature([PostCategory, PostAsset, Post])],
   controllers: [PostsController],
   providers: [PostsService],
})
export class PostsModule {}
