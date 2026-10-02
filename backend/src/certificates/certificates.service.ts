import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CertificateCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CERTIFICATE_CATEGORY_LABELS,
  CreateCertificateDto,
  ReorderCertificatesDto,
  UpdateCertificateDto,
} from './dto/certificate.dto';

type CertificateRow = {
  category: CertificateCategory;
} & Record<string, unknown>;

/**
 * Adds the human-readable label next to the enum key so the frontend can render
 * the existing display strings without duplicating the mapping table.
 */
function present<T extends CertificateRow>(row: T): T & { categoryLabel: string } {
  return { ...row, categoryLabel: CERTIFICATE_CATEGORY_LABELS[row.category] };
}

@Injectable()
export class CertificatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.certificate.findMany({
      orderBy: [{ order: 'asc' }, { title: 'asc' }],
    });
    return { items: items.map(present) };
  }

  /**
   * The enum plus its labels, so the admin can build the category filter tabs
   * from the server instead of hardcoding them.
   */
  categories() {
    return {
      categories: Object.entries(CERTIFICATE_CATEGORY_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.certificate.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Certificate "${id}" not found`);
    return present(item);
  }

  async create(dto: CreateCertificateDto) {
    const max = await this.prisma.certificate.aggregate({ _max: { order: true } });
    const created = await this.prisma.certificate.create({
      data: { ...dto, order: (max._max.order ?? -1) + 1 },
    });
    return present(created);
  }

  async update(id: string, dto: UpdateCertificateDto) {
    await this.findOne(id);
    const updated = await this.prisma.certificate.update({ where: { id }, data: dto });
    return present(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.certificate.delete({ where: { id } });
  }

  async reorder(dto: ReorderCertificatesDto) {
    const startOrder = dto.startOrder ?? 0;

    const existing = await this.prisma.certificate.findMany({ select: { id: true } });
    const existingIds = new Set(existing.map((row) => row.id));

    const unknown = dto.ids.filter((id) => !existingIds.has(id));
    if (unknown.length > 0) {
      throw new BadRequestException(`Unknown certificate ids: ${unknown.join(', ')}`);
    }

    if (new Set(dto.ids).size !== dto.ids.length) {
      throw new BadRequestException('ids must not contain duplicates');
    }

    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.certificate.update({
          where: { id },
          data: { order: startOrder + index },
        }),
      ),
    );

    return this.findAll();
  }
}
