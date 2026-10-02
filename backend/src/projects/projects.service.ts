import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, ReorderProjectsDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.project.findMany({
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
    });
    return { items };
  }

  /**
   * Distinct categories currently in use, for the admin to offer as
   * suggestions. Project.category is free text, so this grows on its own
   * instead of being a hardcoded list that needs a migration to extend.
   */
  async categories() {
    const rows = await this.prisma.project.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return { categories: rows.map((row) => row.category) };
  }

  async findOne(id: string) {
    const item = await this.prisma.project.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Project "${id}" not found`);
    return item;
  }

  async create(dto: CreateProjectDto) {
    const max = await this.prisma.project.aggregate({ _max: { order: true } });
    return this.prisma.project.create({
      data: { ...dto, order: (max._max.order ?? -1) + 1 },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }

  async reorder(dto: ReorderProjectsDto) {
    const startOrder = dto.startOrder ?? 0;

    const existing = await this.prisma.project.findMany({ select: { id: true } });
    const existingIds = new Set(existing.map((row) => row.id));

    const unknown = dto.ids.filter((id) => !existingIds.has(id));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown project ids: ${unknown.join(', ')}`);
    }

    if (new Set(dto.ids).size !== dto.ids.length) {
      throw new BadRequestException('ids must not contain duplicates');
    }

    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.project.update({
          where: { id },
          data: { order: startOrder + index },
        }),
      ),
    );

    return this.findAll();
  }
}
