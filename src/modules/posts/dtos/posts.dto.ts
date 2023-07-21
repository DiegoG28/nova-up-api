import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import { BasePostDto } from './base-post.dto';
import { BaseAssetDto } from 'src/modules/assets/base-asset.dto';

export class PostDto extends BasePostDto {
   id: number;
   category: CategoryDto;
   coverImage: string;
   assets: PostAssetDto[];
   isPinned: boolean;
}

export class PostAssetDto extends BaseAssetDto {
   id: number;
}
