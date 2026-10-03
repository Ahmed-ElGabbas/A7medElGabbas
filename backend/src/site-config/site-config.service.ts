import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateSiteConfigDto,
  UpdateSocialLinksDto,
  UpsertSectionMetaDto,
} from './dto/site-config.dto';

const SINGLETON_ID = 1;

@Injectable()
export class SiteConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getSiteConfig() {
    return this.prisma.siteConfig.findUnique({
      where: { id: SINGLETON_ID },
    });
  }

  async updateSiteConfig(dto: UpdateSiteConfigDto) {
    const { roles, ...rest } = dto;

    return this.prisma.siteConfig.upsert({
      where: { id: SINGLETON_ID },
      create: {
        id: SINGLETON_ID,
        name: rest.name,
        title: rest.title,
        metaDescription: rest.metaDescription,
        firstName: rest.firstName ?? null,
        lastName: rest.lastName ?? null,
        url: rest.url ?? null,
        headline: rest.headline ?? null,
        photoUrl: rest.photoUrl ?? null,
        resumeUrl: rest.resumeUrl ?? null,
        location: rest.location ?? null,
        status: rest.status ?? null,
        statusSubtext: rest.statusSubtext ?? null,
        roles: roles ?? [],
      },
      update: {
        ...rest,
        ...(roles ? { roles } : {}),
      },
    });
  }

  async getSocialLinks() {
    return this.prisma.socialLinks.findUnique({
      where: { id: SINGLETON_ID },
    });
  }

  async updateSocialLinks(dto: UpdateSocialLinksDto) {
    return this.prisma.socialLinks.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, ...dto },
      update: dto,
    });
  }

  async getSectionMeta() {
    const rows = await this.prisma.sectionMeta.findMany({
      orderBy: [{ order: 'asc' }, { key: 'asc' }],
    });

    return { items: rows };
  }

  /**
   * `key` is the stable identifier for a section heading ("about", "skills").
   * The numeric `id` is deliberately not used for lookup: it is autoincrementing
   * and differs between a fresh seed and one that has had rows deleted.
   */
  async getSectionMetaItem(key: string) {
    const row = await this.prisma.sectionMeta.findUnique({
      where: { key },
    });

    if (!row) {
      throw new NotFoundException(`Section "${key}" not found`);
    }

    return row;
  }

  /**
   * Upsert rather than a bare update so a heading missing from an unseeded or
   * partially seeded database can be created from the admin without a migration.
   */
  async upsertSectionMeta(dto: UpsertSectionMetaDto) {
    const { id: key, ...rest } = dto;

    return this.prisma.sectionMeta.upsert({
      where: { key },
      create: { key, ...rest, order: rest.order ?? 0 },
      update: rest,
    });
  }
}
