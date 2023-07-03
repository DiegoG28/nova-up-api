import { IsNumber, IsString } from 'class-validator';

export class CreateStudentDto {
   @IsNumber()
   tuition: number;

   @IsString()
   name: string;

   @IsString()
   lastName: string;
}
