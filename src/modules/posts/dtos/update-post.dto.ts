import {
   IsEnum,
   IsInt,
   IsOptional,
   IsPositive,
   IsString,
   MaxLength,
} from 'class-validator';
import { BasePostDto } from './base-post.dto';
import { PostStatusEnum } from '../posts.entity';

export class UpdatePostDto extends BasePostDto {
   @IsInt()
   @IsPositive()
   @IsOptional()
   categoryId?: number;
}

export class UpdatePostStatusDto {
   @IsString()
   @IsOptional()
   @MaxLength(255)
   comments?: string | null;

   @IsEnum(PostStatusEnum)
   @MaxLength(20)
   status: PostStatusEnum;
}
