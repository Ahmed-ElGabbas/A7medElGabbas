import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEducationDto,
  CreateExperienceDto,
  UpdateEducationDto,
  UpdateExperienceDto,
  UpdateFutureGoalsDto,
} from './dto/experience.dto';
import { ReorderIdsDto } from '../common/dto/reorder.dto';
import { applyReorder } from '../common/reorder';

const SINGLETON_ID = 1;

@Injectable()
export class ExperienceService {
  constructor(private readonly prisma: PrismaService) {}

  /** Timeline, education and the goals panel in one response. */
  async findAll() {
    const [experiences, education, futureGoals] = await Promise.all([
      this.prisma.experience.findMany({
        orderBy: [{ order: 'asc' }, { period: 'asc' }],
      }),
      this.prisma.education.findMany({
        orderBy: [{ order: 'asc' }, { period: 'asc' }],
      }),
      this.prisma.futureGoals.findUnique({ where: { id: SINGLETON_ID } }),
    ]);

    return { experiences, education, futureGoals };
  }

  /* ----------------------------- experiences ----------------------------- */

  async createExperience(dto: CreateExperienceDto) {
    const max = await this.prisma.experience.aggregate({ _max: { order: true } });
    return this.prisma.experience.create({
      data: { ...dto, technologies: dto.technologies ?? [], order: (max._max.order ?? -1) + 1 },
    });
  }

  async updateExperience(id: string, dto: UpdateExperienceDto) {
    await this.findExperience(id);
    return this.prisma.experience.update({ where: { id }, data: dto });
  }

  async removeExperience(id: string) {
    await this.findExperience(id);
    return this.prisma.experience.delete({ where: { id } });
  }

  async reorderExperiences(dto: ReorderIdsDto) {
    const existing = await this.prisma.experience.findMany({ select: { id: true } });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'experience',
      (id, order) => this.prisma.experience.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAll();
  }

  /* ------------------------------ education ------------------------------ */

  async createEducation(dto: CreateEducationDto) {
    const max = await this.prisma.education.aggregate({ _max: { order: true } });
    return this.prisma.education.create({
      data: {
        ...dto,
        description: dto.description ?? null,
        gpa: dto.gpa ?? null,
        courses: dto.courses ?? [],
        order: (max._max.order ?? -1) + 1,
      },
    });
  }

  async updateEducation(id: string, dto: UpdateEducationDto) {
    await this.findEducation(id);
    return this.prisma.education.update({ where: { id }, data: dto });
  }

  async removeEducation(id: string) {
    await this.findEducation(id);
    return this.prisma.education.delete({ where: { id } });
  }

  async reorderEducation(dto: ReorderIdsDto) {
    const existing = await this.prisma.education.findMany({ select: { id: true } });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'education',
      (id, order) => this.prisma.education.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAll();
  }

  /* ----------------------------- future goals ---------------------------- */

  async updateFutureGoals(dto: UpdateFutureGoalsDto) {
    return this.prisma.futureGoals.upsert({
      where: { id: SINGLETON_ID },
      create: {
        id: SINGLETON_ID,
        title: dto.title ?? '',
        description: dto.description ?? null,
        items: dto.items ?? [],
      },
      update: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.items !== undefined && { items: dto.items }),
      },
    });
  }

  /* ------------------------------- guards -------------------------------- */

  private async findExperience(id: string) {
    const row = await this.prisma.experience.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Experience "${id}" not found`);
    return row;
  }

  private async findEducation(id: string) {
    const row = await this.prisma.education.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Education "${id}" not found`);
    return row;
  }
}