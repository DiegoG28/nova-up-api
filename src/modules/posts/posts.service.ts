import {
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostsMapperService } from './posts-mapper.service';
import { PostSummaryDto, PostCardDto, PostDto } from './dtos/posts.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { Post, PostStatusEnum, PostTypeEnum } from './posts.entity';
import { CatalogsService } from '../catalogs/catalogs.service';
import { AssetsService } from '../assets/assets.service';
import { UpdatePostDto } from './dtos/update-post.dto';
import { DataSource, DeepPartial, QueryRunner } from 'typeorm';
import { Errors } from 'src/libs/errors';
import { StatusResponse } from 'src/libs/status-response.dto';

/**
 * Service responsible for handling posts operations.
 *
 * @class
 */
@Injectable()
export class PostsService {
   /**
    * Creates an instance of the PostsService.
    *
    * @param postsRepository - Repository for CRUD operations on Posts.
    * @param postsMapperService - Service responsible for mapping between Post entities and
    * DTOs.
    * @param catalogsService - Service to retrieve Catalog related data.
    * @param assetsService - Service to manage assets.
    * @param dataSource - TypeORM data source, used only to create transactions.
    */
   constructor(
      private readonly postsRepository: PostsRepository,
      private readonly postsMapperService: PostsMapperService,
      private readonly catalogsService: CatalogsService,
      private readonly assetsService: AssetsService,
      private readonly dataSource: DataSource,
   ) {}

