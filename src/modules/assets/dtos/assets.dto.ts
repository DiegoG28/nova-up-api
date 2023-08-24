import { AssetTypeEnum } from '../assets.entity';

export class AssetDto {
   id: number;
   name: string;
   type: AssetTypeEnum;
   hash: string | null;
}
