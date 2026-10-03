import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateQuickFactDto,
  UpdateAboutContentDto,
  UpdateQuickFactDto,
} from './dto/about.dto';
import { ReorderIdsDto } from '../common/dto/reorder.dto';
import { applyReorder } from '../common/reorder';

/** AboutContent / PhilosophyQuote / FutureGoals are single-row tables keyed by 1. */
const SINGLETON_ID = 1;

@Injectable()
export class AboutService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the About narrative together with its quick facts in one response,
   * because the frontend renders them as a single block and a separate request
   * per section would only add a failure mode.
   */
  async findAbout() {
    const content = await this.prisma.aboutContent.findUnique({
      where: { id: SINGLETON_ID },
      include: { quickFacts: { orderBy: [{ order: 'asc' }, { label: 'asc' }] } },
    });
    return content;
  }

  /**
   * Upsert rather than update: an empty database has no row yet, and the admin
   * page should be able to save content into a fresh install without a manual
   * seed first.
   */
  async updateAbout(dto: UpdateAboutContentDto) {
    return this.prisma.aboutContent.upsert({
      where: { id: SINGLETON_ID },
      create: {
        id: SINGLETON_ID,
        sectionSubtitle: dto.sectionSubtitle ?? null,
        narrativeTitle: dto.narrativeTitle ?? null,
        paragraphs: dto.paragraphs ?? [],
        highlights: dto.highlights ?? [],
        academicFocusTitle: dto.academicFocusTitle ?? null,
        academicFocusDescription: dto.academicFocusDescription ?? null,
      },
      update: {
        ...(dto.sectionSubtitle !== undefined && { sectionSubtitle: dto.sectionSubtitle }),
        ...(dto.narrativeTitle !== undefined && { narrativeTitle: dto.narrativeTitle }),
        ...(dto.paragraphs !== undefined && { paragraphs: dto.paragraphs }),
        ...(dto.highlights !== undefined && { highlights: dto.highlights }),
        ...(dto.academicFocusTitle !== undefined && {
          academicFocusTitle: dto.academicFocusTitle,
        }),
        ...(dto.academicFocusDescription !== undefined && {
          academicFocusDescription: dto.academicFocusDescription,
        }),
      },
    });
  }

  async findQuickFacts() {
    const items = await this.prisma.quickFact.findMany({
      orderBy: [{ order: 'asc' }, { label: 'asc' }],
    });
    return { items };
  }

  async createQuickFact(dto: CreateQuickFactDto) {
    const max = await this.prisma.quickFact.aggregate({ _max: { order: true } });
    return this.prisma.quickFact.create({
      data: {
        ...dto,
        detail: dto.detail ?? null,
        icon: dto.icon ?? null,
        aboutId: SINGLETON_ID,
        order: (max._max.order ?? -1) + 1,
      },
    });
  }

  async updateQuickFact(id: string, dto: UpdateQuickFactDto) {
    await this.findQuickFact(id);
    return this.prisma.quickFact.update({ where: { id }, data: dto });
  }

  async removeQuickFact(id: string) {
    await this.findQuickFact(id);
    return this.prisma.quickFact.delete({ where: { id } });
  }

  async reorderQuickFacts(dto: ReorderIdsDto) {
    const existing = await this.prisma.quickFact.findMany({ select: { id: true } });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'quick fact',
      (id, order) => this.prisma.quickFact.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findQuickFacts();
  }

  private async findQuickFact(id: string) {
    const row = await this.prisma.quickFact.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Quick fact "${id}" not found`);
    return row;
  }
}