import { AssetTypeEnum } from '../entities/assets.entity';
import { PostTypeEnum } from '../entities/posts.entity';

export class PostDto {
   id: number;
   category: PostCategoryDto;
   career: PostCareerDto;
   assets: PostAssetDto[];
   eventRegistrations: PostEventRegistrationDto[];
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

class PostCategoryDto {
   id: number;
   name: string;
}

class PostCareerDto {
   id: number;
   name: string;
}

class PostEventRegistrationDto {
   id: number;
   student: PostStudentDto;
}

class PostStudentDto {
   tuition: number;
   name: string;
   lastName: string;
}

export class PostAssetDto {
   id: number;
   name: string;
   type: AssetTypeEnum;
}
