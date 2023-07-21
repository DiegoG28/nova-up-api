import {
   IsArray,
   IsBoolean,
   IsInt,
   IsPositive,
   ValidateNested,
} from 'class-validator';
import { PostDto } from './posts.dto';
import { Type } from 'class-transformer';
import { BasePostDto } from './base-post.dto';
import { AssetTypeEnum } from '../../assets/assets.entity';
import { BaseAssetDto } from 'src/modules/assets/base-asset.dto';

export class CreatePostDto extends BasePostDto {
   @IsInt()
   @IsPositive()
   categoryId: number;

   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => CreatePostAssetDto)
   assets: CreatePostAssetDto[];
}

export class CreatePostAssetDto extends BaseAssetDto {
   @IsBoolean()
   isCoverImage: boolean;
}

export class CreatePostResponseDto {
   category: { id: number };
   assets: {
      id: number;
      type: AssetTypeEnum;
      name: string;
      isCoverImage: boolean;
   };
   title: PostDto['title'];
   description: PostDto['description'];
   summary: PostDto['summary'];
   publishDate: PostDto['publishDate'];
   eventDate: PostDto['eventDate'];
   isApproved: PostDto['isApproved'];
   isCanceled: PostDto['isCanceled'];
   type: PostDto['type'];
   isPinned: PostDto['isPinned'];
   tags: PostDto['tags'];
   comments: PostDto['comments'];
}
