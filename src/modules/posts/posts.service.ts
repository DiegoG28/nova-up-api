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

   async findAll(): Promise<PostDto[]> {
      const posts: Post[] = await this.postsRepository.find({
         relations: ['category', 'career', 'assets'],
      });

      const mappedPosts: PostDto[] = posts.map((post) => {
         const { category, career, ...rest } = post;
         return {
            ...rest,
            categoryName: category.name,
            careerName: career.name,
         };
      });

      return mappedPosts;
   }
}
