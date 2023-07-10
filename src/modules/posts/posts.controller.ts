import {
   Controller,
   Get,
   Post,
   Body,
   Param,
   ParseIntPipe,
   Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostDto } from './dtos/posts.dto';
import { CreatePostDto, CreatePostResponseDto } from './dtos/create-post.dto';

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
      @Param('categoryId', ParseIntPipe) categoryId: number,
   ): Promise<PostDto[]> {
      console.log(categoryId);
      return this.postsService.findByCategoryId(categoryId);
   }

   @ApiOperation({ summary: 'Crear una nueva publicación' })
   @ApiResponse({
      status: 201,
      description: 'Publicación creada',
      type: CreatePostResponseDto,
   })
   @Post()
   async create(@Body() createPostDto: CreatePostDto) {
      const newPost = this.postsService.create(createPostDto);
      return newPost;
   }

   @Delete(':postId')
   async remove(@Param('postId', ParseIntPipe) postId: number) {
      this.postsService.remove(postId);
   }
}
