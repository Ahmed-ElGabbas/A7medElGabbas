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
import { SkillsService } from './skills.service';
import {
  CreateSkillCategoryDto,
  CreateSkillDto,
  CreateTickerSkillDto,
  UpdatePhilosophyQuoteDto,
  UpdateSkillCategoryDto,
  UpdateSkillDto,
  UpdateSkillSpotlightDto,
  UpdateTickerSkillDto,
} from './dto/skills.dto';
import { Public } from '../common/public.decorator';
import { ReorderIdsDto } from '../common/dto/reorder.dto';

/**
 * Skills are split across several resources because they are edited as separate
 * things in the admin: a category list, the skills inside each category, a
 * per-category spotlight, the philosophy quote, and the ticker strip.
 */
@Controller()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  /** Full payload for the public Skills section in one request. */
  @Public()
  @Get('skills')
  findAll() {
    return this.skillsService.findAll();
  }

  /* ----------------------------- categories ----------------------------- */

  @Post('skill-categories')
  @HttpCode(HttpStatus.CREATED)
  createCategory(@Body() dto: CreateSkillCategoryDto) {
    return this.skillsService.createCategory(dto);
  }

  @Patch('skill-categories/reorder')
  reorderCategories(@Body() dto: ReorderIdsDto) {
    return this.skillsService.reorderCategories(dto);
  }

  @Patch('skill-categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateSkillCategoryDto) {
    return this.skillsService.updateCategory(id, dto);
  }

  @Delete('skill-categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCategory(@Param('id') id: string) {
    await this.skillsService.removeCategory(id);
  }

  /* -------------------------------- skills ------------------------------- */

  @Post('skill-categories/:categoryId/skills')
  @HttpCode(HttpStatus.CREATED)
  createSkill(
    @Param('categoryId') categoryId: string,
    @Body() dto: CreateSkillDto,
  ) {
    return this.skillsService.createSkill(categoryId, dto);
  }

  @Patch('skill-categories/:categoryId/skills/reorder')
  reorderSkills(
    @Param('categoryId') categoryId: string,
    @Body() dto: ReorderIdsDto,
  ) {
    return this.skillsService.reorderSkills(categoryId, dto);
  }

  @Patch('skill-categories/:categoryId/skills/:id')
  updateSkill(
    @Param('categoryId') categoryId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.skillsService.updateSkill(categoryId, id, dto);
  }

  @Delete('skill-categories/:categoryId/skills/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSkill(
    @Param('categoryId') categoryId: string,
    @Param('id') id: string,
  ) {
    await this.skillsService.removeSkill(categoryId, id);
  }

  /* ------------------------------ spotlights ----------------------------- */

  @Patch('skill-categories/:categoryId/spotlight')
  updateSpotlight(
    @Param('categoryId') categoryId: string,
    @Body() dto: UpdateSkillSpotlightDto,
  ) {
    return this.skillsService.updateSpotlight(categoryId, dto);
  }

  /* --------------------------- philosophy quote -------------------------- */

  @Patch('philosophy-quote')
  updatePhilosophyQuote(@Body() dto: UpdatePhilosophyQuoteDto) {
    return this.skillsService.updatePhilosophyQuote(dto);
  }

  /* ----------------------------- ticker skills ---------------------------- */

  @Public()
  @Get('ticker-skills')
  findTickerSkills() {
    return this.skillsService.findAll().then((r) => ({ items: r.tickerSkills }));
  }

  @Post('ticker-skills')
  @HttpCode(HttpStatus.CREATED)
  createTickerSkill(@Body() dto: CreateTickerSkillDto) {
    return this.skillsService.createTickerSkill(dto);
  }

  @Patch('ticker-skills/reorder')
  reorderTickerSkills(@Body() dto: ReorderIdsDto) {
    return this.skillsService.reorderTickerSkills(dto);
  }

  @Patch('ticker-skills/:id')
  updateTickerSkill(@Param('id') id: string, @Body() dto: UpdateTickerSkillDto) {
    return this.skillsService.updateTickerSkill(id, dto);
  }

  @Delete('ticker-skills/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTickerSkill(@Param('id') id: string) {
    await this.skillsService.removeTickerSkill(id);
  }
}