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
import { Post, PostTypeEnum } from './entities/posts.entity';
import { UpdateAssetPostDto, UpdatePostDto } from './dtos/update-post.dto';
import { CatalogsService } from '../catalogs/catalogs.service';
import { Asset } from './entities/assets.entity';

@Injectable()
export class PostsService {
   constructor(
      private readonly postsRepository: PostsRepository,
      private readonly postsMapperService: PostsMapperService,
      private readonly catalogsService: CatalogsService,
   ) {}

   async findAll(
      userRole: string,
      showApproved?: boolean,
   ): Promise<PostCardDto[]> {
      if (!showApproved && userRole === 'Editor') {
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

   async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
      const createdPost = await this.postsRepository.create(
         createPostDto,
         userId,
      );
      return createdPost;
   }

   async update(newPost: UpdatePostDto): Promise<Post> {
      const currentPost = await this.findOne(newPost.id);

      await this.catalogsService.findCategoryById(newPost.category.id);

      const pinnedPosts = await this.postsRepository.findPinned();

      //Override isPinned from existing convocatories posts
      if (pinnedPosts.length > 0) {
         await this.overridePinnedPosts(
            pinnedPosts,
            newPost.type,
            currentPost.id,
         );
      }

      //Avoid no convocatory post pinning
      this.adjustPinningStatus(newPost);

      const { assetsToDelete, assetsToCreate } = this.getAssetModifications(
         currentPost.assets,
         newPost.assets,
      );

      const updatedPost = await this.postsRepository.update(
         currentPost,
         newPost,
         assetsToDelete,
         assetsToCreate,
      );
      return updatedPost;
   }

   async remove(post: Post) {
      await this.postsRepository.remove(post);
   }

   private async overridePinnedPosts(
      pinnedPosts: Post[],
      postRequestType: Post['type'],
      currentPostId: number,
   ) {
      await Promise.all(
         pinnedPosts.map(async (pinnedPost) => {
            if (
               pinnedPost.type === postRequestType &&
               pinnedPost.id !== currentPostId
            ) {
               await this.postsRepository.updatePin(pinnedPost, false);
            }
         }),
      );
   }

   private getAssetModifications(
      existingAssets: Asset[],
      updatedAssets: UpdateAssetPostDto[],
   ) {
      const assetsToDelete = existingAssets.filter(
         (asset) =>
            !asset.isCoverImage &&
            !updatedAssets.some((updatedAsset) => updatedAsset.id === asset.id),
      );

      const assetsToCreate = updatedAssets.filter(
         (updatedAsset) => !updatedAsset.id,
      );

      return { assetsToDelete, assetsToCreate };
   }

   private adjustPinningStatus(post: UpdatePostDto) {
      if (
         post.type !== PostTypeEnum.ExternalConvocatory &&
         post.type !== PostTypeEnum.InternalConvocatory
      ) {
         post.isPinned = false;
      }
   }
}
