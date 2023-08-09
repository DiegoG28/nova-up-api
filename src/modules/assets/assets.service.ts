import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryRunner, Repository } from 'typeorm';
import { Asset, AssetTypeEnum } from './assets.entity';
import { StorageService } from '../storage/storage.service';
import { Errors } from 'src/libs/errors';
import { extname } from 'path';

const AssetLimits = {
   MAX_IMAGES: 10,
   MAX_PDFS: 5,
   MAX_IMAGE_SIZE: 5 * 1024 * 1024,
   MAX_PDF_SIZE: 3 * 1024 * 1024,
};

enum FolderTypes {
   IMAGES = 'images',
   PDFS = 'pdfs',
}

/**
 * Service responsible for handling assets (images, PDFs, etc.).
 * @class
 */
@Injectable()
export class AssetsService {
   constructor(
      @InjectRepository(Asset)
      private readonly assetsRepository: Repository<Asset>,
      private readonly storageService: StorageService,
   ) {}

   // Primary API methods for the service

   /**
    * Find an asset by its name and associated post ID.
    * @param name - Name of the asset.
    * @param postId - ID of the associated post.
    * @returns Promise resolving to the found Asset or null if not found.
    */
   async findAssetByNameAndPostId(
      name: string,
      postId: number,
   ): Promise<Asset | null> {
      return await this.assetsRepository.findOne({
         where: { name: name, post: { id: postId } },
         relations: ['post'],
      });
   }

   /**
    * Create a new asset for a given post. The asset can either be a file or a link.
    * @param postId - ID of the associated post.
    * @param asset - Asset to be created, can be a file or a link.
    * @param queryRunner - Optional query runner if running within a transaction.
    * @param isCoverImage - Optional flag to indicate if the asset is a cover image.
    * @returns Promise resolving to the created Asset.
    * @throws BadRequestException if neither a valid asset link nor file is provided.
    */
   async createAsset(
      postId: number,
      asset: Express.Multer.File | string,
      queryRunner?: QueryRunner,
      isCoverImage?: boolean,
   ): Promise<Asset> {
      if (typeof asset === 'string')
         return this.createAssetLink(asset, postId, queryRunner);

      if (this.isFile(asset)) {
         return this.handleFileAsset(asset, postId, queryRunner, isCoverImage);
      }
      throw new BadRequestException(Errors.NO_ASSET_OR_FILE_PROVIDED);
   }

   async createAssets(
      postId: number,
      assets: (Express.Multer.File | string)[],
      queryRunner?: QueryRunner,
   ): Promise<Asset[]> {
      const files = assets.filter(this.isFile);

      this.validateAssets(files);

      const assetCreationPromises = assets.map((asset) =>
         this.createAsset(postId, asset, queryRunner),
      );

      return await Promise.all(assetCreationPromises);
   }

   /**
    * Deletes an asset from the database based on its name. If the asset is not associated with any other posts,
    * it will also be removed from the storage.
    *
    * @param name - Name of the asset to delete.
    * @param postId - Optional ID of the associated post to narrow down the deletion.
    */
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

   // Helper or related methods for primary ones

   /**
    * Handles the creation of an asset that is a file. Validates if it's a cover image and then proceeds to save it.
    *
    * @private
    * @param file - The file to be processed.
    * @param postId - ID of the associated post.
    * @param queryRunner - Optional query runner if running within a transaction.
    * @param isCoverImage - Optional flag to indicate if the asset is a cover image.
    * @returns Promise resolving to the created Asset.
    */
   private handleFileAsset(
      file: Express.Multer.File,
      postId: number,
      queryRunner?: QueryRunner,
      isCoverImage?: boolean,
   ): Promise<Asset> {
      this.validateCoverImage(file, isCoverImage);

      return this.createAssetFile(file, postId, queryRunner, isCoverImage);
   }

   /**
    * Handles the scenario where an asset with the same hash already exists in the system.
    * - If the asset with the same name is associated with the given postId, it directly returns that asset.
    * - Otherwise, a new database entry is created for the existing asset for the given postId. This method doesn't save any files on local storage.
    *
    * @private
    * @param existingAsset - Existing asset based on file hash.
    * @param postId - ID of the associated post.
    * @param queryRunner - Optional query runner if running within a transaction.
    * @returns Promise resolving to either the existing Asset or the newly created asset entry.
    */

