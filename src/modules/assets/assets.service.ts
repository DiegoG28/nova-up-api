import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryRunner, Repository } from 'typeorm';
import { Asset, AssetTypeEnum } from './assets.entity';
import { StorageService } from '../storage/storage.service';
import { Errors } from 'src/libs/errors';

@Injectable()
export class AssetsService {
   constructor(
      @InjectRepository(Asset)
      private readonly assetsRepository: Repository<Asset>,

      private readonly storageService: StorageService,
   ) {}

   private readonly MAX_IMAGES = 10;
   private readonly MAX_PDFS = 5;
   private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024;
   private readonly MAX_PDF_SIZE = 3 * 1024 * 1024;

   async findAssetByName(name: string, postId: number): Promise<Asset | null> {
      return await this.assetsRepository.findOne({
         where: { name: name, post: { id: postId } },
         relations: ['post'],
      });
   }

   async createAsset(
      postId: number,
      asset: Express.Multer.File | string,
      queryRunner?: QueryRunner,
      isCoverImage?: boolean,
   ): Promise<Asset> {
      if (typeof asset === 'string') {
         return this.createAssetLink(asset, postId, queryRunner);
      }

      if (typeof asset === 'object' && 'mimetype' in asset) {
         if (isCoverImage && !asset.mimetype.startsWith('image/'))
            throw new BadRequestException(Errors.UNSUPPORTED_FILE_TYPE_COVER);

         return this.createAssetFile(asset, postId, queryRunner, isCoverImage);
      }

      throw new BadRequestException(Errors.NO_ASSET_OR_FILE_PROVIDED);
   }

   async createAssets(
      postId: number,
      assets: (Express.Multer.File | string)[],
      queryRunner?: QueryRunner,
   ): Promise<Asset[]> {
      const files = assets.filter(
         (asset) => typeof asset === 'object' && 'mimetype' in asset,
      ) as Express.Multer.File[];

      const images = files.filter((file) => file.mimetype.startsWith('image/'));
      const pdfs = files.filter((file) => file.mimetype === 'application/pdf');

      this.validateFileCount(
         images,
         this.MAX_IMAGES,
         'Too many images provided. Maximum is ' + this.MAX_IMAGES,
      );
      this.validateFileCount(
         pdfs,
         this.MAX_PDFS,
         'Too many PDFs provided. Maximum is ' + this.MAX_PDFS,
      );

      this.validateFileSize(
         images,
         this.MAX_IMAGE_SIZE,
         'Image file size too large. Maximum size is ' +
            this.MAX_IMAGE_SIZE / 1024 / 1024 +
            'MB',
      );
      this.validateFileSize(
         pdfs,
         this.MAX_PDF_SIZE,
         'PDF file size too large. Maximum size is ' +
            this.MAX_PDF_SIZE / 1024 / 1024 +
            'MB',
      );

      const assetCreationPromises = assets.map((asset) =>
         this.createAsset(postId, asset, queryRunner),
      );

      return await Promise.all(assetCreationPromises);
   }

   async deleteAsset(name: string, postId?: number) {
      if (postId) {
         await this.assetsRepository.delete({
            name: name,
            post: { id: postId },
         });
      }
      const count = await this.assetsRepository.count({
         where: { name: name },
      });
      if (count === 0) {
         this.storageService.deleteFile(name);
      }
   }

   private async createAssetLink(
      asset: string,
      postId: number,
      queryRunner?: QueryRunner,
   ): Promise<Asset> {
      const existingAsset = await this.findAssetByName(asset, postId);
      if (existingAsset) {
         return existingAsset;
      }

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
      isCoverImage?: boolean,
   ): Promise<Asset> {
      const fileHash = this.storageService.calculateFileHash(file.buffer);

      const existingAsset = await this.findAssetByHash(fileHash);

      const types = this.getAssetAndFolderType(file.mimetype);

      let normalizedAssetPath = '';

      if (existingAsset) {
         const existingAssetWithSamePost = await this.findAssetByName(
            existingAsset.name,
            postId,
         );

         if (existingAssetWithSamePost) {
            return existingAssetWithSamePost;
         }
         normalizedAssetPath = existingAsset.name;
      } else {
         const truncatedHash = fileHash.substring(0, 20);
         const timestamp = Date.now();
         const fileName = `${truncatedHash}-${timestamp}`;
         const assetPath = this.storageService.uploadFile(
            file,
            types.folderType,
            fileName,
         );
         normalizedAssetPath = assetPath.replace(/\\/g, '/');
      }

      const newAsset: DeepPartial<Asset> = {
         name: normalizedAssetPath,
         type: types.assetType,
         isCoverImage,
         post: { id: postId },
         hash: fileHash,
      };

      const createdAsset = this.assetsRepository.create(newAsset);

      if (queryRunner) {
         await queryRunner.manager.save(createdAsset);
      } else {
         await this.assetsRepository.save(createdAsset);
      }

      return createdAsset;
   }

   private async findAssetByHash(hash: string): Promise<Asset | null> {
      return this.assetsRepository.findOne({
         where: { hash: hash },
         relations: ['post'],
      });
   }

   private validateFileSize(
      files: Express.Multer.File[],
      maxSize: number,
      errorMsg: string,
   ) {
      for (const file of files) {
         if (file.size > maxSize) {
            throw new BadRequestException(errorMsg);
         }
      }
   }

   private validateFileCount(
      files: Express.Multer.File[],
      maxCount: number,
      errorMsg: string,
   ) {
      if (files.length > maxCount) {
         throw new BadRequestException(errorMsg);
      }
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
