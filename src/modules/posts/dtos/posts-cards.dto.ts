import { AssetTypeEnum } from '../entities/assets.entity';
import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';

export class PostCardDto {
   id: number;
   title: string;
   summary: string;
   category: CategoryDto;
   assets: PostCardAssetDto[];
}

export class PostCardAssetDto {
   id: number;
   name: string;
   type: AssetTypeEnum;
}
