import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { BasePostDto } from './base-post.dto';

export class UpdatePostDto extends BasePostDto {
   @IsInt()
   @IsPositive()
   @IsOptional()
   categoryId?: number;
}
