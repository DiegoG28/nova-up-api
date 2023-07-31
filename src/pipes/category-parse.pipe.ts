import {
   ArgumentMetadata,
   Injectable,
   PipeTransform,
   BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseCategoryPipe implements PipeTransform {
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   transform(value: any, _: ArgumentMetadata) {
      if (value.categoryId) {
         const val = parseInt(value.categoryId, 10);
         if (isNaN(val)) {
            throw new BadRequestException('categoryId must be a string number');
         }
         if (val <= 0) {
            throw new BadRequestException(
               'categoryId must be a positive number',
            );
         }
         value.categoryId = val;
      }
      return value;
   }
}
