import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import { AssetDto } from 'src/modules/assets/dtos/assets.dto';
import { PostStatusEnum, PostTypeEnum } from '../posts.entity';

export class PostSummaryDto {
   id: number;
   title: string;
   summary: string;
   coverImage: string;
}

export class PostCardDto extends PostSummaryDto {
   publishDate: Date | null;
   category: CategoryDto;
   status: PostStatusEnum;
   type: PostTypeEnum;
   comments: string | null;
   tags: string;
}
export class PostDto extends PostCardDto {
   description: string;
   eventDate: Date | null;
   assets: AssetDto[];
   isPinned: boolean;
}
