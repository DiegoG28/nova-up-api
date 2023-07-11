import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from './entities/posts.entity';
import { PostDto } from './dtos/posts.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { Asset, AssetTypeEnum } from './entities/assets.entity';

function filterAssetsByType(posts: Post[], assetType: string): Post[] {
   const filteredPosts: Post[] = posts.map((post) => ({
      ...post,
      assets: post.assets.filter((asset) => asset.type === assetType),
   }));

   return filteredPosts;
}

@Injectable()
export class PostsService {
   constructor(
      @InjectRepository(Post)
      private readonly postsRepository: Repository<Post>,

      @InjectRepository(Asset)
      private readonly assetsRepository: Repository<Asset>,

      private readonly dataSource: DataSource,
   ) {}

   /*private mapPostsToDto(posts: Post[]): PostDto[] {
      return posts.map((post) => {
         const { category, career, ...rest } = post;
         return {
            ...rest,
            categoryName: category.name,
            careerName: career.name,
         };
      });
   }*/
   async findAll(): Promise<Post[]> {
      const posts: Post[] = await this.postsRepository.find({
         select: ['id', 'title', 'summary', 'category', 'assets'],
         relations: ['category', 'assets'],
      });

      const filteredPosts: Post[] = filterAssetsByType(
         posts,
         AssetTypeEnum.Image,
      );

      return filteredPosts;
   }

   async findByCategoryId(categoryId: number): Promise<Post[]> {
      const posts: Post[] = await this.postsRepository.find({
         where: { category: { id: categoryId } },
         select: ['id', 'title', 'summary', 'category', 'assets'],
         relations: ['category', 'assets'],
      });

      return posts;
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

   async update(postId: number, updatedPostData: PostDto): Promise<Post> {
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
