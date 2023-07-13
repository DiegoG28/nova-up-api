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
      const postsDto = this.postsService.mapToPostCardDto(posts);
      return postsDto;
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
      const latesPostsDto: PostBannerDto[] =
         this.postsService.mapToPostBannerDto(latestPosts);
      return latesPostsDto;
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
      const postsDto = this.postsService.mapToPostCardDto(posts);
      return postsDto;
   }

   @ApiOperation({ summary: 'Obtener una publicación' })
   @ApiParam({ name: 'postId', description: 'ID de la publicación' })
   @ApiResponse({ status: 200, description: 'Éxito', type: PostDto })
   @Get('/:postId')
   async findById(
      @Param('postId', ParseIntPipe) postId: number,
   ): Promise<PostDto> {
      const post = await this.postsService.findById(postId);
      const postDto = this.postsService.mapToPostDto(post);
      return postDto;
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
      type: UpdatePostDto,
   })
   @Put(':postId')
   async update(
      @Param('postId', ParseIntPipe) postId: number,
      @Body() post: UpdatePostDto,
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
