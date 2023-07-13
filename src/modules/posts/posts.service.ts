import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { Post } from './entities/posts.entity';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Asset } from './entities/assets.entity';
import { PostCardDto } from './dtos/posts-cards.dto';
import { PostBannerDto } from './dtos/posts-banner.dto';
import { PostDto } from './dtos/posts.dto';

@Injectable()
export class PostsService {
   constructor(
      @InjectRepository(Post)
      private readonly postsRepository: Repository<Post>,

      @InjectRepository(Asset)
      private readonly assetsRepository: Repository<Asset>,

      private readonly dataSource: DataSource,
   ) {}

   private getPostCardQueryOptions(isApproved?: string): FindManyOptions<Post> {
      const queryOptions: FindManyOptions<Post> = {
         select: [
            'id',
            'title',
            'summary',
            'category',
            'assets',
            'isApproved',
            'tags',
         ],
         relations: ['category', 'assets'],
      };

      if (typeof isApproved !== 'undefined') {
         queryOptions.where = {
            isApproved: isApproved === 'true',
         };
      }

      return queryOptions;
   }

   getCoverImage(assets: Asset[]): string {
      const coverImage = assets.find((asset) => asset.isCoverImage);
      if (coverImage && coverImage.name) return coverImage.name;
      return '';
   }

   mapToPostCardDto(posts: Post[]): PostCardDto[] {
      return posts.map((post) => {
         const coverImage = this.getCoverImage(post.assets);
         return {
            id: post.id,
            title: post.title,
            summary: post.summary,
            category: post.category,
            coverImage,
            isApproved: post.isApproved,
            tags: post.tags,
         };
      });
   }

   mapToPostBannerDto(posts: Post[]): PostBannerDto[] {
      return posts.map((post) => {
         const coverImage = this.getCoverImage(post.assets);
         return {
            id: post.id,
            title: post.title,
            summary: post.summary,
            coverImage,
         };
      });
   }

   mapToPostDto(post: Post): PostDto {
      const coverImage = this.getCoverImage(post.assets);
      const postAssetsDto = post.assets
         .filter((asset) => !asset.isCoverImage)
         .map((asset) => {
            return {
               id: asset.id,
               name: asset.name,
               type: asset.type,
            };
         });

      return { ...post, coverImage, assets: postAssetsDto };
   }

   // --------------------------------------------------------------------------

   async findAll(isApproved?: string): Promise<Post[]> {
      if (typeof isApproved === 'undefined' || isApproved === 'false') {
         //We should validate token here because not all users can see all posts or not approved posts
      }

      const queryOptions = this.getPostCardQueryOptions(isApproved);

      const posts = await this.postsRepository.find(queryOptions);

      return posts;
   }

   async findLatest(limit = 5): Promise<Post[]> {
      const queryOptions: FindManyOptions<Post> = {
         where: { isApproved: true },
         select: ['id', 'title', 'summary', 'assets', 'publishDate'],
         relations: ['assets'],
         order: { publishDate: 'DESC' },
         take: limit,
      };

      return await this.postsRepository.find(queryOptions);
   }

   async findByCategoryId(
      categoryId: number,
      isApproved?: string,
   ): Promise<Post[]> {
      if (typeof isApproved === 'undefined' || isApproved === 'false') {
         //We should validate token here because not all users can see all posts or not approved posts
      }

      const queryOptions = this.getPostCardQueryOptions(isApproved);

      queryOptions.where = {
         ...queryOptions.where,
         category: { id: categoryId },
      };

      return await this.postsRepository.find(queryOptions);
   }

   async findById(postId: number): Promise<Post> {
      const post = await this.postsRepository.findOne({
         where: { id: postId },
         relations: ['category', 'career', 'assets'],
      });

      if (!post) {
         throw new NotFoundException('Post not found');
      }

      return post;
   }

   async create(createPostDto: CreatePostDto): Promise<Post> {
      const { assets, ...postData } = createPostDto;

      const queryRunner = this.dataSource.createQueryRunner();

      queryRunner.connect();
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

   async remove(postId: number): Promise<void> {
      const queryRunner = this.dataSource.createQueryRunner();

      queryRunner.connect();
      await queryRunner.startTransaction();

      try {
         const post = await this.findById(postId);

         if (!post) throw new NotFoundException();

         if (post.assets.length > 0) {
            post.assets.map(async (asset) => {
               await this.assetsRepository.delete(asset.id);
            });
         }
         await this.postsRepository.delete(postId);

         await queryRunner.commitTransaction();
      } catch (err) {
         await queryRunner.rollbackTransaction();
         throw err;
      } finally {
         await queryRunner.release();
      }
   }

   async update(postId: number, updatedPostData: UpdatePostDto): Promise<Post> {
      const queryRunner = this.dataSource.createQueryRunner();

      queryRunner.connect();
      await queryRunner.startTransaction();

      try {
         const post = await this.findById(postId);

         if (!post) throw new NotFoundException();

         const existingAssets = post.assets;
         const updatedAssets = updatedPostData.assets;

         //Delete assets that not coming on the data request
         const assetsToDelete = existingAssets.filter(
            (asset) =>
               !updatedAssets.some(
                  (updatedAsset) => updatedAsset.id === asset.id,
               ),
         );
         await this.assetsRepository.remove(assetsToDelete);

         //Create assets that coming on the data request and doesn't exist
         const assetsToCreate = updatedAssets.filter(
            (updatedAsset) => !updatedAsset.id,
         );
         const createdAssets = this.assetsRepository.create(assetsToCreate);
         await queryRunner.manager.save(createdAssets);

         post.assets.push(...createdAssets);

         const updatedPost = await queryRunner.manager.save(post);

         await queryRunner.commitTransaction();
         return updatedPost;
      } catch (err) {
         console.log(err);
         await queryRunner.rollbackTransaction();
         throw err;
      } finally {
         await queryRunner.release();
      }
   }
}
