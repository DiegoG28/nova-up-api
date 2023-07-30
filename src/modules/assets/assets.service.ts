import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryRunner, Repository } from 'typeorm';
import { Asset, AssetTypeEnum } from './assets.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AssetsService {
   constructor(
      @InjectRepository(Asset)
      private readonly assetsRepository: Repository<Asset>,

      private readonly storageService: StorageService,
   ) {}

   async createAsset(
      postId: number,
      asset: Express.Multer.File | string,
      queryRunner?: QueryRunner,
   ): Promise<Asset> {
      if (typeof asset === 'string') {
         return this.createAssetLink(asset, postId, queryRunner);
      }

      if (typeof asset === 'object' && 'mimetype' in asset) {
         return this.createAssetFile(asset, postId, queryRunner);
      }

      throw new BadRequestException(
         'At least one of asset or file must be provided',
      );
   }

   async createAssets(
      postId: number,
      assets: (Express.Multer.File | string)[],
      queryRunner: QueryRunner,
   ) {
      const assetCreationPromises = assets.map(async (asset) => {
         const createdAsset = await this.createAsset(
            postId,
            asset,
            queryRunner,
         );
         console.log(createdAsset);
      });

      await Promise.all(assetCreationPromises);
   }

   async removeAsset(assetId: number) {
      await this.assetsRepository.delete(assetId);
   }

   private async createAssetLink(
      asset: string,
      postId: number,
      queryRunner?: QueryRunner,
   ): Promise<Asset> {
      const newAsset: DeepPartial<Asset> = {
         name: asset,
         type: AssetTypeEnum.Link,
         post: { id: postId },
      };

      const createdAsset = this.assetsRepository.create(newAsset);

      if (queryRunner) {
         await queryRunner.manager.save(createdAsset);
      } else {
         await this.assetsRepository.save(createdAsset);
      }
      return createdAsset;
   }

   private async createAssetFile(
      file: Express.Multer.File,
      postId: number,
      queryRunner?: QueryRunner,
   ): Promise<Asset> {
      const types = this.getAssetAndFolderType(file.mimetype);
      const assetPath = this.storageService.uploadFile(
         file,
         postId,
         types.folderType,
      );

      const newAsset: DeepPartial<Asset> = {
         name: assetPath,
         type: types.assetType,
         post: { id: postId },
      };

      const createdAsset = this.assetsRepository.create(newAsset);

      if (queryRunner) {
         await queryRunner.manager.save(createdAsset);
      } else {
         await this.assetsRepository.save(createdAsset);
      }
      return createdAsset;
   }

   private getAssetAndFolderType(mimeType: string): {
      assetType: AssetTypeEnum;
      folderType: 'images' | 'pdfs';
   } {
      if (mimeType.startsWith('image/')) {
         return { assetType: AssetTypeEnum.Image, folderType: 'images' };
      } else if (mimeType === 'application/pdf') {
         return { assetType: AssetTypeEnum.PDF, folderType: 'pdfs' };
      } else {
         throw new BadRequestException(`Unsupported file type: ${mimeType}`);
      }
   }
}
