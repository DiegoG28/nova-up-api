import {
   Controller,
   Get,
   Post,
   Body,
   Param,
   ParseIntPipe,
   Delete,
   Query,
   Request,
   Patch,
   UploadedFiles,
   UseInterceptors,
   UsePipes,
} from '@nestjs/common';
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
import { PostsService } from './posts.service';
import { PostSummaryDto, PostCardDto, PostDto } from './dtos/posts.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { RequestWithPayload } from 'src/libs/interfaces';
import { Public, Roles } from '../auth/auth.decorators';
import { UpdatePostStatusDto, UpdatePostDto } from './dtos/update-post.dto';
import { StatusResponse } from 'src/libs/status-response.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ParseCategoryPipe } from 'src/pipes/category-parse.pipe';
import { CreateAssetDto } from '../assets/dtos/create-asset.dto';
import { PostStatusEnum } from './posts.entity';

@ApiTags('Publicaciones')
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
   constructor(private readonly postsService: PostsService) {}

   // ------------------- Basic CRUD operations -------------------

   @ApiOperation({ summary: 'Crear una nueva publicación' })
   @ApiConsumes('multipart/form-data')
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

   @ApiOperation({ summary: 'Obtener todas las publicaciones' })
   @ApiQuery({
      name: 'status',
      description:
         'Query param opcional para filtrar por status, en caso de no enviarlo se devuelven todas las publicaciones.',
      enum: PostStatusEnum,
      required: false,
   })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Public()
   @Get()
   async findAll(
      @Request() req: RequestWithPayload,
      @Query('status') status?: PostStatusEnum,
   ): Promise<PostCardDto[]> {
      //We need validate possible undefined because the route is public
      const userRole = req.userPayload?.user?.role?.name || '';
      const posts = await this.postsService.findAll(userRole, status);
      return posts;
   }

   @ApiOperation({ summary: 'Actualizar una publicación' })
   @ApiBody({
      type: UpdatePostDto,
   })
   @ApiResponse({
      status: 200,
      description: 'Publicación actualizada',
      type: StatusResponse,
   })
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @Patch(':id')
   async update(
      @Param('id', ParseIntPipe) postId: number,
      @Body() updatePostRequest: Partial<UpdatePostDto>,
   ) {
      return this.postsService.update(updatePostRequest, postId);
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
      return await this.postsService.remove(postId);
   }

   // ------------------- Specialized routes -------------------

   @ApiOperation({ summary: 'Obtener las últimas publicaciones' })
   @ApiQuery({
      name: 'limit',
      description: 'Cantidad de publicaciones a obtener',
      type: Number,
      required: false,
      schema: { default: 5 },
   })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostSummaryDto] })
   @Public()
   @Get('latest')
   async findLatest(@Query('limit') limit: string): Promise<PostSummaryDto[]> {
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

   @ApiOperation({ summary: 'Obtener las publicaciones del usuario logueado' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Get('user')
   async findByUser(
      @Request() req: RequestWithPayload,
   ): Promise<PostCardDto[]> {
      const userId = req.userPayload.sub;
      const posts = await this.postsService.findByUser(userId);
      return posts;
   }

   // ------------------- Single Identification Routes -------------------
   // Place these after specialized routes to avoid route conflict

   @ApiOperation({ summary: 'Obtener una publicación' })
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @ApiResponse({ status: 200, description: 'Éxito', type: PostDto })
   @Public()
   @Get(':id')
   async findById(@Param('id', ParseIntPipe) postId: number): Promise<PostDto> {
      return await this.postsService.findById(postId);
   }

   @ApiOperation({ summary: 'Crear nuevos assets' })
   @ApiConsumes('multipart/form-data')
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

      const createdAssets = await this.postsService.createPostAssets(
         postId,
         links,
         otherFiles,
         coverImageFile,
      );

      return {
         status: 'Success',
         message: 'Assets succesfully created',
         data: createdAssets,
      };
   }

   @ApiOperation({ summary: 'Actualizar el status fijado de una publicación' })
   @ApiResponse({
      status: 200,
      description: 'Publicación actualizada',
      type: StatusResponse,
   })
   @Roles('Admin', 'Supervisor')
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @Patch(':id/pin')
   async updatePinStatus(@Param('id', ParseIntPipe) postId: number) {
      const response = await this.postsService.updatePinStatus(postId);
      return response;
   }

   @ApiOperation({ summary: 'Actualizar el status de una publicación' })
   @ApiBody({
      type: UpdatePostStatusDto,
   })
   @ApiResponse({
      status: 200,
      description: 'Publicación actualizada',
      type: StatusResponse,
   })
   @Roles('Admin', 'Supervisor')
   @ApiParam({ name: 'id', description: 'ID de la publicación' })
   @Patch(':id/status')
   async updatePostStatus(
      @Param('id', ParseIntPipe) postId: number,
      @Body() request: UpdatePostStatusDto,
   ) {
      const { comments, status } = request;
      const response = await this.postsService.updatePostStatus(
         postId,
         status,
         comments,
      );
      return response;
   }

   // ------------------- Other related routes -------------------

   @ApiOperation({ summary: 'Obtener las publicaciones por categoría' })
   @ApiParam({ name: 'id', description: 'ID de la categoría' })
   @ApiResponse({ status: 200, description: 'Éxito', type: [PostCardDto] })
   @Public()
   @Get('category/:id')
   async findByCategoryId(
      @Param('id', ParseIntPipe) categoryId: number,
   ): Promise<PostCardDto[]> {
      const posts = await this.postsService.findByCategory(categoryId);
      return posts;
   }

   @ApiOperation({ summary: 'Elimina un asset' })
   @ApiResponse({
      status: 200,
      description: 'Asset eliminado',
      type: StatusResponse,
   })
   @ApiParam({
      name: 'id',
      description: 'ID del asset',
   })
   @Delete('/assets/:id')
   async deleteAsset(@Param('id') id: number) {
      return await this.postsService.removePostAsset(id);
   }
}
