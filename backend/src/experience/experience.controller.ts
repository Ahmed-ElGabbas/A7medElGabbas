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
import { ExperienceService } from './experience.service';
import {
  CreateEducationDto,
  CreateExperienceDto,
  UpdateEducationDto,
  UpdateExperienceDto,
  UpdateFutureGoalsDto,
} from './dto/experience.dto';
import { Public } from '../common/public.decorator';
import { ReorderIdsDto } from '../common/dto/reorder.dto';

@Controller()
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  /** Full payload for the public Experience section in one request. */
  @Public()
  @Get('experience')
  findAll() {
    return this.experienceService.findAll();
  }

  /* ----------------------------- experiences ----------------------------- */

  @Post('experiences')
  @HttpCode(HttpStatus.CREATED)
  createExperience(@Body() dto: CreateExperienceDto) {
    return this.experienceService.createExperience(dto);
  }

  @Patch('experiences/reorder')
  reorderExperiences(@Body() dto: ReorderIdsDto) {
    return this.experienceService.reorderExperiences(dto);
  }

  @Patch('experiences/:id')
  updateExperience(@Param('id') id: string, @Body() dto: UpdateExperienceDto) {
    return this.experienceService.updateExperience(id, dto);
  }

  @Delete('experiences/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeExperience(@Param('id') id: string) {
    await this.experienceService.removeExperience(id);
  }

  /* ------------------------------ education ------------------------------ */

  @Post('education')
  @HttpCode(HttpStatus.CREATED)
  createEducation(@Body() dto: CreateEducationDto) {
    return this.experienceService.createEducation(dto);
  }

  @Patch('education/reorder')
  reorderEducation(@Body() dto: ReorderIdsDto) {
    return this.experienceService.reorderEducation(dto);
  }

  @Patch('education/:id')
  updateEducation(@Param('id') id: string, @Body() dto: UpdateEducationDto) {
    return this.experienceService.updateEducation(id, dto);
  }

  @Delete('education/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeEducation(@Param('id') id: string) {
    await this.experienceService.removeEducation(id);
  }

  /* ----------------------------- future goals ---------------------------- */

  @Patch('future-goals')
  updateFutureGoals(@Body() dto: UpdateFutureGoalsDto) {
    return this.experienceService.updateFutureGoals(dto);
  }
}