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
import { Post, PostStatusEnum, PostTypeEnum } from './posts.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

/**
 * The PostsRepository is responsible for data access and manipulation for the Post entity.
 * It abstracts the database operations, providing a set of methods to interact with posts data.
 *
 * This repository acts as an additional layer on top of the default TypeORM Repository,
 * adding potential for custom methods and more granular control over queries, if needed.
 *
 * @class
 */
@Injectable()
export class PostsRepository {
   /**
    * Constructs the PostsRepository.
    *
    * @param postsRepository - The default TypeORM repository for the Post entity.
    * @param dataSource - A service/data source for potential transactions.
    */
   constructor(
      @InjectRepository(Post)
      private readonly postsRepository: Repository<Post>,

      private readonly dataSource: DataSource,
   ) {}

   /**
    * Retrieves all posts based on their status.
    *
    * This method fetches all the posts from the database, optionally filtering them based on
    * their status.
    *
    * @param status - Optional flag to filter posts based on their status.
    *
    * @returns An array of `Post` entities fitting the specified criteria.
    */
   async findAll(status?: PostStatusEnum): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions(status);

      const posts = await this.postsRepository.find(queryOptions);

      return posts;
   }

   /**
    * Retrieves the latest posts up to the specified limit.
    *
    * This method fetches a subset of the most recent posts that have been approved, sorted in
    * descending order by their publish date.
    *
    * @param limit - The maximum number of posts to retrieve.
    *
    * @returns An array of the latest `Post` entities up to the specified limit.
    */
   async findLatest(limit: number): Promise<Post[]> {
      const queryOptions: FindManyOptions<Post> = {
         where: { status: PostStatusEnum.Approved },
         select: ['id', 'title', 'summary', 'assets', 'publishDate'],
         relations: ['assets'],
         order: { publishDate: 'DESC' },
         take: limit,
      };

      return await this.postsRepository.find(queryOptions);
   }

   /**
    * Retrieves all pinned convocatory posts that are approved.
    *
    * This method fetches all the approved posts from the database that are pinned and belong
    * to either Internal or External convocatory types.
    *
    * @returns An array of `Post` entities that are pinned convocatories.
    */
   async findPinned(): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions(
         PostStatusEnum.Approved,
      );
      queryOptions.where = {
         ...queryOptions.where,
         isPinned: true,
         type: In([
            PostTypeEnum.InternalConvocatory,
            PostTypeEnum.ExternalConvocatory,
         ]),
      };

      const posts = await this.postsRepository.find(queryOptions);
      return posts;
   }

   /**
    * Retrieves all posts authored by a specific user.
    *
    * This method fetches all the posts from the database that have been authored by a user
    * with the given user ID. This is useful for displaying all articles or posts written by a
    * particular user or for gathering a user's contribution to the platform.
    *
    * @param userId - The ID of the user whose posts are to be retrieved.
    *
    * @returns An array of `Post` entities authored by the specified user.
    */
   async findByUser(userId: number): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions();

      queryOptions.where = {
         ...queryOptions.where,
         user: { id: userId },
      };

      return await this.postsRepository.find(queryOptions);
   }

   /**
    * Retrieves all posts belonging to a specific category.
    *
    * This method fetches all the approved posts from the database that belong to the specified
    * category ID.
    *
    * @param categoryId - The ID of the category whose posts are to be retrieved.
    *
    * @returns An array of `Post` entities belonging to the specified category.
    */
   async findByCategory(categoryId: number): Promise<Post[]> {
      const queryOptions = this.getPostCardQueryOptions(
         PostStatusEnum.Approved,
      );

      queryOptions.where = {
         ...queryOptions.where,
         category: { id: categoryId },
      };

      return await this.postsRepository.find(queryOptions);
   }

   /**
    * Retrieves a specific post by its ID.
    *
    * This method fetches a post with the specified ID from the database. It also ensures that
    * associated entities such as category and assets are loaded along with the main post entity.
    * This is useful for viewing a complete article or post with all its related information.
    *
    * @param postId - The ID of the post to be retrieved.
    *
    * @returns A `Post` entity if found, otherwise null.
    */
   async findById(postId: number): Promise<Post | null> {
      const post = await this.postsRepository.findOne({
         where: { id: postId },
         relations: ['category', 'assets'],
      });

      return post;
   }

   /**
    * Creates a new post in the database.
    *
    * The query runner is then used to persist the post in the database. This method always
    * create a post as part of a larger transaction.
    *
    * @param newPostData - The data for the new post. Should be a partial Post entity.
    * @param userId - The ID of the user authoring the post.
    * @param queryRunner - The query runner for executing the transaction.
    *
    * @returns The ID of the newly created post.
    */
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

   /**
    * Updates an existing post in the database based on its ID.
    *
    * @param newPost - An object containing the fields to be updated. The fields not present
    *                  in this object will remain unchanged in the database.
    * @param currentPostId - The ID of the post to be updated.
    */
   async update(newPost: QueryDeepPartialEntity<Post>, currentPostId: number) {
      await this.postsRepository.update(currentPostId, newPost);
   }

   /**
    * Updates the pinned status of a post in the database.
    *
    * @param post - The post entity whose pinned status needs to be updated.
    * @param pinStatus - A boolean indicating the new pinned status for the post. `true`
    *                    marks the post as pinned, while `false` unpins it.
    */
   async updatePin(post: Post, pinStatus: boolean): Promise<void> {
      post.isPinned = pinStatus;
      await this.postsRepository.save(post);
   }

   /**
    * Updates a post's approval status and associated fields.
    *
    * - Sets the post's status according to the given PostStatusEnum value.
    * - Updates comments.
    * - Sets the `publishDate` to the current date if approved; null otherwise.
    *
    * @param post - The post to update.
    * @param status - New status from PostStatusEnum.
    * @param comments - Feedback or comments.
    * @returns Promise<void> - Completes upon successful update.
    */
   async updatePostStatus(
      post: Post,
      status: PostStatusEnum,
      comments: string | null,
   ): Promise<void> {
      post.status = status;
      post.comments = comments;
      post.publishDate = status === PostStatusEnum.Approved ? new Date() : null;
      await this.postsRepository.save(post);
   }

   /**
    * Deletes a post from the database.
    *
    * This method attempts to delete a post from the database using a transaction.
    *
    * @param postId - The associated ID to the post to be deleted.
    * @throws Will throw an error if the deletion process fails.
    */
   async remove(postId: number): Promise<void> {
      const queryRunner = this.dataSource.createQueryRunner();

      queryRunner.connect();
      await queryRunner.startTransaction();

      try {
         await this.postsRepository.delete(postId);

         await queryRunner.commitTransaction();
      } catch (err) {
         await queryRunner.rollbackTransaction();
      } finally {
         await queryRunner.release();
      }
   }

   /**
    * Generates query options to fetch specific fields of a Post entity tailored
    * for a "post card" view.
    *
    * This method is used to construct a more performant and specific query when only a subset * of post fields are needed, such as for a post overview or listing. By specifying only the * necessary fields and relations, it helps reduce the overhead of data retrieval.
    *
    * @param status - Optional flag to filter posts based on their status.
    *
    * @returns A set of query options suitable for the TypeORM `find` method.
    */
   private getPostCardQueryOptions(
      status?: PostStatusEnum,
   ): FindManyOptions<Post> {
      const queryOptions: FindManyOptions<Post> = {
         select: [
            'id',
            'title',
            'summary',
            'publishDate',
            'type',
            'category',
            'assets',
            'status',
            'comments',
            'tags',
         ],
         relations: ['category', 'assets'],
         order: { publishDate: 'DESC' },
      };
      if (typeof status !== 'undefined') {
         queryOptions.where = {
            status: status,
         };
      }

      return queryOptions;
   }
}
