import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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

      private readonly dataSource: DataSource,
   ) {}

   private mapPostsToDto(posts: Post[]): PostDto[] {
      return posts.map((post) => {
         const { category, career, ...rest } = post;
         return {
            ...rest,
            categoryName: category.name,
            careerName: career.name,
         };
      });
   }

   async findAll(): Promise<PostDto[]> {
      const posts: Post[] = await this.postsRepository.find({
         relations: ['category', 'career', 'assets'],
      });

      return this.mapPostsToDto(posts);
   }

   async findByCategoryId(categoryId: number): Promise<PostDto[]> {
      const posts: Post[] = await this.postsRepository.find({
         where: { category: { id: categoryId } },
         relations: ['category', 'career', 'assets'],
      });

      return this.mapPostsToDto(posts);
   }

   async create(createPostDto: CreatePostDto): Promise<Post> {
      const { assets, ...postData } = createPostDto;

      const queryRunner = this.dataSource.createQueryRunner();

      queryRunner.connect;
      await queryRunner.startTransaction();

      try {
         const createdAssets = assets.map((asset) =>
            this.assetsRepository.create(asset),
         );
         await queryRunner.manager.save(createdAssets);

         const createdPost = this.postsRepository.create({
            ...postData,
            career: { id: postData.careerId },
            category: { id: postData.categoryId },
         });
         createdPost.assets = createdAssets;
         await queryRunner.manager.save(createdPost);

         await queryRunner.commitTransaction();
         return createdPost;
      } catch (err) {
         await queryRunner.rollbackTransaction();

         throw err;
      } finally {
         await queryRunner.release();
      }
   }
}
