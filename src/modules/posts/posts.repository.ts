import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
   DataSource,
   DeepPartial,
   FindManyOptions,
   In,
   QueryRunner,
   Repository,
} from 'typeorm';
import { Post, PostTypeEnum } from './posts.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class PostsRepository {
   constructor(
      @InjectRepository(Post)
      private readonly postsRepository: Repository<Post>,

      private readonly dataSource: DataSource,
   ) {}

   async findAll(showApproved?: boolean): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions(showApproved);

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
      const queryOptions = this.getPostCardQueryOptions(true);
      queryOptions.where = {
         isPinned: true,
         type: In([
            PostTypeEnum.InternalConvocatory,
            PostTypeEnum.ExternalConvocatory,
         ]),
      };
      const posts = await this.postsRepository.find(queryOptions);
      return posts;
   }

   async findByUser(userId: number): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions();

      queryOptions.where = {
         ...queryOptions.where,
         user: { id: userId },
      };

      return await this.postsRepository.find(queryOptions);
   }

   async findByCategory(categoryId: number): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions(true);

      queryOptions.where = {
         ...queryOptions.where,
         category: { id: categoryId },
      };

      return await this.postsRepository.find(queryOptions);
   }

   async findById(postId: number): Promise<Post | null> {
      const post = await this.postsRepository.findOne({
         where: { id: postId },
         relations: ['category', 'assets'],
      });

      return post;
   }

   async create(
      newPostData: DeepPartial<Post>,
      userId: number,
      queryRunner: QueryRunner,
   ): Promise<Post['id']> {
      const createdPost = this.postsRepository.create({
         ...newPostData,
         user: { id: userId },
      });
      await queryRunner.manager.save(createdPost);

      return createdPost.id;
   }

   async update(newPost: QueryDeepPartialEntity<Post>, currentPostId: number) {
      await this.postsRepository.update(currentPostId, newPost);
   }

   async updatePin(post: Post, pinStatus: boolean): Promise<void> {
      post.isPinned = pinStatus;
      await this.postsRepository.save(post);
   }

   async updateApproved(
      post: Post,
      approvedStatus: boolean,
      comments: string,
   ): Promise<void> {
      post.isApproved = approvedStatus;
      if (approvedStatus) {
         post.publishDate = new Date();
         post.comments = '';
      } else {
         post.publishDate = null as any;
         post.comments = comments;
      }
      await this.postsRepository.save(post);
   }

   async remove(post: Post): Promise<void> {
      const queryRunner = this.dataSource.createQueryRunner();

      queryRunner.connect();
      await queryRunner.startTransaction();

      try {
         await this.postsRepository.delete(post.id);

         await queryRunner.commitTransaction();
      } catch (err) {
         await queryRunner.rollbackTransaction();
      } finally {
         await queryRunner.release();
      }
   }

   private getPostCardQueryOptions(
      showApproved?: boolean,
   ): FindManyOptions<Post> {
      const queryOptions: FindManyOptions<Post> = {
         select: [
            'id',
            'title',
            'summary',
            'type',
            'category',
            'assets',
            'isApproved',
            'tags',
         ],
         relations: ['category', 'assets'],
      };

      if (typeof showApproved !== 'undefined') {
         queryOptions.where = {
            isApproved: showApproved,
         };
      }

      return queryOptions;
   }
}
