import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class StorageService {
   uploadFile(
      file: Express.Multer.File,
      assetType: string,
      fileName: string,
   ): string {
      try {
         const { buffer } = file;

         const directoryPath = join('assets', assetType);

         if (!existsSync(directoryPath))
            mkdirSync(directoryPath, { recursive: true });

         const filePath = join(directoryPath, fileName);

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

   calculateFileHash(buffer: Buffer): string {
      const hash = createHash('sha256');
      hash.update(buffer);
      return hash.digest('hex');
   }
}
