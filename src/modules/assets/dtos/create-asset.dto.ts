import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateAssetDto {
   @ApiProperty({
      description:
         'Links should be provided as a single string, with each asset separated by a comma. ' +
         'Example: "link1,link2,link3". ',
      type: String,
   })
   @IsString()
   @IsOptional()
   links?: string;

   @ApiProperty({
      description:
         'Array of files to upload. Note: despite being part of the DTO, this field will be handled by Multer, not by the validation pipeline.',
      type: 'string',
      format: 'binary',
      isArray: true,
   })
   @IsOptional()
   files?: Express.Multer.File[];

   @ApiProperty({
      description:
         'Cover image of the post. Note: despite being part of the DTO, this field will be handled by Multer, not by the validation pipeline.',
      type: 'string',
      format: 'binary',
   })
   @IsOptional()
   coverImageFile?: Express.Multer.File;
}
