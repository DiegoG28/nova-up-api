import {
   ForbiddenException,
   Injectable,
   InternalServerErrorException,
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
import { DataSource, DeepPartial } from 'typeorm';

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
         throw new ForbiddenException(
            'You do not have permissons to access this resource.',
         );
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
      const posts = await this.postsRepository.findPinned(true);
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
      if (!post) throw new NotFoundException('Post not found');
      const postDto = this.postsMapperService.mapToPostDto(post);
      return postDto;
   }

   //We use this to get a Post entity instead the PostDto
   async findOne(postId: number): Promise<Post> {
      const post = await this.postsRepository.findById(postId);
      if (!post) throw new NotFoundException('Post not found');
      return post;
   }

   async updatePinStatus(postId: number) {
      const currentPost = await this.findOne(postId);
      if (
         currentPost.type !== PostTypeEnum.InternalConvocatory &&
         currentPost.type !== PostTypeEnum.ExternalConvocatory
      )
         throw new ForbiddenException('You cannot pin no convocatory post');

      const pinnedPosts = await this.postsRepository.findPinned();

      //Override isPinned from existing convocatories posts
      const isPinning = !currentPost.isPinned;
      if (pinnedPosts.length > 0 && isPinning) {
         await this.overridePinnedPosts(pinnedPosts, currentPost);
      }
      await this.postsRepository.updatePin(currentPost, !currentPost.isPinned);
   }

   async updateApprovedStatus(postId: number) {
      const currentPost = await this.findOne(postId);
      await this.postsRepository.updateApproved(
         currentPost,
         !currentPost.isApproved,
      );
   }

   async create(
      newPostData: CreatePostDto,
      userId: number,
      files?: Express.Multer.File[],
      coverImageFile?: Express.Multer.File,
   ): Promise<{ status: string; message: string }> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

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

         if (links) {
            const arrayLinks = links.split(',');
            await this.assetsService.createAssets(
               createdPostId,
               arrayLinks,
               queryRunner,
            );
         }

         if (files) {
            await this.assetsService.createAssets(
               createdPostId,
               files,
               queryRunner,
            );
         }

         if (coverImageFile) {
            await this.assetsService.createAsset(
               createdPostId,
               coverImageFile,
               queryRunner,
               true,
            );
         }

         console.log(newPostData);

         await queryRunner.commitTransaction();

         return { status: 'Success', message: 'Post successfully created' };
      } catch (err) {
         await queryRunner.rollbackTransaction();
         throw new InternalServerErrorException(
            'Failed to create post',
            err.message,
         );
      } finally {
         await queryRunner.release();
      }
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
      let assetsId: undefined | number[] = undefined;
      if (post.assets.length > 0) {
         assetsId = post.assets.map((asset) => asset.id);
      }
      await this.postsRepository.remove(post, assetsId);
      return { status: 'Success', message: 'Publicación eliminada' };
   }

   private async overridePinnedPosts(pinnedPosts: Post[], currentPost: Post) {
      await Promise.all(
         pinnedPosts.map(async (pinnedPost) => {
            if (
               pinnedPost.type === currentPost.type &&
               pinnedPost.id !== currentPost.id
            ) {
               await this.postsRepository.updatePin(
                  pinnedPost,
                  !pinnedPost.isPinned,
               );
            }
         }),
      );
   }
}
