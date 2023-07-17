import { Request } from 'express';
import { JwtPayload } from 'src/modules/auth/dtos/sign-in.dto';

export interface RequestWithPayload extends Request {
   userPayload: JwtPayload;
}
