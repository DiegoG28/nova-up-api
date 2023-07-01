import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostDto } from './dtos/posts.dto';
import { CreatePostDto } from './dtos/create-post.dto';

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

   @ApiOperation({ summary: 'Obtener las publicaciones por categoría' })
   @ApiParam({ name: 'categoryId', description: 'ID de la categoría' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostDto] })
   @Get('category/:categoryId')
   findByCategoryId(
      @Param('categoryId') categoryId: string,
   ): Promise<PostDto[]> {
      console.log(categoryId);
      return this.postsService.findByCategoryId(parseInt(categoryId, 10));
   }

   @Post()
   async create(@Body() createPostDto: CreatePostDto) {
      const newPost = this.postsService.create(createPostDto);
      return newPost;
   }
}
