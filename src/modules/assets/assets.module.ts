import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './assets.entity';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { StorageModule } from '../storage/storage.module';

@Module({
   imports: [TypeOrmModule.forFeature([Asset]), StorageModule],
   controllers: [AssetsController],
   providers: [AssetsService],
   exports: [AssetsService],
})
export class AssetsModule {}