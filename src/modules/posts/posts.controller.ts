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
   Request,
   //UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
   ApiBearerAuth,
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
import { RequestWithPayload } from 'src/libs/interfaces';
import { Public } from '../auth/auth.decorators';
// import { Roles } from '../auth/auth.decorators';
// import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Publicaciones')
@ApiBearerAuth()
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
   @Public()
   @Get()
   async findAll(
      @Request() req: RequestWithPayload,
      @Query('approved') approved?: string,
   ): Promise<PostCardDto[]> {
      const userRole = req.userPayload?.user?.role?.name || '';
      const isApproved =
         approved !== undefined ? approved === 'true' : undefined;
      const posts = await this.postsService.findAll(userRole, isApproved);
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
   @Public()
   @Get('/latest')
   async findLatest(@Query('limit') limit: string): Promise<PostBannerDto[]> {
      const latestPosts = await this.postsService.findLatest(parseInt(limit));
      return latestPosts;
   }

   @ApiOperation({ summary: 'Obtener las publicaciones fijadas' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Public()
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
   @Public()
   @Get('category/:categoryId')
   async findByCategoryId(
      @Param('categoryId', ParseIntPipe) categoryId: number,
      @Query('approved') approved?: string,
   ): Promise<PostCardDto[]> {
      const isApproved = approved === 'true';

      const posts = await this.postsService.findByCategoryId(
         categoryId,
         isApproved,
      );
      return posts;
   }

   @ApiOperation({ summary: 'Obtener una publicación' })
   @ApiParam({ name: 'postId', description: 'ID de la publicación' })
   @ApiResponse({ status: 200, description: 'Éxito', type: PostDto })
   @Public()
   @Get('/:postId')
   async findById(
      @Param('postId', ParseIntPipe) postId: number,
   ): Promise<PostDto> {
      try {
         return await this.postsService.findById(postId);
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
         return this.postsService.update(updatePostRequest);
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
