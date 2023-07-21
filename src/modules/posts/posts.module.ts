import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/posts.entity';
import { Asset } from './entities/assets.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { PostsMapperService } from './posts-mapper.service';
import { CatalogsModule } from '../catalogs/catalogs.module';

@Module({
   imports: [TypeOrmModule.forFeature([Asset, Post]), CatalogsModule],
   controllers: [PostsController],
   providers: [PostsRepository, PostsService, PostsMapperService],
})
export class PostsModule {}
