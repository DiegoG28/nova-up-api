import {
   Controller,
   Get,
   Post,
   Body,
   Param,
   ParseIntPipe,
   Delete,
   NotFoundException,
   Put,
   Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
   ApiOperation,
   ApiParam,
   ApiQuery,
   ApiResponse,
   ApiTags,
} from '@nestjs/swagger';
import { PostDto } from './dtos/posts.dto';
import { PostCardDto } from './dtos/posts-cards.dto';
import { CreatePostDto, CreatePostResponseDto } from './dtos/create-post.dto';
import { Post as PostEntity } from './entities/posts.entity';

@ApiTags('Publicaciones')
@Controller('posts')
export class PostsController {
   constructor(private readonly postsService: PostsService) {}

   @ApiOperation({ summary: 'Obtener todas las publicaciones' })
   @ApiQuery({
      name: 'approved',
      description:
         'Determina si se desea obtener las publicaciones aprobadas o no aprobadas',
      type: Boolean,
      required: false,
   })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Get()
   findAll(@Query('approved') approved?: string): Promise<PostEntity[]> {
      return this.postsService.findAll(approved);
   }

   @ApiOperation({ summary: 'Obtener las últimas publicaciones' })
   @ApiQuery({
      name: 'limit',
      description: 'Cantidad de publicaciones a obtener',
      type: Number,
      required: false,
      schema: { default: 5 },
   })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Get('/latest')
   findLatest(@Query('limit') limit: string): Promise<PostEntity[]> {
      return this.postsService.findLatest(parseInt(limit));
   }

   @ApiOperation({ summary: 'Obtener una publicación' })
   @ApiParam({ name: 'postId', description: 'ID de la publicación' })
   @ApiResponse({ status: 200, description: 'Éxito', type: PostDto })
   @Get('/:postId')
   findById(
      @Param('postId', ParseIntPipe) postId: number,
   ): Promise<PostEntity> {
      return this.postsService.findById(postId);
   }

   @ApiOperation({ summary: 'Obtener las publicaciones por categoría' })
   @ApiParam({ name: 'categoryId', description: 'ID de la categoría' })
   @ApiQuery({
      name: 'approved',
      description:
         'Determina si se desea obtener las publicaciones aprobadas o no aprobadas',
      type: Boolean,
      required: false,
   })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Get('category/:categoryId')
   findByCategoryId(
      @Param('categoryId', ParseIntPipe) categoryId: number,
      @Query('approved') approved?: string,
   ): Promise<PostEntity[]> {
      return this.postsService.findByCategoryId(categoryId, approved);
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

   @ApiOperation({ summary: 'Actualizar una publicación' })
   @ApiParam({ name: 'postId', description: 'Id de la publicación' })
   @ApiResponse({
      status: 200,
      description: 'Publicación actualizada',
      type: PostDto,
   })
   @Put(':postId')
   async update(
      @Param('postId', ParseIntPipe) postId: number,
      @Body() post: PostDto,
   ) {
      return this.postsService.update(postId, post);
   }

   @ApiOperation({ summary: 'Elimina una publicación' })
   @ApiResponse({
      status: 404,
      description: 'Publicación no encontrada',
   })
   @ApiParam({ name: 'postId', description: 'ID de la publicación' })
   @Delete(':postId')
   async remove(@Param('postId', ParseIntPipe) postId: number) {
      try {
         await this.postsService.remove(postId);
      } catch (error) {
         if (error instanceof NotFoundException) {
            throw error;
         }
      }
   }
}