   private async handleExistingAsset(
      existingAsset: Asset,
      postId: number,
      queryRunner?: QueryRunner,
   ): Promise<Asset> {
      const duplicateAsset = await this.findAssetByNameAndPostId(
         existingAsset.name,
         postId,
      );
      if (duplicateAsset) {
         return duplicateAsset;
      }

      const newAssetEntry: DeepPartial<Asset> = {
         name: existingAsset.name,
         type: existingAsset.type,
         isCoverImage: existingAsset.isCoverImage,
         post: { id: postId },
         hash: existingAsset.hash,
      };

      return this.saveAsset(newAssetEntry, queryRunner);
   }

   /**
    * Creates and stores a new asset when no existing asset with the same hash is found.
    * - Determines the asset type and storage folder.
    * - Generates a unique name for the asset.
    * - Stores the asset both in the storage and in the database.
    *
    * @private
    * @param file - The uploaded file to be processed.
    * @param postId - Associated post ID.
    * @param fileHash - Calculated hash for the file.
    * @param queryRunner - Optional query runner if running within a transaction.
    * @param isCoverImage - Optional flag to indicate if the asset is a cover image.
    * @returns Promise resolving to the created Asset.
    */
   private storeNewAsset(
      file: Express.Multer.File,
      postId: number,
      fileHash: string,
      queryRunner?: QueryRunner,
      isCoverImage?: boolean,
   ): Promise<Asset> {
      const { assetType, folderType } = this.getAssetAndFolderType(
         file.mimetype,
      );
      const assetName = this.generateAssetName(file, folderType, fileHash);
      const assetPath = this.storageService
         .uploadFile(file, folderType, assetName)
         .replace(/\\/g, '/');

      const newAsset: DeepPartial<Asset> = {
         name: assetPath,
         type: assetType,
         isCoverImage,
         post: { id: postId },
         hash: fileHash,
      };

      return this.saveAsset(newAsset, queryRunner);
   }

   /**
    * Creates and stores an asset based on a given file. This method first calculates the hash of the provided file
    * and looks for an existing asset with that hash in the database.
    *
    * If an existing asset with the same hash is found:
    *  - The file is not saved to local storage.
    *  - If there's also an asset with the same hash associated and postId, it simply returns that asset without any modification
    *    in the database or storage.
    *  - If no asset with the same hash is associated with the given postId, a new database entry is created for the asset, but the file is not
    *    saved again to local storage.
    *
    * If no existing asset is found:
    *  - The asset's type is determined, and the corresponding folder where it should be stored is decided upon.
    *  - A name for the asset is generated.
    *  - The asset is stored both in local storage and in the database.
    *
    * In summary, this method has three possible outcomes:
    *  1. The asset is stored both in local storage and in the database.
    *  2. The asset isn't stored in local storage but is in the database (new entry for an existing asset).
    *  3. The asset isn't stored in either local storage or the database (in the case of a duplicate record for the same postId).
    *
    * @private
    * @param file - The uploaded file to be processed.
    * @param postId - Associated post ID.
    * @param queryRunner - Optional query runner if running within a transaction.
    * @param isCoverImage - Optional flag to indicate if the asset is a cover image.
    * @returns Promise resolving to the created or existing Asset.
    */
   private async createAssetFile(
      file: Express.Multer.File,
      postId: number,
      queryRunner?: QueryRunner,
      isCoverImage?: boolean,
   ): Promise<Asset> {
      const fileHash = this.storageService.calculateFileHash(file.buffer);

      const existingAsset = await this.findAssetByHash(fileHash);
      if (existingAsset) {
         return this.handleExistingAsset(existingAsset, postId);
      } else {
         return this.storeNewAsset(
            file,
            postId,
            fileHash,
            queryRunner,
            isCoverImage,
         );
      }
   }

   /**
    * Creates and saves a link-based asset to the database.
    *
    * @private
    * @param asset - URL or link to the asset.
    * @param postId - ID of the associated post.
    * @param queryRunner - Optional query runner if running within a transaction.
    * @returns Promise resolving to the created or existing Asset.
    */
   private async createAssetLink(
      asset: string,
      postId: number,
      queryRunner?: QueryRunner,
   ): Promise<Asset> {
      const existingAsset = await this.findAssetByNameAndPostId(asset, postId);
      if (existingAsset) return existingAsset;

      const newAsset: DeepPartial<Asset> = {
         name: asset,
         type: AssetTypeEnum.Link,
         post: { id: postId },
      };

      return await this.saveAsset(newAsset, queryRunner);
   }

