import { Injectable } from '@nestjs/common';
import { Asset } from '../assets/assets.entity';
import { Post } from './posts.entity';
import { PostCardDto } from './dtos/posts-cards.dto';
import { PostBannerDto } from './dtos/posts-banner.dto';
import { PostDto } from './dtos/posts.dto';

@Injectable()
export class PostsMapperService {
   getCoverImage(assets: Asset[]): string {
      const coverImage = assets.find((asset) => asset.isCoverImage);
      if (coverImage && coverImage.name) return coverImage.name;
      return '';
   }

   mapToPostCardDto(posts: Post[]): PostCardDto[] {
      return posts.map((post) => {
         const coverImage = this.getCoverImage(post.assets);
         return {
            id: post.id,
            title: post.title,
            summary: post.summary,
            type: post.type,
            category: post.category,
            coverImage,
            isApproved: post.isApproved,
            tags: post.tags,
         };
      });
   }

   mapToPostBannerDto(posts: Post[]): PostBannerDto[] {
      return posts.map((post) => {
         const coverImage = this.getCoverImage(post.assets);
         return {
            id: post.id,
            title: post.title,
            summary: post.summary,
            coverImage,
         };
      });
   }

   mapToPostDto(post: Post): PostDto {
      const coverImage = this.getCoverImage(post.assets);
      const postAssetsDto = post.assets
         .filter((asset) => !asset.isCoverImage)
         .map((asset) => {
            return {
               id: asset.id,
               name: asset.name,
               type: asset.type,
            };
         });

      return { ...post, coverImage, assets: postAssetsDto };
   }
}
