import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostDto } from './dtos/posts.dto';

@ApiTags('Publicaciones')
@Controller('posts')
export class PostsController {
   constructor(private readonly postsService: PostsService) {}

   @ApiOperation({ summary: 'Obtener todas las publicaciones' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostDto] })
   @Get()
   findAll(): Promise<PostDto[]> {
      return this.postsService.findAll();
   }
}
