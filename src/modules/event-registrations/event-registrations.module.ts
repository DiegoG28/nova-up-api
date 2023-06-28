import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegistration } from './event-registrations.entity';

@Module({
   imports: [TypeOrmModule.forFeature([EventRegistration])],
})
export class EventRegistrationsModule {}
