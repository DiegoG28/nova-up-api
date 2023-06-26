import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostCategory } from './entities/categories.entity';
import { Post } from './entities/posts.entity';
import { PostAsset } from './entities/assets.entity';

@Module({
   imports: [TypeOrmModule.forFeature([PostCategory, PostAsset, Post])],
})
export class PostsModule {}
