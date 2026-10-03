import { Injectable, NotFoundException } from '@nestjs/common';
import { CertificateCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { applyReorder } from '../common/reorder';
import {
  CERTIFICATE_CATEGORY_LABELS,
  CreateCertificateDto,
  CreateCertificateStatDto,
  CreateIssuingOrganizationDto,
  UpdateCertificateDto,
  UpdateCertificateStatDto,
  UpdateIssuingOrganizationDto,
} from './dto/certificate.dto';
import { ReorderIdsDto } from '../common/dto/reorder.dto';

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

  async reorder(dto: ReorderIdsDto) {
    const existing = await this.prisma.certificate.findMany({ select: { id: true } });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'certificate',
      (id, order) => this.prisma.certificate.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAll();
  }

  /* --------------------------------------------------------------------- */
  /* certificate_stats                                                      */
  /* --------------------------------------------------------------------- */

  /**
   * The metric plaque under the certificates grid. Same list-management shape
   * as certificates themselves, so it lives in this module rather than a new one.
   */
  async findAllStats() {
    const items = await this.prisma.certificateStat.findMany({
      orderBy: [{ order: 'asc' }, { label: 'asc' }],
    });
    return { items };
  }

  async createStat(dto: CreateCertificateStatDto) {
    const max = await this.prisma.certificateStat.aggregate({ _max: { order: true } });
    return this.prisma.certificateStat.create({
      data: { ...dto, order: (max._max.order ?? -1) + 1 },
    });
  }

  async updateStat(id: string, dto: UpdateCertificateStatDto) {
    const existing = await this.prisma.certificateStat.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Certificate stat "${id}" not found`);
    return this.prisma.certificateStat.update({ where: { id }, data: dto });
  }

  async removeStat(id: string) {
    const existing = await this.prisma.certificateStat.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Certificate stat "${id}" not found`);
    return this.prisma.certificateStat.delete({ where: { id } });
  }

  async reorderStats(dto: ReorderIdsDto) {
    const existing = await this.prisma.certificateStat.findMany({ select: { id: true } });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'certificate stat',
      (id, order) => this.prisma.certificateStat.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAllStats();
  }

  /* --------------------------------------------------------------------- */
  /* issuing_organizations                                                  */
  /* --------------------------------------------------------------------- */

  async findAllIssuingOrganizations() {
    const items = await this.prisma.issuingOrganization.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return { items };
  }

  async createIssuingOrganization(dto: CreateIssuingOrganizationDto) {
    const max = await this.prisma.issuingOrganization.aggregate({ _max: { order: true } });
    return this.prisma.issuingOrganization.create({
      data: { ...dto, order: (max._max.order ?? -1) + 1 },
    });
  }

  async updateIssuingOrganization(id: string, dto: UpdateIssuingOrganizationDto) {
    const existing = await this.prisma.issuingOrganization.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Issuing organization "${id}" not found`);
    return this.prisma.issuingOrganization.update({ where: { id }, data: dto });
  }

  async removeIssuingOrganization(id: string) {
    const existing = await this.prisma.issuingOrganization.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Issuing organization "${id}" not found`);
    return this.prisma.issuingOrganization.delete({ where: { id } });
  }

  async reorderIssuingOrganizations(dto: ReorderIdsDto) {
    const existing = await this.prisma.issuingOrganization.findMany({ select: { id: true } });

    await applyReorder(
      this.prisma,
      dto.ids,
      existing.map((row) => row.id),
      'issuing organization',
      (id, order) => this.prisma.issuingOrganization.update({ where: { id }, data: { order } }),
      dto.startOrder ?? 0,
    );

    return this.findAllIssuingOrganizations();
  }
}
