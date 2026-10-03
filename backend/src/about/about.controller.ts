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
import { AboutService } from './about.service';
import {
  CreateQuickFactDto,
  UpdateAboutContentDto,
  UpdateQuickFactDto,
} from './dto/about.dto';
import { Public } from '../common/public.decorator';
import { ReorderIdsDto } from '../common/dto/reorder.dto';

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  /** Narrative + quick facts in one call. */
  @Public()
  @Get()
  findAbout() {
    return this.aboutService.findAbout();
  }

  @Patch()
  updateAbout(@Body() dto: UpdateAboutContentDto) {
    return this.aboutService.updateAbout(dto);
  }

  @Public()
  @Get('quick-facts')
  findQuickFacts() {
    return this.aboutService.findQuickFacts();
  }

  @Post('quick-facts')
  @HttpCode(HttpStatus.CREATED)
  createQuickFact(@Body() dto: CreateQuickFactDto) {
    return this.aboutService.createQuickFact(dto);
  }

  @Patch('quick-facts/reorder')
  reorderQuickFacts(@Body() dto: ReorderIdsDto) {
    return this.aboutService.reorderQuickFacts(dto);
  }

  @Patch('quick-facts/:id')
  updateQuickFact(@Param('id') id: string, @Body() dto: UpdateQuickFactDto) {
    return this.aboutService.updateQuickFact(id, dto);
  }

  @Delete('quick-facts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeQuickFact(@Param('id') id: string) {
    await this.aboutService.removeQuickFact(id);
  }
}