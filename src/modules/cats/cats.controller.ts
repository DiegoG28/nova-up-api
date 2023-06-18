import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dtos/CreateCatDto';
import { UpdateCatDto } from './dtos/UpdateCatDto';
import { Cat } from './entities/cat.entity';

@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto): Promise<void> {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<string> {
    if (parseInt(id) < 0) throw new BadRequestException();
    return `Cat #${id}`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `Cat #${id} updated`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `Cat #${id} removed`;
  }
}
