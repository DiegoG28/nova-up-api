import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { PostCardDto } from './dtos/posts-cards.dto';
import { PostsMapperService } from './posts-mapper.service';
import { PostBannerDto } from './dtos/posts-banner.dto';
import { PostDto } from './dtos/posts.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { Post } from './entities/posts.entity';
import { UpdatePostDto } from './dtos/update-post.dto';

@Injectable()
export class PostsService {
   constructor(
      private readonly postsRepository: PostsRepository,
      private readonly postsMapperService: PostsMapperService,
   ) {}

   async findAll(isApproved?: string): Promise<PostCardDto[]> {
      if (typeof isApproved === 'undefined' || isApproved === 'false') {
         //We should validate token here because not all users can see all posts or not approved posts
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

   async findByCategoryId(
      categoryId: number,
      isApproved?: string,
   ): Promise<PostCardDto[]> {
      if (typeof isApproved === 'undefined' || isApproved === 'false') {
         //We should validate token here because not all users can see all posts or not approved posts
      }

      const posts = await this.postsRepository.findByCategoryId(
         categoryId,
         isApproved,
      );
      const postsCardDto = this.postsMapperService.mapToPostCardDto(posts);

      return postsCardDto;
   }

   async findById(postId: number): Promise<PostDto | null> {
      const post = await this.postsRepository.findById(postId);
      if (!post) return;
      const postDto = this.postsMapperService.mapToPostDto(post);
      return postDto;
   }

   //We use this to get a Post entity instead the PostDto
   async findOne(postId: number): Promise<Post | null> {
      return this.postsRepository.findById(postId);
   }

   async create(createPostDto: CreatePostDto): Promise<Post> {
      const createdPost = await this.postsRepository.create(createPostDto);
      return createdPost;
   }

   async update(post: Post, updatedPostData: UpdatePostDto): Promise<Post> {
      const updatedPost = await this.postsRepository.update(
         post,
         updatedPostData,
      );
      return updatedPost;
   }

   async remove(post: Post): Promise<void> {
      await this.postsRepository.remove(post);
   }
}
