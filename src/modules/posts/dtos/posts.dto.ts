import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import { BasePostDto } from './base-post.dto';
import { AssetDto } from 'src/modules/assets/dtos/assets.dto';

export class PostDto extends BasePostDto {
   id: number;
   category: CategoryDto;
   coverImage: string;
   assets: AssetDto[];
   isPinned: boolean;
   isApproved: boolean;
   isCanceled: boolean;
}
