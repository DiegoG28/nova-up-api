import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
   @IsInt()
   @IsNotEmpty()
   roleId: number;

   @IsInt()
   @IsNotEmpty()
   departmentId: number;

   @IsString()
   @IsNotEmpty()
   email: string;

   @IsString()
   @IsNotEmpty()
   password: string;
}
