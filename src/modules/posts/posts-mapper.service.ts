import { Injectable } from '@nestjs/common';
import { Asset } from '../assets/assets.entity';
import { Post } from './posts.entity';
import { PostSummaryDto, PostCardDto, PostDto } from './dtos/posts.dto';

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
            publishDate: post.publishDate,
            comments: post.comments,
            type: post.type,
            status: post.status,
            category: post.category,
            coverImage,
            tags: post.tags,
         };
      });
   }

   mapToPostSummaryDto(posts: Post[]): PostSummaryDto[] {
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
               hash: asset.hash,
            };
         });

      return { ...post, coverImage, assets: postAssetsDto };
   }
}
