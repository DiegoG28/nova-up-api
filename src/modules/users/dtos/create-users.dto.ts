import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
   @IsInt()
   @IsNotEmpty()
   role: number;

   @IsInt()
   @IsNotEmpty()
   department: number;

   @IsString()
   @IsNotEmpty()
   email: string;

   @IsString()
   @IsNotEmpty()
   password: string;
}
