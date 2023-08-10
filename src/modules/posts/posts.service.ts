import {
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostCardDto } from './dtos/posts-cards.dto';
import { PostsMapperService } from './posts-mapper.service';
import { PostBannerDto } from './dtos/posts-banner.dto';
import { PostDto } from './dtos/posts.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { Post, PostTypeEnum } from './posts.entity';
import { CatalogsService } from '../catalogs/catalogs.service';
import { AssetsService } from '../assets/assets.service';
import { UpdatePostDto } from './dtos/update-post.dto';
import { DataSource, DeepPartial, QueryRunner } from 'typeorm';
import { Errors } from 'src/libs/errors';
import { StatusResponse } from 'src/libs/status-response.dto';

@Injectable()
export class PostsService {
   constructor(
      private readonly postsRepository: PostsRepository,
      private readonly postsMapperService: PostsMapperService,
      private readonly catalogsService: CatalogsService,
      private readonly assetsService: AssetsService,
      private readonly dataSource: DataSource,
   ) {}

   async findAll(
      userRole: string,
      showApproved?: boolean,
   ): Promise<PostCardDto[]> {
      if (!showApproved && (!userRole || userRole === 'Editor')) {
         throw new ForbiddenException(Errors.ACCESS_DENIED_TO_RESOURCE);
      }

      const posts = await this.postsRepository.findAll(showApproved);
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);
      return postsCardDto;
   }

   async findLatest(limit = 5): Promise<PostBannerDto[]> {
      const posts = await this.postsRepository.findLatest(limit);
      const postsBannerDto = this.postsMapperService.mapToPostBannerDto(posts);
      return postsBannerDto;
   }

   async findPinned(): Promise<PostCardDto[]> {
      const posts = await this.postsRepository.findPinned();
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);
      return postsCardDto;
   }

   async findByUser(userId: number): Promise<PostCardDto[]> {
      const posts = await this.postsRepository.findByUser(userId);
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);

      return postsCardDto;
   }

   async findByCategory(categoryId: number): Promise<PostCardDto[]> {
      const posts = await this.postsRepository.findByCategory(categoryId);
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);

      return postsCardDto;
   }

   async findById(postId: number): Promise<PostDto> {
      const post = await this.postsRepository.findById(postId);
      if (!post) throw new NotFoundException(Errors.POST_NOT_FOUND);
      const postDto = this.postsMapperService.mapToPostDto(post);
      return postDto;
   }

   //We use this to get a Post entity instead the PostDto
   async findOne(postId: number): Promise<Post> {
      const post = await this.postsRepository.findById(postId);
      if (!post) throw new NotFoundException(Errors.POST_NOT_FOUND);
      return post;
   }

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

   async updateApprovedStatus(postId: number, comments?: string) {
      const currentPost = await this.findOne(postId);
      await this.postsRepository.updateApproved(
         currentPost,
         !currentPost.isApproved,
         comments || '',
      );
      return {
         status: 'Success',
         message: `Post ${postId} successfully approved`,
      };
   }

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

   async remove(post: Post): Promise<{ status: string; message: string }> {
      if (post.assets.length > 0) {
         await Promise.all(
            post.assets.map((asset) =>
               this.assetsService.deleteAsset(asset.id, asset.name),
            ),
         );
      }

      await this.postsRepository.remove(post);
      return { status: 'Success', message: 'Publicación eliminada' };
   }

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

   private async overridePinnedPosts(pinnedPosts: Post[], currentPost: Post) {
      await Promise.all(
         pinnedPosts.map(async (pinnedPost) => {
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
