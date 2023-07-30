import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAssetDto {
   @IsString()
   @IsOptional()
   link?: string;

   @ApiProperty({ type: 'string', format: 'binary' })
   @IsOptional()
   file?: Express.Multer.File;
}
