import { CareerDto } from 'src/modules/careers/dtos/careers.dto';
import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import { PostAssetDto } from './posts.dto';
import { PostTypeEnum } from '../entities/posts.entity';

export class UpdatePostDto {
   id: number;
   category: CategoryDto;
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
