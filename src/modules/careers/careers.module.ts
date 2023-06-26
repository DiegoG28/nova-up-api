import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Career } from './careers.entity';

@Module({
   imports: [TypeOrmModule.forFeature([Career])],
})
export class CareersModule {}
