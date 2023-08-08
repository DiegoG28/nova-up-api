import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';

@Injectable()
export class StorageService {
   uploadFile(
      file: Express.Multer.File,
      postId: number,
      assetType: string,
   ): string {
      try {
         const { originalname, buffer } = file;

         const directoryPath = join('assets', postId.toString(), assetType);

         if (!existsSync(directoryPath))
            mkdirSync(directoryPath, { recursive: true });

         const filePath = join(directoryPath, originalname);

         writeFileSync(filePath, buffer);

         return filePath;
      } catch (error) {
         throw new InternalServerErrorException(
            `Failed to save the file: ${error.message}`,
         );
      }
   }

   deleteFile(filePath: string) {
      try {
         if (existsSync(filePath)) {
            unlinkSync(filePath);
         }
      } catch (error) {
         throw new InternalServerErrorException(
            `Failed to delete the file: ${error.message}`,
         );
      }
   }
}
