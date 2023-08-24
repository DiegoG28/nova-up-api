import {
   IsString,
   MaxLength,
   IsEnum,
   IsISO8601,
   IsOptional,
   IsNotEmpty,
} from 'class-validator';
import { PostTypeEnum } from '../posts.entity';

export class BasePostDto {
   @IsString()
   @MaxLength(80)
   @IsNotEmpty()
   title: string;

   @IsString()
   @IsNotEmpty()
   description: string;

   @IsString()
   @MaxLength(120)
   @IsNotEmpty()
   summary: string;

   @IsISO8601()
   @IsOptional()
   eventDate?: Date | null;

   @IsEnum(PostTypeEnum)
   @IsNotEmpty()
   type: PostTypeEnum;

   @IsString()
   tags: string;

   @IsString()
   @IsOptional()
   @MaxLength(255)
   comments?: string | null;
}
