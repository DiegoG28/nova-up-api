export class UsersDto {
   id: number;
   email: string;
   role: {
      id: number;
      name: string;
   };
   department: {
      id: number;
      name: string;
   };
}
