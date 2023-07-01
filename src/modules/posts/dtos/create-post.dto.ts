import { AssetTypeEnum } from '../entities/assets.entity';
import { PostDto } from './posts.dto';

export class CreatePostDto {
   categoryId: number;
   careerId: number;
   assets: CreatePostAssetDto[];
   title: PostDto['title'];
   description: PostDto['description'];
   summary: PostDto['summary'];
   publishDate: PostDto['publishDate'];
   eventDate: PostDto['eventDate'];
   isApproved: PostDto['isApproved'];
   isCanceled: PostDto['isCanceled'];
   type: PostDto['type'];
   isPinned: PostDto['isPinned'];
   tags: PostDto['tags'];
   comments: PostDto['comments'];
}

export class CreatePostAssetDto {
   name: string;
   type: AssetTypeEnum;
}
