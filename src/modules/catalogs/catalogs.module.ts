import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/departments.entity';
import { Role } from './roles/roles.entity';
import { Category } from './entities/categories.entity';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';

@Module({
   imports: [TypeOrmModule.forFeature([Category, Department, Role])],
   controllers: [CatalogsController],
   providers: [CatalogsService],
})
export class CatalogsModule {}
