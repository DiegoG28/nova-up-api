import { ApiProperty } from '@nestjs/swagger';

export class StudentDto {
  @ApiProperty()
  tuition: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastName: string;
}
