import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './entities/posts.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Publicaciones')
@Controller('posts')
export class PostsController {
   constructor(private readonly postsService: PostsService) {}

   @ApiOperation({ summary: 'Obtener todas las publicaciones' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [Post] })
   @Get()
   findAll(): Promise<Post[]> {
      return this.postsService.findAll();
   }
}
