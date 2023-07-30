import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import { PostTypeEnum } from '../posts.entity';

export class PostCardDto {
   id: number;
   title: string;
   summary: string;
   type: PostTypeEnum;
   category: CategoryDto;
   coverImage: string;
   isApproved: boolean;
   tags: string;
}
