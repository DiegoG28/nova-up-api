import {
   IsInt,
   IsOptional,
   IsPositive,
   IsString,
   MaxLength,
} from 'class-validator';
import { BasePostDto } from './base-post.dto';

export class UpdatePostDto extends BasePostDto {
   @IsInt()
   @IsPositive()
   @IsOptional()
   categoryId?: number;
}

export class UpdateApprovedDto {
   @IsString()
   @IsOptional()
   @MaxLength(255)
   comments?: string;
}
