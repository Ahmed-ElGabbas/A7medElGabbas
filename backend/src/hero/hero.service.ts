import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStatDto, UpdateStatDto } from './dto/stat.dto';
import { ReorderIdsDto } from '../common/dto/reorder.dto';
import { applyReorder } from '../common/reorder';

/**
 * Hero stats — the small "2+ / Years Experience" strip and the values reused by
 * the About quick badges.
 */
@Injectable()
export class HeroService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.stat.findMany({
      orderBy: [{ order: 'asc' }, { label: 'asc' }],
    });
    return { items };
  }

  async findOne(id: string) {
    const item = await this.prisma.stat.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Stat "${id}" not found`);
    return item;
  }

  /**
   * Appends to the end of the strip rather than always taking order 0, so adding
   * a stat in the admin appends instead of silently displacing the current first
   * entry until the user reorders it.
   */
  async create(dto: CreateStatDto) {
    const max = await this.prisma.stat.aggregate({ _max: { order: true } });
    return this.prisma.stat.create({
      data: { ...dto, order: (max._max.order ?? -1) + 1 },
    });
  }

  async update(id: string, dto: UpdateStatDto) {
    await this.findOne(id);
    return this.prisma.stat.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.stat.delete({ where: { id } });
  }

  async reorder(dto: ReorderIdsDto) {
    const existing = await this.prisma.stat.findMany({ select: { id: true } });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'stat',
      (id, order) => this.prisma.stat.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAll();
  }
}