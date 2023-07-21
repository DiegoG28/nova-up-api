import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import {
   Allow,
   IsArray,
   IsBoolean,
   IsInt,
   IsOptional,
   IsPositive,
   ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BasePostDto } from './base-post.dto';
import { BaseAssetDto } from 'src/modules/assets/base-asset.dto';

export class UpdatePostDto extends BasePostDto {
   @IsInt()
   @IsPositive()
   id: number;

   @Allow()
   category: CategoryDto;

   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => UpdateAssetPostDto)
   assets: UpdateAssetPostDto[];

   @IsBoolean()
   isPinned: boolean;
}

export class UpdateAssetPostDto extends BaseAssetDto {
   @IsOptional()
   @IsInt()
   @IsPositive()
   id?: number;
}
