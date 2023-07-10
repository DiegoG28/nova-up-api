import { CareerDto } from 'src/modules/careers/dtos/careers.dto';
import { AssetTypeEnum } from '../entities/assets.entity';
import { PostTypeEnum } from '../entities/posts.entity';
import { CategorieDto } from 'src/modules/categories/dtos/categories.dto';

export class PostDto {
   id: number;
   category: CategorieDto;
   career: CareerDto;
   assets: PostAssetDto[];
   title: string;
   description: string;
   summary: string;
   publishDate: Date;
   eventDate: Date;
   isApproved: boolean;
   isCanceled: boolean;
   type: PostTypeEnum;
   isPinned: boolean;
   tags: string;
   comments: string;
}

export class PostAssetDto {
   id: number;
   name: string;
   type: AssetTypeEnum;
}
