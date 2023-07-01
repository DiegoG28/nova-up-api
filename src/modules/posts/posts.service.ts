import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/posts.entity';
import { PostDto } from './dtos/posts.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { Asset } from './entities/assets.entity';

@Injectable()
export class PostsService {
   constructor(
      @InjectRepository(Post)
      private readonly postsRepository: Repository<Post>,

      @InjectRepository(Asset)
      private readonly assetsRepository: Repository<Asset>,
   ) {}

   async findAll(): Promise<PostDto[]> {
      const posts: Post[] = await this.postsRepository.find({
         relations: ['category', 'career', 'assets'],
      });

      const mappedPosts: PostDto[] = posts.map((post) => {
         const { category, career, ...rest } = post;
         return {
            ...rest,
            categoryName: category.name,
            careerName: career.name,
         };
      });

      return mappedPosts;
   }

   async create(createPostDto: CreatePostDto): Promise<Post> {
      const { assets, ...postData } = createPostDto;

      const createdAssets = assets.map((asset) =>
         this.assetsRepository.create(asset),
      );
      await this.assetsRepository.save(createdAssets);

      const createdPost = this.postsRepository.create({
         ...postData,
         career: { id: postData.careerId },
         category: { id: postData.categoryId },
      });
      createdPost.assets = createdAssets;
      await this.postsRepository.save(createdPost);
      return createdPost;
   }
}
