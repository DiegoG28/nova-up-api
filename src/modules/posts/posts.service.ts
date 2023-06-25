import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/posts.entity';

@Injectable()
export class PostsService {
   constructor(
      @InjectRepository(Post)
      private readonly postsRepository: Repository<Post>,
   ) {}
}
