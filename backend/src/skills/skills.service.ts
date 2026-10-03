import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
import { ReorderIdsDto } from '../common/dto/reorder.dto';
import { applyReorder } from '../common/reorder';

const SINGLETON_ID = 1;

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Everything the Skills section renders in a single response: categories with
   * their nested skills and spotlight, the philosophy quote, and the ticker strip.
   *
   * Nesting the children avoids the N+1 that separate per-category requests would
   * cause on the public page.
   */
  async findAll() {
    const [categories, philosophyQuote, tickerSkills] = await Promise.all([
      this.prisma.skillCategory.findMany({
        orderBy: [{ order: 'asc' }, { title: 'asc' }],
        include: {
          skills: { orderBy: [{ order: 'asc' }, { name: 'asc' }] },
          spotlight: true,
        },
      }),
      this.prisma.philosophyQuote.findUnique({ where: { id: SINGLETON_ID } }),
      this.prisma.tickerSkill.findMany({
        orderBy: [{ order: 'asc' }, { label: 'asc' }],
      }),
    ]);

    return { categories, philosophyQuote, tickerSkills };
  }

  /* ----------------------------- categories ----------------------------- */

  async createCategory(dto: CreateSkillCategoryDto) {
    const max = await this.prisma.skillCategory.aggregate({ _max: { order: true } });
    return this.prisma.skillCategory.create({
      data: { ...dto, icon: dto.icon ?? null, order: (max._max.order ?? -1) + 1 },
    });
  }

  async updateCategory(id: string, dto: UpdateSkillCategoryDto) {
    await this.findCategory(id);
    return this.prisma.skillCategory.update({ where: { id }, data: dto });
  }

  async removeCategory(id: string) {
    await this.findCategory(id);
    // Skills and the spotlight cascade in the schema; deleting the category is
    // enough.
    return this.prisma.skillCategory.delete({ where: { id } });
  }

  async reorderCategories(dto: ReorderIdsDto) {
    const existing = await this.prisma.skillCategory.findMany({ select: { id: true } });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'skill category',
      (id, order) => this.prisma.skillCategory.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAll();
  }

  /* -------------------------------- skills ------------------------------- */

  async createSkill(categoryId: string, dto: CreateSkillDto) {
    await this.findCategory(categoryId);
    const max = await this.prisma.skill.aggregate({
      where: { categoryId },
      _max: { order: true },
    });
    return this.prisma.skill.create({
      data: {
        ...dto,
        categoryId,
        order: (max._max.order ?? -1) + 1,
      },
    });
  }

  async updateSkill(categoryId: string, id: string, dto: UpdateSkillDto) {
    await this.findSkill(categoryId, id);
    return this.prisma.skill.update({ where: { id }, data: dto });
  }

  async removeSkill(categoryId: string, id: string) {
    await this.findSkill(categoryId, id);
    return this.prisma.skill.delete({ where: { id } });
  }

  /**
   * Reordering is scoped to one category: `ids` is validated against that
   * category's skills only, so a client cannot reorder across categories by
   * passing ids from elsewhere.
   */
  async reorderSkills(categoryId: string, dto: ReorderIdsDto) {
    await this.findCategory(categoryId);
    const existing = await this.prisma.skill.findMany({
      where: { categoryId },
      select: { id: true },
    });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'skill',
      (id, order) => this.prisma.skill.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAll();
  }

  /* ------------------------------ spotlights ----------------------------- */

  async updateSpotlight(categoryId: string, dto: UpdateSkillSpotlightDto) {
    await this.findCategory(categoryId);
    return this.prisma.skillSpotlight.upsert({
      where: { categoryId },
      create: {
        categoryId,
        summary: dto.summary ?? null,
        patterns: dto.patterns ?? [],
        primaryProject: dto.primaryProject ?? null,
      },
      update: {
        ...(dto.summary !== undefined && { summary: dto.summary }),
        ...(dto.patterns !== undefined && { patterns: dto.patterns }),
        ...(dto.primaryProject !== undefined && {
          primaryProject: dto.primaryProject,
        }),
      },
    });
  }

  /* ---------------------------- philosophy quote -------------------------- */

  async updatePhilosophyQuote(dto: UpdatePhilosophyQuoteDto) {
    return this.prisma.philosophyQuote.upsert({
      where: { id: SINGLETON_ID },
      create: {
        id: SINGLETON_ID,
        quote: dto.quote ?? '',
        author: dto.author ?? null,
      },
      update: {
        ...(dto.quote !== undefined && { quote: dto.quote }),
        ...(dto.author !== undefined && { author: dto.author }),
      },
    });
  }

  /* ----------------------------- ticker skills ---------------------------- */

  async createTickerSkill(dto: CreateTickerSkillDto) {
    const max = await this.prisma.tickerSkill.aggregate({ _max: { order: true } });
    return this.prisma.tickerSkill.create({
      data: { ...dto, order: (max._max.order ?? -1) + 1 },
    });
  }

  async updateTickerSkill(id: string, dto: UpdateTickerSkillDto) {
    await this.findTickerSkill(id);
    return this.prisma.tickerSkill.update({ where: { id }, data: dto });
  }

  async removeTickerSkill(id: string) {
    await this.findTickerSkill(id);
    return this.prisma.tickerSkill.delete({ where: { id } });
  }

  async reorderTickerSkills(dto: ReorderIdsDto) {
    const existing = await this.prisma.tickerSkill.findMany({ select: { id: true } });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'ticker skill',
      (id, order) => this.prisma.tickerSkill.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAll();
  }

  /* ------------------------------- guards -------------------------------- */

  private async findCategory(id: string) {
    const row = await this.prisma.skillCategory.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Skill category "${id}" not found`);
    return row;
  }

  private async findSkill(categoryId: string, id: string) {
    const row = await this.prisma.skill.findUnique({ where: { id } });
    // Guards against editing a skill through the wrong parent category.
    if (!row || row.categoryId !== categoryId) {
      throw new NotFoundException(`Skill "${id}" not found in category "${categoryId}"`);
    }
    return row;
  }

  private async findTickerSkill(id: string) {
    const row = await this.prisma.tickerSkill.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Ticker skill "${id}" not found`);
    return row;
  }
}