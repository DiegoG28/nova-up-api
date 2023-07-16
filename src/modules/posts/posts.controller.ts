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
import { PostBannerDto } from './dtos/posts-banner.dto';
import { UpdatePostDto } from './dtos/update-post.dto';

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
   async findAll(@Query('approved') approved?: string): Promise<PostCardDto[]> {
      const posts = await this.postsService.findAll(approved);
      return posts;
   }

   @ApiOperation({ summary: 'Obtener las últimas publicaciones' })
   @ApiQuery({
      name: 'limit',
      description: 'Cantidad de publicaciones a obtener',
      type: Number,
      required: false,
      schema: { default: 5 },
   })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostBannerDto] })
   @Get('/latest')
   async findLatest(@Query('limit') limit: string): Promise<PostBannerDto[]> {
      const latestPosts = await this.postsService.findLatest(parseInt(limit));
      return latestPosts;
   }

   @ApiOperation({ summary: 'Obtener las publicaciones fijadas' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Get('/pinned')
   async findPinned(): Promise<PostCardDto[]> {
      const pinnedPosts = await this.postsService.findPinned();
      return pinnedPosts;
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
   async findByCategoryId(
      @Param('categoryId', ParseIntPipe) categoryId: number,
      @Query('approved') approved?: string,
   ): Promise<PostCardDto[]> {
      const posts = await this.postsService.findByCategoryId(
         categoryId,
         approved,
      );
      return posts;
   }

   @ApiOperation({ summary: 'Obtener una publicación' })
   @ApiParam({ name: 'postId', description: 'ID de la publicación' })
   @ApiResponse({ status: 200, description: 'Éxito', type: PostDto })
   @Get('/:postId')
   async findById(
      @Param('postId', ParseIntPipe) postId: number,
   ): Promise<PostDto> {
      try {
         const post = await this.postsService.findById(postId);
         if (!post) throw new NotFoundException('Post not found');
         return post;
      } catch (err) {
         throw err;
      }
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
   @ApiResponse({
      status: 200,
      description: 'Publicación actualizada',
      type: UpdatePostDto,
   })
   @Put()
   async update(@Body() updatePostRequest: UpdatePostDto) {
      try {
         const postToUpdate = await this.postsService.findOne(
            updatePostRequest.id,
         );
         if (!postToUpdate) throw new NotFoundException('Post not found');
         return this.postsService.update(postToUpdate, updatePostRequest);
      } catch (err) {
         throw err;
      }
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
         const post = await this.postsService.findOne(postId);
         if (!post) throw new NotFoundException('Post not found');
         await this.postsService.remove(post);
      } catch (error) {
         throw error;
      }
   }
}
