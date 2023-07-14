import { CareerDto } from 'src/modules/careers/dtos/careers.dto';
import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import { BasePostAssetDto, BasePostDto } from './base.dto';

export class PostDto extends BasePostDto {
   id: number;
   category: CategoryDto;
   career: CareerDto;
   coverImage: string;
   assets: PostAssetDto[];
   isPinned: boolean;
}

export class PostAssetDto extends BasePostAssetDto {
   id: number;
}
