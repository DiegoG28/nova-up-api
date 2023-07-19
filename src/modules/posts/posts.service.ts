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
import { UpdatePostDto } from './dtos/update-post.dto';

@Injectable()
export class PostsService {
   constructor(
      private readonly postsRepository: PostsRepository,
      private readonly postsMapperService: PostsMapperService,
   ) {}

   async findAll(
      userRole: string,
      isApproved?: boolean,
   ): Promise<PostCardDto[]> {
      if (!isApproved && userRole !== 'Admin') {
         throw new ForbiddenException(
            'You do not have permissons to access this resource.',
         );
      }

      const posts = await this.postsRepository.findAll(isApproved);
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);
      return postsCardDto;
   }

   async findLatest(limit = 5): Promise<PostBannerDto[]> {
      const posts = await this.postsRepository.findLatest(limit);
      const postsBannerDto = this.postsMapperService.mapToPostBannerDto(posts);
      return postsBannerDto;
   }

   async findPinned(): Promise<PostCardDto[]> {
      const posts = await this.postsRepository.findPinnedConvocatories(true);
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);
      return postsCardDto;
   }

   async findByCategoryId(
      categoryId: number,
      isApproved?: boolean,
   ): Promise<PostCardDto[]> {
      if (!isApproved) {
         //We should validate token here because not all users can see all posts or not approved posts
      }

      const posts = await this.postsRepository.findByCategoryId(
         categoryId,
         isApproved,
      );
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

   async create(createPostDto: CreatePostDto): Promise<Post> {
      const createdPost = await this.postsRepository.create(createPostDto);
      return createdPost;
   }

   async update(updatePostRequest: UpdatePostDto): Promise<Post> {
      const postToUpdate = await this.findOne(updatePostRequest.id);

      if (!postToUpdate) throw new NotFoundException('Post not found');

      const postRequestType = updatePostRequest.type;

      const pinnedPosts = await this.postsRepository.findPinnedConvocatories();
      //Override isPinned from existing convocatories posts
      if (pinnedPosts.length > 0) {
         pinnedPosts.forEach(async (pinnedPost) => {
            if (
               pinnedPost.type === postRequestType &&
               pinnedPost.id !== updatePostRequest.id
            ) {
               await this.postsRepository.updatePin(pinnedPost, false);
            }
         });
      }

      //Avoid no convocatory post pinning
      if (
         updatePostRequest.type !== PostTypeEnum.ExternalConvocatory &&
         updatePostRequest.type !== PostTypeEnum.InternalConvocatory
      ) {
         updatePostRequest.isPinned = false;
      }
      const updatedPost = await this.postsRepository.update(
         postToUpdate,
         updatePostRequest,
      );
      return updatedPost;
   }

   async remove(post: Post): Promise<void> {
      await this.postsRepository.remove(post);
   }
}
