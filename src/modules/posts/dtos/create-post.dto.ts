import {
   IsArray,
   IsBoolean,
   IsEnum,
   IsISO8601,
   IsInt,
   IsPositive,
   IsString,
   MaxLength,
   ValidateNested,
} from 'class-validator';
import { AssetTypeEnum } from '../entities/assets.entity';
import { PostDto } from './posts.dto';
import { PostTypeEnum } from '../entities/posts.entity';
import { Type } from 'class-transformer';

export class CreatePostDto {
   @IsInt()
   @IsPositive()
   categoryId: number;

   @IsInt()
   @IsPositive()
   careerId: number;

   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => CreatePostAssetDto)
   assets: CreatePostAssetDto[];

   @IsString()
   @MaxLength(120)
   title: PostDto['title'];

   @IsString()
   description: PostDto['description'];

   @IsString()
   @MaxLength(120)
   summary: PostDto['summary'];

   @IsISO8601()
   publishDate: PostDto['publishDate'];

   @IsISO8601()
   eventDate: PostDto['eventDate'];

   @IsBoolean()
   isApproved: PostDto['isApproved'];

   @IsBoolean()
   isCanceled: PostDto['isCanceled'];

   @IsEnum(PostTypeEnum)
   type: PostDto['type'];

   @IsBoolean()
   isPinned: PostDto['isPinned'];

   @IsString()
   tags: PostDto['tags'];

   @IsString()
   comments: PostDto['comments'];
}

export class CreatePostAssetDto {
   @IsString()
   @MaxLength(120)
   name: string;

   @IsEnum(AssetTypeEnum)
   type: AssetTypeEnum;
}
