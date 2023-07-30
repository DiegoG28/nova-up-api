import {
   IsString,
   MaxLength,
   IsEnum,
   IsISO8601,
   IsOptional,
} from 'class-validator';
import { PostTypeEnum } from '../posts.entity';

export class BasePostDto {
   @IsString()
   @MaxLength(80)
   title: string;

   @IsString()
   description: string;

   @IsString()
   @MaxLength(120)
   summary: string;

   @IsISO8601()
   publishDate: Date;

   @IsISO8601()
   @IsOptional()
   eventDate?: Date;

   @IsEnum(PostTypeEnum)
   type: PostTypeEnum;

   @IsString()
   tags: string;

   @IsString()
   @IsOptional()
   @MaxLength(255)
   comments?: string;
}
