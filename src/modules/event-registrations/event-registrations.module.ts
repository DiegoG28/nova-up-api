import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegistration } from './event-registrations.entity';

// This module is only used to register the EventRegistration entity with TypeORM.
// It was created for a future implementation.
@Module({
   imports: [TypeOrmModule.forFeature([EventRegistration])],
})
export class EventRegistrationsModule {}
