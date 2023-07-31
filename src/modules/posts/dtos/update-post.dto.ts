import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { BasePostDto } from './base-post.dto';

export class UpdatePostDto extends BasePostDto {
   @IsInt()
   @IsPositive()
   @IsOptional()
   categoryId?: number;

   /*@ApiProperty({ type: 'string', format: 'binary', isArray: true })
   files: Express.Multer.File[];*/
}

export class UpdatePostResponse {
   status: string;
   message: string;
}
