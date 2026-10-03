import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { HeroService } from './hero.service';
import { CreateStatDto, UpdateStatDto } from './dto/stat.dto';
import { Public } from '../common/public.decorator';
import { ReorderIdsDto } from '../common/dto/reorder.dto';

/**
 * The resource is `/stats`, not `/hero`: the only editable Hero data is the
 * stats strip. Name, roles and status live on SiteConfig (Stage 0), which the
 * frontend reads alongside these.
 */
@Controller('stats')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Public()
  @Get()
  findAll() {
    return this.heroService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.heroService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStatDto) {
    return this.heroService.create(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderIdsDto) {
    return this.heroService.reorder(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStatDto) {
    return this.heroService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.heroService.remove(id);
  }
}