   /**
    * Retrieves all the posts based on their status. If no status is sended, it will return all
    * posts. Editors and users can only access approved posts.
    *
    * @param userRole - The role of the user making the request.
    * @param status - Optional parameter filter posts by status.
    * @returns An array of posts in DTO format.
    * @throws ForbiddenException If an unauthorized user tries to access unapproved or rejected posts.
    */
   async findAll(
      userRole: string,
      status?: PostStatusEnum,
   ): Promise<PostCardDto[]> {
      const isRestrictedStatus =
         status === PostStatusEnum.Rejected ||
         status === PostStatusEnum.Pending ||
         typeof status === 'undefined';
      const isGuestUserOrEditor = !userRole || userRole === 'Editor';
      const isUnauthorizedAccess = isRestrictedStatus && isGuestUserOrEditor;

      if (isUnauthorizedAccess) {
         throw new ForbiddenException(Errors.ACCESS_DENIED_TO_RESOURCE);
      }

      const posts = await this.postsRepository.findAll(status);
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);
      return postsCardDto;
   }

   /**
    * Retrieves the latest posts based on the given limit. Only returns approved posts.
    *
    * @param limit - Optional parameter specifying the maximum number of posts to retrieve.
    * Default is 5.
    * @returns An array of the latest posts in DTO format.
    */
   async findLatest(limit = 5): Promise<PostSummaryDto[]> {
      const posts = await this.postsRepository.findLatest(limit);
      const postsBannerDto = this.postsMapperService.mapToPostSummaryDto(posts);
      return postsBannerDto;
   }

   /**
    * Retrieves all the posts that are marked as "pinned". Only returns approved posts.
    *
    * @returns An array of pinned posts in DTO format.
    */
   async findPinned(): Promise<PostCardDto[]> {
      const posts = await this.postsRepository.findPinned();
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);
      return postsCardDto;
   }

   /**
    * Retrieves all the posts authored by the specified user.
    *
    * @param userId - The ID of the user whose posts are to be retrieved.
    * @returns An array of posts authored by the user in DTO format.
    */
   async findByUser(userId: number): Promise<PostCardDto[]> {
      const posts = await this.postsRepository.findByUser(userId);
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);

      return postsCardDto;
   }

   /**
    * Retrieves all the posts associated with the specified category. Only returns approved
    * posts.
    *
    * @param categoryId - The ID of the category to retrieve posts from.
    * @returns An array of posts associated with the category in DTO format.
    */
   async findByCategory(categoryId: number): Promise<PostCardDto[]> {
      const posts = await this.postsRepository.findByCategory(categoryId);
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);

      return postsCardDto;
   }

   /**
    * Retrieves the detailed information of a specific post by its ID.
    *
    * @param postId - The ID of the post to retrieve.
    * @returns The detailed post data in DTO format.
    * @throws NotFoundException if the post with the given ID is not found.
    */
   async findById(postId: number): Promise<PostDto> {
      const post = await this.postsRepository.findById(postId);
      if (!post) throw new NotFoundException(Errors.POST_NOT_FOUND);
      const postDto = this.postsMapperService.mapToPostDto(post);
      return postDto;
   }

   /**
    * Fetches the Post entity for the specified post ID.
    * Primarily used when needing the actual entity rather than the DTO representation.
    *
    * @param postId - The ID of the post entity to retrieve.
    * @returns The Post entity corresponding to the given ID.
    * @throws NotFoundException if the post with the given ID is not found.
    */
   async findOne(postId: number): Promise<Post> {
      const post = await this.postsRepository.findById(postId);
      if (!post) throw new NotFoundException(Errors.POST_NOT_FOUND);
      return post;
   }

   /**
    * Creates a new post, handling both links and attached files.
    * The function uses a transaction to ensure that all steps in the creation process
    * are successful; if any step fails, the transaction is rolled back to maintain data integrity.
    *
    * 1. Separates the provided links from the rest of the post data.
    * 2. Finds and associates the appropriate category to the post.
    * 3. Creates the post in the repository.
    * 4. Processes and creates assets (links, files, cover image) for the post.
    *
    * If the entire process completes successfully, the function commits the transaction,
    * ensuring that all changes are saved. If any step fails, the transaction is rolled back,
    * ensuring that the database remains in a consistent state.
    *
    * @param newPostData - Data for the new post, including links.
    * @param userId - ID of the user creating the post.
    * @param files - Optional array of attached files.
    * @param coverImageFile - Optional cover image file.
    * @returns An object indicating the success status and a success message.
    * @throws Error if any step in the creation process fails.
    */
   async create(
      newPostData: CreatePostDto,
      userId: number,
      files?: Express.Multer.File[],
      coverImageFile?: Express.Multer.File,
   ): Promise<StatusResponse> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const createdFiles: string[] = [];

      try {
         const { links, ...restFields } = newPostData;
         const category = await this.catalogsService.findCategoryById(
            newPostData.categoryId,
         );

         const newPost: DeepPartial<Post> = { ...restFields, category };
         const createdPostId = await this.postsRepository.create(
            newPost,
            userId,
            queryRunner,
         );

         const createdAssets = await this.createPostAssets(
            createdPostId,
            links,
            files,
            coverImageFile,
            queryRunner,
         );

         createdFiles.push(...createdAssets);

         await queryRunner.commitTransaction();

         return {
            status: 'Success',
            message: `Post ${createdPostId} successfully created`,
         };
      } catch (err) {
         await queryRunner.rollbackTransaction();
         throw err;
      } finally {
         await queryRunner.release();
      }
   }

   /**
    * Creates and associates assets (links, files, cover images) with a given post.
    *
    * This function handles the creation of different types of assets for a post, namely:
    * 1. Links: If provided, are split by comma and each link is created as an individual asset.
    * 2. Files: Each file in the provided array is created as an asset.
    * 3. Cover Image: If provided, is created as an asset with the isCoverImage status set to true.
    *
    * Each created asset is accumulated into a list of asset names which is then returned.
    *
    * @param postId - ID of the post with which the assets will be associated.
    * @param links - Optional string containing comma-separated links to be added as assets.
    * @param files - Optional array of files to be added as assets.
    * @param coverImageFile - Optional file to be set as the post's cover image.
    * @param queryRunner - Optional query runner for transactional operations.
    * @returns An array of names of all the created assets.
    */
   async createPostAssets(
      postId: number,
      links?: string,
      files?: Express.Multer.File[],
      coverImageFile?: Express.Multer.File,
      queryRunner?: QueryRunner,
   ): Promise<string[]> {
      const createdAssets: string[] = [];

      if (links) {
         const arrayLinks = links.split(',');

         const createdLinks = await this.assetsService.createAssets(
            postId,
            arrayLinks,
            queryRunner,
         );
         createdAssets.push(
            ...createdLinks.map((createdLink) => createdLink.name),
         );
      }

      if (files) {
         const createdFiles = await this.assetsService.createAssets(
            postId,
            files,
            queryRunner,
         );
         createdAssets.push(
            ...createdFiles.map((createdFile) => createdFile.name),
         );
      }

      if (coverImageFile) {
         const createdFile = await this.assetsService.createAsset(
            postId,
            coverImageFile,
            queryRunner,
            true,
         );
         createdAssets.push(createdFile.name);
      }

      return createdAssets;
   }

   /**
    * Updates an existing post with the provided data.
    *
    * This function updates a post's fields with the values provided in the `postData` parameter.
    * Special handling is done for the `categoryId` field; instead of directly updating the
    * post's `categoryId`, the function retrieves the associated category entity and then
    * updates the post's `category` relation.
    *
    * After updating the post, a success message is returned.
    *
    * @param postData - Data to update the post with. It can contain a subset of the post's fields.
    * @param currentPostId - ID of the post to be updated.
    * @returns An object containing the status and a message indicating the post was updated.
    * @throws NotFoundException If the post with the provided ID is not found.
    */
   async update(
      postData: Partial<UpdatePostDto>,
      currentPostId: number,
   ): Promise<{ status: string; message: string }> {
      await this.findOne(currentPostId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { categoryId, ...restFields } = postData;
      const newPost: Partial<Post> = restFields;

      if (postData.categoryId) {
         const category = await this.catalogsService.findCategoryById(
            postData.categoryId,
         );
         newPost.category = category;
      }

      await this.postsRepository.update(newPost, currentPostId);
      return { status: 'Success', message: 'Post successfully updated' };
   }

   /**
    * Updates the pin status of a given post. The business rules dictate that there can only
    * be one 'InternalConvocatory' and one 'ExternalConvocatory' post pinned at any given time.
    * Thus, if a post of one of these types is being pinned, any previously pinned post of the
    * same type will be automatically unpinned to ensure compliance with this rule.
    *
    * The function eases the user's task by automating the unpinning of the conflicting post,
    * rather than requiring the user to do it manually.
    *
    * @param postId - The ID of the post whose pin status needs to be updated.
    * @returns An object indicating the success status and a success message.
    * @throws NotFoundException if the post with the given ID is not found.
    * @throws ForbiddenException if trying to pin a post that isn't of type 'InternalConvocatory' or 'ExternalConvocatory'.
    */
   async updatePinStatus(postId: number) {
      const currentPost = await this.findOne(postId);
      if (
         currentPost.type !== PostTypeEnum.InternalConvocatory &&
         currentPost.type !== PostTypeEnum.ExternalConvocatory
      )
         throw new ForbiddenException(Errors.CANNOT_PIN_NO_CONVO_POST);

      const pinnedPosts = await this.postsRepository.findPinned();

      //Override isPinned from existing convocatories posts
      const isPinning = !currentPost.isPinned;

      if (pinnedPosts.length > 0 && isPinning) {
         await this.overridePinnedPosts(pinnedPosts, currentPost);
      }
      await this.postsRepository.updatePin(currentPost, !currentPost.isPinned);
      return {
         status: 'Success',
         message: `Post ${postId} successfully pinned`,
      };
   }

   /**
    * Updates the approval status of a given post based on a specific status enum value.
    * If comments are provided in the request, it implies that an admin or supervisor is
    * adding comments to the post, but the approval status is explicitly set by the 'status' parameter.
    *
    * This mechanism aids in making the approval process more transparent, where admins or
    * supervisors can provide reasons or feedback when they choose to approve or not approve a post.
    *
    * @param postId - The ID of the post whose approval status needs to be updated.
    * @param status - The new status of the post, as defined by PostStatusEnum.
    * @param comments - Optional comments added by an admin or supervisor explaining the reason for the approval status.
    * @returns An object indicating the success status and a success message.
    * @throws NotFoundException if the post with the given ID is not found.
    */
   async updatePostStatus(
      postId: number,
      status: PostStatusEnum,
      comments?: string | null,
   ) {
      const currentPost = await this.findOne(postId);
      await this.postsRepository.updatePostStatus(
         currentPost,
         status,
         comments || null,
      );
      return {
         status: 'Success',
         message: `Post ${postId} successfully updated`,
      };
   }

   /**
    * Deletes a post based on its ID and also removes its associated assets.
    *
    * This function retrieves the post by its ID and checks for its existence. If the post
    * exists and has associated assets, the assets are removed first. Then, the post itself
    * is deleted.
    * After successful deletion, a success message is returned in Spanish.
    *
    * @param postId - The ID of the post to be deleted.
    * @returns An object containing the status and a message indicating the post was deleted.
    * @throws {NotFoundException} If the post with the provided ID is not found.
    */
   async remove(postId: number): Promise<{ status: string; message: string }> {
      const post = await this.findOne(postId);
      if (!post) throw new NotFoundException(Errors.POST_NOT_FOUND);

      if (post.assets.length > 0) {
         await Promise.all(
            post.assets.map((asset) =>
               this.assetsService.deleteAsset(asset.id, asset.name),
            ),
         );
      }

      await this.postsRepository.remove(postId);
      return { status: 'Success', message: 'Publicación eliminada' };
   }

   /**
    * Deletes a specific asset based on its ID.
    *
    * The function retrieves the asset based on the provided ID, then deletes it. After
    * successful deletion, a success message is returned.
    *
    * @param id - ID of the asset to be deleted.
    * @returns An object containing the status and a message indicating the asset was deleted.
    * @throws NotFoundException If the asset with the provided ID is not found.
    */
   async removePostAsset(id: number): Promise<StatusResponse> {
      const existingAsset = await this.assetsService.findById(id);
      if (!existingAsset) {
         throw new NotFoundException('Asset not found');
      }
      await this.assetsService.deleteAsset(
         existingAsset.id,
         existingAsset.name,
      );
      return { status: 'Success', message: 'Asset deleted' };
   }

   /**
    * Overrides the pinned status of existing pinned posts based on post type.
    *
    * Only one post of each type (either InternalConvocatory or ExternalConvocatory)
    * can be pinned.
    * If a new post is being pinned, this function will unpin any existing post of the same
    * type, ensuring that no more than one post of each type is pinned at a time.
    *
    * @param pinnedPosts - An array of currently pinned posts.
    * @param currentPost - The post that is being considered for pinning.
    * @private
    */
   private async overridePinnedPosts(pinnedPosts: Post[], currentPost: Post) {
      await Promise.all(
         pinnedPosts.map(async (pinnedPost) => {
            // Cheking post id ensures that we are not inadvertently unpinning the post we are currently working with.
            // This safeguards against the unlikely scenario where the `currentPost` might already be pinned.
            if (
               pinnedPost.type === currentPost.type &&
               pinnedPost.id !== currentPost.id
            ) {
               await this.postsRepository.updatePin(pinnedPost, false);
            }
         }),
      );
   }
}
