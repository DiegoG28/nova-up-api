import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/posts.entity';
import { PostDto } from './dtos/posts.dto';

@Injectable()
export class PostsService {
   constructor(
      @InjectRepository(Post)
      private readonly postsRepository: Repository<Post>,
   ) {}

   private mapPostsToDto(posts: Post[]): PostDto[] {
      return posts.map((post) => {
         const { category, career, ...rest } = post;
         return {
            ...rest,
            categoryName: category.name,
            careerName: career.name,
         };
      });
   }

   async findAll(): Promise<PostDto[]> {
      const posts: Post[] = await this.postsRepository.find({
         relations: ['category', 'career', 'assets'],
      });

      return this.mapPostsToDto(posts);
   }

   async findByCategoryId(categoryId: number): Promise<PostDto[]> {
      const posts: Post[] = await this.postsRepository.find({
         where: { category: { id: categoryId } },
         relations: ['category', 'career', 'assets'],
      });

      return this.mapPostsToDto(posts);
   }
}
