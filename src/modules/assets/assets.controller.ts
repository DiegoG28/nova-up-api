import {
   Body,
   Controller,
   Post,
   UploadedFiles,
   UseInterceptors,
   UsePipes,
   Request,
   ParseIntPipe,
   Param,
} from '@nestjs/common';
import {
   ApiTags,
   ApiBearerAuth,
   ApiOperation,
   ApiBody,
   ApiConsumes,
   ApiParam,
   ApiQuery,
   ApiResponse,
} from '@nestjs/swagger';

import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dtos/create-asset.dto';
import { AssetDto } from './dtos/assets.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { RequestWithPayload } from 'src/libs/interfaces';
import { ParseCategoryPipe } from 'src/pipes/category-parse.pipe';
import { CreatePostDto } from '../posts/dtos/create-post.dto';
import { StatusResponse } from 'src/libs/status-response.dto';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
   constructor(private readonly assetsService: AssetsService) {}

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
   @Post(':id')
   @UseInterceptors(AnyFilesInterceptor())
   @UsePipes(new ParseCategoryPipe())
   async create(
      @Body() createAssetDto: CreateAssetDto,
      @Param('id', ParseIntPipe) postId: number,
      @UploadedFiles() files?: Express.Multer.File[],
   ) {
      // Note: 'files' and 'coverImageFile' parameter are populated by Multer, not from createPostDto
      const { links } = createAssetDto;

      const coverImageFile = files?.find(
         (file) => file.fieldname === 'coverImageFile',
      );
      const otherFiles = files?.filter(
         (file) => file.fieldname !== 'coverImageFile',
      );

      if (links) {
         const arrayLinks = links.split(',');
         await this.assetsService.createAssets(postId, arrayLinks);
      }

      if (otherFiles) {
         await this.assetsService.createAssets(postId, otherFiles);
      }

      if (coverImageFile) {
         await this.assetsService.createAsset(
            postId,
            coverImageFile,
            undefined,
            true,
         );
      }

      return { status: 'Success', message: 'Assets succesfully created' };
   }
}
