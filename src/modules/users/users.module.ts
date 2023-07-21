import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CatalogsModule } from '../catalogs/catalogs.module';

@Module({
   imports: [TypeOrmModule.forFeature([User]), CatalogsModule],
   controllers: [UsersController],
   providers: [UsersService],
   exports: [UsersService],
})
export class UsersModule {}
