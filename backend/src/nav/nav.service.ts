import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNavItemDto, UpdateNavItemDto } from './dto/nav.dto';
import { ReorderIdsDto } from '../common/dto/reorder.dto';
import { applyReorder } from '../common/reorder';

@Injectable()
export class NavService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.navItem.findMany({
      orderBy: [{ order: 'asc' }, { label: 'asc' }],
    });
    return { items };
  }

  async findOne(id: string) {
    const item = await this.prisma.navItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Nav item "${id}" not found`);
    return item;
  }

  async create(dto: CreateNavItemDto) {
    const max = await this.prisma.navItem.aggregate({ _max: { order: true } });
    return this.prisma.navItem.create({
      data: { ...dto, order: (max._max.order ?? -1) + 1 },
    });
  }

  async update(id: string, dto: UpdateNavItemDto) {
    await this.findOne(id);
    return this.prisma.navItem.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.navItem.delete({ where: { id } });
  }

  async reorder(dto: ReorderIdsDto) {
    const existing = await this.prisma.navItem.findMany({
      select: { id: true },
    });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'nav item',
      (id, order) => this.prisma.navItem.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAll();
  }
}
