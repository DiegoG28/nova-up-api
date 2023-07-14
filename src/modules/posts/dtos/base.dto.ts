import {
   IsString,
   MaxLength,
   IsEnum,
   IsISO8601,
   IsBoolean,
} from 'class-validator';
import { AssetTypeEnum } from '../entities/assets.entity';
import { PostTypeEnum } from '../entities/posts.entity';

export class BasePostAssetDto {
   @IsString()
   @MaxLength(120)
   name: string;

   @IsEnum(AssetTypeEnum)
   type: AssetTypeEnum;
}

export class BasePostDto {
   @IsString()
   @MaxLength(120)
   title: string;

   @IsString()
   description: string;

   @IsString()
   @MaxLength(120)
   summary: string;

   @IsISO8601()
   publishDate: Date;

   @IsISO8601()
   eventDate: Date;

   @IsBoolean()
   isApproved: boolean;

   @IsBoolean()
   isCanceled: boolean;

   @IsEnum(PostTypeEnum)
   type: PostTypeEnum;

   @IsString()
   tags: string;

   @IsString()
   @MaxLength(255)
   comments: string;
}
