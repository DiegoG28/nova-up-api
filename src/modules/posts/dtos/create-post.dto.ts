import {
   IsArray,
   IsBoolean,
   IsDate,
   IsEnum,
   IsISO8601,
   IsNumber,
   IsPositive,
   IsString,
   ValidateNested,
} from 'class-validator';
import { AssetTypeEnum } from '../entities/assets.entity';
import { PostDto } from './posts.dto';
import { PostTypeEnum } from '../entities/posts.entity';
import { Type } from 'class-transformer';

export class CreatePostDto {
   @IsNumber()
   @IsPositive()
   categoryId: number;

   @IsNumber()
   @IsPositive()
   careerId: number;

   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => CreatePostAssetDto)
   assets: CreatePostAssetDto[];

   @IsString()
   title: PostDto['title'];

   @IsString()
   description: PostDto['description'];

   @IsString()
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
   name: string;

   @IsEnum(AssetTypeEnum)
   type: AssetTypeEnum;
}
