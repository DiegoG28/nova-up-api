import { BadRequestException, Injectable } from '@nestjs/common';
import { Errors } from 'src/libs/errors';

const AssetLimits = {
   MAX_IMAGES: 10,
   MAX_PDFS: 5,
   MAX_IMAGE_SIZE: 5 * 1024 * 1024,
   MAX_PDF_SIZE: 3 * 1024 * 1024,
};

@Injectable()
export class AssetValidationService {
   /**
    * Validates a collection of files based on predefined constraints.
    * - Ensures that the number of image and PDF files are within acceptable limits.
    * - Ensures that the size of individual image and PDF files do not exceed predefined size limits.
    *
    * @private
    * @param files - Collection of files to be validated.
    */
   validateAssets(files: Express.Multer.File[]) {
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

   validateCoverImage(file: Express.Multer.File): void {
      if (!this.isImage(file)) {
         throw new BadRequestException(Errors.COVER_IMAGE_NOT_AN_IMAGE);
      }
   }

   isFile(asset: any): asset is Express.Multer.File {
      return typeof asset === 'object' && 'mimetype' in asset;
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

   private isImage(file: Express.Multer.File): boolean {
      return file.mimetype.startsWith('image/');
   }

   private isPDF(file: Express.Multer.File): boolean {
      return file.mimetype === 'application/pdf';
   }
}
