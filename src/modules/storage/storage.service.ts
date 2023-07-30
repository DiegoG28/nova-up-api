import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

@Injectable()
export class StorageService {
   uploadFile(
      file: Express.Multer.File,
      postId: number,
      assetType: string,
   ): string {
      const { originalname, buffer } = file;

      const directoryPath = join('assets', postId.toString(), assetType);

      if (!existsSync(directoryPath))
         mkdirSync(directoryPath, { recursive: true });

      const filePath = join(directoryPath, originalname);

      writeFileSync(filePath, buffer);

      return filePath;
   }

   deleteFile() {
      return;
   }
}
