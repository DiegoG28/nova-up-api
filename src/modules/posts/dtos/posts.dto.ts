import { AssetTypeEnum } from '../entities/assets.entity';
import { PostTypeEnum } from '../entities/posts.entity';

export class PostDto {
   id: number;
   categoryName: string;
   careerName: string;
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
