import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { PostsService } from 'src/modules/posts/posts.service';

@Injectable()
export class VerifyPostIdPipe implements PipeTransform {
   constructor(private readonly postsService: PostsService) {}

   async transform(value: number) {
      const post = await this.postsService.findOne(value);
      if (!post) {
         throw new NotFoundException(`Post with ID ${value} not found`);
      }
      return value;
   }
}
