import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryRunner, Repository } from 'typeorm';
import { Asset, AssetTypeEnum } from './assets.entity';
import { StorageService } from '../storage/storage.service';
import { Errors } from 'src/libs/errors';
import { extname } from 'path';
import { AssetValidationService } from './asset-validation.service';

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
      private readonly assetValidationService: AssetValidationService,
   ) {}

   // ------------------- Primary API methods for the service -------------------

   /**
    * Find an asset by its ID.
    * @param id - ID of asset.
    * @returns Promise resolving to the found Asset or null if not found.
    */
   async findById(id: number): Promise<Asset | null> {
      return await this.assetsRepository.findOne({
         where: {
            id: id,
         },
         relations: ['post'],
      });
   }

   /**
    * Finds a duplicate asset in the database based on its name, associated post ID, and whether it's a cover image.
    * This function is useful for ensuring uniqueness or checking for existing assets before adding new ones.
    *
    * @param name - Name of the asset to search for.
    * @param postId - ID of the associated post.
    * @param isCoverImage - Boolean indicating whether the asset is a cover image.
    *
    * @returns - Returns the matching Asset if found, or null otherwise.
    */
   async findDuplicateAsset(
      name: string,
      postId: number,
      isCoverImage: boolean,
   ): Promise<Asset | null> {
      return await this.assetsRepository.findOne({
         where: {
            name: name,
            post: { id: postId },
            isCoverImage,
         },
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

      if (this.assetValidationService.isFile(asset)) {
         return this.handleFileAsset(asset, postId, queryRunner, isCoverImage);
      }
      throw new BadRequestException(Errors.NO_ASSET_OR_FILE_PROVIDED);
   }

   /**
    * Creates assets for a given post. These assets could be files or links.
    * @param postId - The ID of the post to which these assets should be associated.
    * @param assets - An array of assets which can be files or links.
    * @param queryRunner - Optional TypeORM query runner, useful when handling transactions.
    * @returns An array of the created Asset entities.
    * @throws ValidationError If any of the assets do not meet the validation criteria.
    */
   async createAssets(
      postId: number,
      assets: (Express.Multer.File | string)[],
      queryRunner?: QueryRunner,
   ): Promise<Asset[]> {
      const files = assets.filter(this.assetValidationService.isFile);

      this.assetValidationService.validateAssets(files);

      const assetCreationPromises = assets.map((asset) =>
         this.createAsset(postId, asset, queryRunner),
      );

      return await Promise.all(assetCreationPromises);
   }

   /**
    * Deletes an asset from the database based on its ID. If the asset, identified by its name,
    * is not associated with any other posts, it will be removed from the storage.
    *
    * @param id - ID of the asset to delete.
    * @param name - Name of the asset, used to check associations and to delete from storage if necessary.
    */
   async deleteAsset(id: number, name: string) {
      await this.assetsRepository.delete({
         id: id,
      });

      const count = await this.assetsRepository.count({
         where: { name: name },
      });
      if (count === 0) {
         this.storageService.deleteFile(name);
      }
   }

   // ------------------- Helper or related methods for primary ones -------------------

   /**
    * Creates and stores an asset based on a given file. This method first calculates the hash * of the provided file and looks for an existing asset with that hash in the database.
    *
    * If an existing asset with the same hash is found:
    *  - The file is not saved to local storage.
    *  - If there's also an asset with the same hash associated, postId and isCoverImage
    *    status, it simply returns that asset without any modification in the database or      *    storage.
    *  - If no asset with the same hash is associated with the given postId or isCoverImage
    *    status, a new database entry is created for the asset, but the file is not
    *    saved again to local storage.
    *
    * If no existing asset is found:
    *  - The asset's type is determined, and the corresponding folder where it should be stored *    is decided upon.
    *  - A name for the asset is generated.
    *  - The asset is stored both in local storage and in the database.
    *
    * In summary, this method has three possible outcomes:
    *  1. The asset is stored both in local storage and in the database.
    *  2. The asset isn't stored in local storage but is in the database (new entry for an existing asset).
    *  3. The asset isn't stored in either local storage or the database (in the case of a duplicate record for the same postId and isCoverImage status).
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
         return this.handleExistingAsset(
            existingAsset,
            postId,
            queryRunner,
            isCoverImage,
         );
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
      const duplicateAsset = await this.findDuplicateAsset(
         asset,
         postId,
         false,
      );
      if (duplicateAsset) return duplicateAsset;

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
    * Handles the creation of an asset that is a file. If the asset is a cover image,
    * it validates the image format and checks for the existence of a previous cover image.
    * If an existing cover image is found, it deletes it before saving the new one.
    *
    * @private
    * @param file - The file to be processed and potentially stored.
    * @param postId - ID of the post with which the asset is associated.
    * @param queryRunner - Optional query runner if running within a transaction.
    * @param isCoverImage - Optional flag to indicate if the asset is a cover image.
    * @returns A Promise resolving to the created Asset.
    * @throws {BadRequestException} - If the provided cover image is not in a valid image format.
    */
   private async handleFileAsset(
      file: Express.Multer.File,
      postId: number,
      queryRunner?: QueryRunner,
      isCoverImage?: boolean,
   ): Promise<Asset> {
      if (isCoverImage) {
         this.assetValidationService.validateCoverImage(file);
         const existingCoverImage = await this.findCoverImageByPostId(postId);
         if (existingCoverImage) {
            await this.deleteAsset(
               existingCoverImage.id,
               existingCoverImage.name,
            );
         }
      }

      return this.createAssetFile(file, postId, queryRunner, isCoverImage);
   }

   /**
    * Handles the scenario where an asset with the same hash already exists in the system.
    * - If the asset with the same name is associated with the given postId and matches the cover image status, it directly returns that asset.
    * - Otherwise, a new database entry is created for the existing asset for the given postId and cover image status. This method doesn't save any files on local storage.
    *
    * @private
    * @param existingAsset - Existing asset based on file hash.
    * @param postId - ID of the associated post.
    * @param queryRunner - Optional query runner if running within a transaction.
    * @param isCoverImage - Optional Boolean indicating whether the asset is a cover image.
    *
    * @returns Promise resolving to either the existing Asset or the newly created asset entry.
    */
   private async handleExistingAsset(
      existingAsset: Asset,
      postId: number,
      queryRunner?: QueryRunner,
      isCoverImage?: boolean,
   ): Promise<Asset> {
      const duplicateAsset = await this.findDuplicateAsset(
         existingAsset.name,
         postId,
         isCoverImage ? true : false,
      );
      if (duplicateAsset) {
         return duplicateAsset;
      }

      const newAssetEntry: DeepPartial<Asset> = {
         name: existingAsset.name,
         type: existingAsset.type,
         isCoverImage,
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

   private async findCoverImageByPostId(postId: number): Promise<Asset | null> {
      return await this.assetsRepository.findOne({
         where: { post: { id: postId }, isCoverImage: true },
      });
   }

   private async findAssetByHash(hash: string): Promise<Asset | null> {
      return this.assetsRepository.findOne({
         where: { hash: hash },
         relations: ['post'],
      });
   }
}
