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
import { NavService } from './nav.service';
import { CreateNavItemDto, UpdateNavItemDto } from './dto/nav.dto';
import { Public } from '../common/public.decorator';
import { ReorderIdsDto } from '../common/dto/reorder.dto';

@Controller('nav-items')
export class NavController {
  constructor(private readonly navService: NavService) {}

  @Public()
  @Get()
  findAll() {
    return this.navService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.navService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateNavItemDto) {
    return this.navService.create(dto);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderIdsDto) {
    return this.navService.reorder(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNavItemDto) {
    return this.navService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.navService.remove(id);
  }
}
