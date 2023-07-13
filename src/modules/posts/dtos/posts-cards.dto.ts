import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';

export class PostCardDto {
   id: number;
   title: string;
   summary: string;
   category: CategoryDto;
   coverImage: string;
   isApproved: boolean;
   tags: string;
}
