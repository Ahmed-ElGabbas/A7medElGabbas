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

  async getSectionMetaItem(id: string) {
    const row = await this.prisma.sectionMeta.findUnique({
      where: { key: id },
    });

    if (!row) {
      throw new NotFoundException(`Section "${id}" not found`);
    }

    return row;
  }

  async upsertSectionMeta(dto: UpsertSectionMetaDto) {
    const { id, ...rest } = dto;

    return this.prisma.sectionMeta.upsert({
      where: { key: id },
      create: { key: id, ...rest, order: rest.order ?? 0 },
      update: rest,
    });
  }
}
