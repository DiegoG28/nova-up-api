import {
   ArgumentMetadata,
   Injectable,
   PipeTransform,
   BadRequestException,
} from '@nestjs/common';
import { Errors } from 'src/libs/errors';

@Injectable()
export class ParseCategoryPipe implements PipeTransform {
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   transform(value: any, _: ArgumentMetadata) {
      if (value.categoryId) {
         const val = parseInt(value.categoryId, 10);
         if (isNaN(val)) {
            throw new BadRequestException(
               Errors.CATEGORYID_MUST_BE_STRING_NUMBER,
            );
         }
         if (val <= 0) {
            throw new BadRequestException(
               Errors.CATEGORYID_MUST_BE_POSITIVE_NUMBER,
            );
         }
         value.categoryId = val;
      }
      return value;
   }
}
