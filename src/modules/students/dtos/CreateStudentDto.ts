import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
   @ApiProperty()
   tuition: number;

   @ApiProperty()
   name: string;

   @ApiProperty()
   lastName: string;
}
