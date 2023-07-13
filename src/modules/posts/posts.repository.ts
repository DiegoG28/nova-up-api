import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { Post } from './entities/posts.entity';
import { Asset } from './entities/assets.entity';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';

@Injectable()
export class PostsRepository {
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

   async findAll(isApproved?: string): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions(isApproved);

      const posts = await this.postsRepository.find(queryOptions);

      return posts;
   }

   async findLatest(limit: number): Promise<Post[]> {
      const queryOptions: FindManyOptions<Post> = {
         where: { isApproved: true },
         select: ['id', 'title', 'summary', 'assets', 'publishDate'],
         relations: ['assets'],
         order: { publishDate: 'DESC' },
         take: limit,
      };

      return await this.postsRepository.find(queryOptions);
   }

   async findPinned(): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions('true');
      queryOptions.where = { isPinned: true };
      const posts = await this.postsRepository.find(queryOptions);
      return posts;
   }

   async findByCategoryId(
      categoryId: number,
      isApproved?: string,
   ): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions(isApproved);

      queryOptions.where = {
         ...queryOptions.where,
         category: { id: categoryId },
      };

      return await this.postsRepository.find(queryOptions);
   }

   async findById(postId: number): Promise<Post | null> {
      const post = await this.postsRepository.findOne({
         where: { id: postId },
         relations: ['category', 'career', 'assets'],
      });

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
      } finally {
         await queryRunner.release();
      }
   }

   async remove(post: Post): Promise<void> {
      const queryRunner = this.dataSource.createQueryRunner();

      queryRunner.connect();
      await queryRunner.startTransaction();

      try {
         if (post.assets.length > 0) {
            post.assets.map(async (asset) => {
               await this.assetsRepository.delete(asset.id);
            });
         }
         await this.postsRepository.delete(post.id);

         await queryRunner.commitTransaction();
      } catch (err) {
         await queryRunner.rollbackTransaction();
      } finally {
         await queryRunner.release();
      }
   }

   async update(post: Post, updatedPostData: UpdatePostDto): Promise<Post> {
      const queryRunner = this.dataSource.createQueryRunner();

      queryRunner.connect();
      await queryRunner.startTransaction();

      try {
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
         await queryRunner.rollbackTransaction();
      } finally {
         await queryRunner.release();
      }
   }
}