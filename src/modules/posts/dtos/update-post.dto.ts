import { CareerDto } from 'src/modules/careers/dtos/careers.dto';
import { CategoryDto } from 'src/modules/catalogs/dtos/categories.dto';
import { PostAssetDto } from './posts.dto';
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
import { BasePostAssetDto, BasePostDto } from './base.dto';

export class UpdatePostDto extends BasePostDto {
   @IsInt()
   @IsPositive()
   id: number;

   @Allow()
   category: CategoryDto;

   @Allow()
   career: CareerDto;

   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => UpdateAssetPostDto)
   assets: PostAssetDto[];

   @IsBoolean()
   isPinned: boolean;
}

export class UpdateAssetPostDto extends BasePostAssetDto {
   @IsOptional()
   @IsInt()
   @IsPositive()
   id: number;
}
