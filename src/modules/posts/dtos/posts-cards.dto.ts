import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import { PostStatusEnum, PostTypeEnum } from '../posts.entity';

export class PostCardDto {
   id: number;
   title: string;
   summary: string;
   comments: string | null;
   type: PostTypeEnum;
   status: PostStatusEnum;
   category: CategoryDto;
   coverImage: string;
   isApproved: boolean;
   tags: string;
}
