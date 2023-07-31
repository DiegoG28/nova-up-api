import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './posts.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { PostsMapperService } from './posts-mapper.service';
import { CatalogsModule } from '../catalogs/catalogs.module';
import { AssetsModule } from '../assets/assets.module';

@Module({
   imports: [TypeOrmModule.forFeature([Post]), AssetsModule, CatalogsModule],
   controllers: [PostsController],
   providers: [PostsRepository, PostsService, PostsMapperService],
})
export class PostsModule {}
