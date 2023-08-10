import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './assets.entity';
import { AssetsService } from './assets.service';
import { StorageModule } from '../storage/storage.module';
import { AssetValidationService } from './asset-validation.service';

@Module({
   imports: [TypeOrmModule.forFeature([Asset]), StorageModule],
   providers: [AssetsService, AssetValidationService],
   exports: [AssetsService],
})
export class AssetsModule {}
