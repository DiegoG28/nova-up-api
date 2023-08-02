import {
   Controller,
   Get,
   Post,
   Body,
   Param,
   ParseIntPipe,
   Delete,
   NotFoundException,
   Query,
   Request,
   Patch,
   UploadedFiles,
   UseInterceptors,
   UsePipes,
   UploadedFile,
   BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
   ApiBearerAuth,
   ApiBody,
   ApiConsumes,
   ApiOperation,
   ApiParam,
   ApiQuery,
   ApiResponse,
   ApiTags,
} from '@nestjs/swagger';
import { PostDto } from './dtos/posts.dto';
import { PostCardDto } from './dtos/posts-cards.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { PostBannerDto } from './dtos/posts-banner.dto';
import { RequestWithPayload } from 'src/libs/interfaces';
import { Public, Roles } from '../auth/auth.decorators';
import { UpdatePostDto } from './dtos/update-post.dto';
import { StatusResponse } from 'src/libs/status-response.dto';
import {
   AnyFilesInterceptor,
   FileFieldsInterceptor,
   FileInterceptor,
   FilesInterceptor,
} from '@nestjs/platform-express';
import { ParseCategoryPipe } from 'src/pipes/category-parse.pipe';
import { Errors } from 'src/libs/errors';
import { CreateAssetDto } from '../assets/dtos/create-asset.dto';
// import { Roles } from '../auth/auth.decorators';

@ApiTags('Publicaciones')
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
   assetsService: any;
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
      //We need validate possible undefined because the route is public
      const userRole = req.userPayload?.user?.role?.name || '';
      const showApproved =
         approved !== undefined ? approved === 'true' : undefined;
      const posts = await this.postsService.findAll(userRole, showApproved);
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
   @Get('latest')
   async findLatest(@Query('limit') limit: string): Promise<PostBannerDto[]> {
      const latestPosts = await this.postsService.findLatest(parseInt(limit));
      return latestPosts;
   }

   @ApiOperation({ summary: 'Obtener las publicaciones fijadas' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Public()
   @Get('pinned')
   async findPinned(): Promise<PostCardDto[]> {
      const pinnedPosts = await this.postsService.findPinned();
      return pinnedPosts;
   }

   @ApiOperation({ summary: 'Obtener las publicaciones por usuario' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Get('user')
   async findByUser(
      @Request() req: RequestWithPayload,
   ): Promise<PostCardDto[]> {
      const userId = req.userPayload.sub;
      const posts = await this.postsService.findByUser(userId);
      return posts;
   }

   @ApiOperation({ summary: 'Obtener las publicaciones por categoría' })
   @ApiParam({ name: 'id', description: 'ID de la categoría' })
   @ApiQuery({
      name: 'approved',
      description:
         'Determina si se desea obtener las publicaciones aprobadas o no aprobadas',
      type: Boolean,
      required: false,
   })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Public()
   @Get('category/:id')
   async findByCategoryId(
      @Param('id', ParseIntPipe) categoryId: number,
   ): Promise<PostCardDto[]> {
      const posts = await this.postsService.findByCategory(categoryId);
      return posts;
   }

   @ApiOperation({ summary: 'Obtener una publicación' })
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @ApiResponse({ status: 200, description: 'Éxito', type: PostDto })
   @Public()
   @Get(':id')
   async findById(@Param('id', ParseIntPipe) postId: number): Promise<PostDto> {
      return await this.postsService.findById(postId);
   }

   @ApiOperation({ summary: 'Crear una nueva publicación' })
   @ApiConsumes('multipart/form-data')
   @ApiBody({
      type: CreatePostDto,
   })
   @ApiResponse({
      status: 201,
      description: 'Publicación creada',
      type: StatusResponse,
   })
   @Post()
   @UseInterceptors(AnyFilesInterceptor())
   @UsePipes(new ParseCategoryPipe())
   async create(
      @Request() req: RequestWithPayload,
      @Body() createPostDto: CreatePostDto,
      @UploadedFiles() files?: Express.Multer.File[],
   ) {
      // Note: 'files' and 'coverImageFile' parameter are populated by Multer, not from createPostDto
      const coverImageFile = files?.find(
         (file) => file.fieldname === 'coverImageFile',
      );
      const otherFiles = files?.filter(
         (file) => file.fieldname !== 'coverImageFile',
      );

      const userId = req.userPayload?.sub;
      const response = this.postsService.create(
         createPostDto,
         userId,
         otherFiles,
         coverImageFile,
      );
      return response;
   }

   @ApiOperation({ summary: 'Crear nuevos assets' })
   @ApiConsumes('multipart/form-data')
   @ApiBody({
      type: CreateAssetDto,
   })
   @ApiResponse({
      status: 201,
      description: 'Assets creados',
      type: StatusResponse,
   })
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @Post(':id/assets')
   @UseInterceptors(AnyFilesInterceptor())
   async createAssets(
      @Body() createAssetDto: CreateAssetDto,
      @Param('id', ParseIntPipe) postId: number,
      @UploadedFiles() files?: Express.Multer.File[],
   ) {
      // Note: 'files' and 'coverImageFile' parameter are populated by Multer, not from createPostDto
      const { links } = createAssetDto;

      await this.postsService.findById(postId);

      const coverImageFile = files?.find(
         (file) => file.fieldname === 'coverImageFile',
      );
      const otherFiles = files?.filter(
         (file) => file.fieldname !== 'coverImageFile',
      );

      await this.postsService.createPostAssets(
         postId,
         links,
         otherFiles,
         coverImageFile,
      );

      return { status: 'Success', message: 'Assets succesfully created' };
   }

   /*@ApiOperation({ summary: 'Actualizar una publicación' })
   @ApiResponse({
      status: 200,
      description: 'Publicación actualizada',
      type: UpdatePostResponse,
   })
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @Public()
   @Patch(':id')
   async update(
      @Param('id', ParseIntPipe) postId: number,
      @Body() updatePostRequest: Partial<UpdatePostDto>,
   ) {
      return this.postsService.update(updatePostRequest, postId);
   }*/

   @ApiOperation({ summary: 'Actualizar el status fijado de una publicación' })
   @ApiResponse({
      status: 200,
      description: 'Publicación actualizada',
      type: StatusResponse,
   })
   @Roles('Admin', 'Supervisor')
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @Patch('pin/:id')
   async updatePinStatus(@Param('id', ParseIntPipe) postId: number) {
      const response = await this.postsService.updatePinStatus(postId);
      return response;
   }

   @ApiOperation({
      summary: 'Actualizar el status aprobado de una publicación',
   })
   @ApiResponse({
      status: 200,
      description: 'Publicación actualizada',
      type: StatusResponse,
   })
   @Roles('Admin', 'Supervisor')
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @Patch('approve/:id')
   async updateApprovedStatus(@Param('id', ParseIntPipe) postId: number) {
      const response = await this.postsService.updateApprovedStatus(postId);
      return response;
   }

   @ApiOperation({ summary: 'Elimina una publicación' })
   @ApiResponse({
      status: 200,
      description: 'Publicación eliminada',
      type: StatusResponse,
   })
   @Roles('Admin', 'Supervisor')
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @Delete(':id')
   async remove(@Param('id', ParseIntPipe) postId: number) {
      const post = await this.postsService.findOne(postId);
      if (!post) throw new NotFoundException(Errors.POST_NOT_FOUND);
      return await this.postsService.remove(post);
   }
}
