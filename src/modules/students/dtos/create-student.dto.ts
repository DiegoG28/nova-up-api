import { IsInt, IsString } from 'class-validator';

export class CreateStudentDto {
   @IsInt()
   tuition: number;

   @IsString()
   name: string;

   @IsString()
   lastName: string;
}