   /**
    * Saves the provided asset to the database, either within an existing transaction or outside.
    *
    * @private
    * @param asset - Asset data to be saved.
    * @param queryRunner - Optional query runner if running within a transaction.
    * @returns Promise resolving to the saved Asset.
    */
   private async saveAsset(
      asset: DeepPartial<Asset>,
      queryRunner?: QueryRunner,
   ): Promise<Asset> {
      const createdAsset = this.assetsRepository.create(asset);
      if (queryRunner) {
         await queryRunner.manager.save(createdAsset);
      } else {
         await this.assetsRepository.save(createdAsset);
      }
      return createdAsset;
   }

   /**
    * Determines the type (Image/PDF) and the storage folder based on the provided MIME type.
    *
    * @private
    * @param mimeType - MIME type of the file to determine the type and folder.
    * @returns An object containing the determined asset type and folder type.
    * @throws BadRequestException if the MIME type is not supported.
    */
   private getAssetAndFolderType(mimeType: string): {
      assetType: AssetTypeEnum;
      folderType: FolderTypes;
   } {
      if (mimeType.startsWith('image/')) {
         return {
            assetType: AssetTypeEnum.Image,
            folderType: FolderTypes.IMAGES,
         };
      } else if (mimeType === 'application/pdf') {
         return { assetType: AssetTypeEnum.PDF, folderType: FolderTypes.PDFS };
      } else {
         throw new BadRequestException(`Unsupported file type: ${mimeType}`);
      }
   }

   private generateAssetName(
      file: Express.Multer.File,
      folderType: FolderTypes,
      fileHash: string,
   ): string {
      if (folderType === FolderTypes.PDFS) {
         return file.originalname;
      } else {
         const truncatedHash = fileHash.substring(0, 20);
         const timestamp = Date.now();
         const fileExtension = extname(file.originalname);
         return `${truncatedHash}-${timestamp}${fileExtension}`;
      }
   }

   private async findAssetByHash(hash: string): Promise<Asset | null> {
      return this.assetsRepository.findOne({
         where: { hash: hash },
         relations: ['post'],
      });
   }

   // Validation and other utility functions

   /**
    * Validates a collection of files based on predefined constraints.
    * - Ensures that the number of image and PDF files are within acceptable limits.
    * - Ensures that the size of individual image and PDF files do not exceed predefined size limits.
    *
    * @private
    * @param files - Collection of files to be validated.
    */
   private validateAssets(files: Express.Multer.File[]) {
      const images = files.filter((file) => this.isImage(file));
      const pdfs = files.filter((file) => this.isPDF(file));

      this.validateFileCount(
         images,
         AssetLimits.MAX_IMAGES,
         Errors.TOO_MANY_FILES('images', AssetLimits.MAX_IMAGES),
      );
      this.validateFileCount(
         pdfs,
         AssetLimits.MAX_PDFS,
         Errors.TOO_MANY_FILES('PDFs', AssetLimits.MAX_PDFS),
      );
      this.validateFileSize(
         images,
         AssetLimits.MAX_IMAGE_SIZE,
         Errors.FILE_SIZE_TOO_LARGE('image', AssetLimits.MAX_IMAGE_SIZE),
      );
      this.validateFileSize(
         pdfs,
         AssetLimits.MAX_PDF_SIZE,
         Errors.FILE_SIZE_TOO_LARGE('PDF', AssetLimits.MAX_PDF_SIZE),
      );
   }

   private validateFileSize(
      files: Express.Multer.File[],
      maxSize: number,
      errorObject: { error: string; message: string },
   ) {
      if (files.some((file) => file.size > maxSize)) {
         throw new BadRequestException(errorObject);
      }
   }

   private validateFileCount(
      files: Express.Multer.File[],
      maxCount: number,
      errorObject: { error: string; message: string },
   ) {
      if (files.length > maxCount) {
         throw new BadRequestException(errorObject);
      }
   }

   private validateCoverImage(
      file: Express.Multer.File,
      isCoverImage?: boolean,
   ): void {
      if (isCoverImage && !this.isImage(file)) {
         throw new BadRequestException(Errors.COVER_IMAGE_NOT_AN_IMAGE);
      }
   }

   private isFile(asset: any): asset is Express.Multer.File {
      return typeof asset === 'object' && 'mimetype' in asset;
   }

   private isImage(file: Express.Multer.File): boolean {
      return file.mimetype.startsWith('image/');
   }

   private isPDF(file: Express.Multer.File): boolean {
      return file.mimetype === 'application/pdf';
   }
}
