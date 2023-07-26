import { IsEnum, IsString, MaxLength } from 'class-validator';
import { AssetTypeEnum } from '../../posts/entities/assets.entity';

export class BaseAssetDto {
   @IsString()
   @MaxLength(120)
   name: string;

   @IsEnum(AssetTypeEnum)
   type: AssetTypeEnum;
}
