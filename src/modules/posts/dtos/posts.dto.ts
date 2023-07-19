import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import { BasePostAssetDto, BasePostDto } from './base.dto';

export class PostDto extends BasePostDto {
   id: number;
   category: CategoryDto;
   coverImage: string;
   assets: PostAssetDto[];
   isPinned: boolean;
}

export class PostAssetDto extends BasePostAssetDto {
   id: number;
}
