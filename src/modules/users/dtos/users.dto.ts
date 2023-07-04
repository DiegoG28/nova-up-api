export class UsersDto {
   id: number;
   email: string;
   password: string;
   role: {
      id: number;
      name: string;
   };
   department: {
      id: number;
      name: string;
   };
}
