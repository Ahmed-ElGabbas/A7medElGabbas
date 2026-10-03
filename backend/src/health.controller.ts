import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Public } from './common/public.decorator';
import { PrismaService } from './prisma/prisma.service';

const REQUIRED_TABLES = [
  'about_content',
  'admin_users',
  'certificate_stats',
  'certificates',
  'contact_submissions',
  'education',
  'experiences',
  'future_goals',
  'issuing_organizations',
  'media_assets',
  'nav_items',
  'philosophy_quote',
  'projects',
  'quick_facts',
  'section_meta',
  'site_config',
  'skill_categories',
  'skill_spotlights',
  'skills',
  'social_links',
  'stats',
  'ticker_skills',
] as const;

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;

    const present = await this.prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = current_schema()
    `;

    const found = new Set(present.map((row) => row.table_name));
    const missing = REQUIRED_TABLES.filter((table) => !found.has(table));

    if (missing.length > 0) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'connected',
        schema: 'incomplete',
        missingTables: missing,
      });
    }

    const failed = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT count(*) AS count
      FROM _prisma_migrations
      WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL
    `;

    if (Number(failed[0]?.count ?? 0) > 0) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'connected',
        schema: 'incomplete',
        unfinishedMigrations: Number(failed[0].count),
      });
    }

    return {
      status: 'ok',
      database: 'connected',
      schema: 'current',
      tables: REQUIRED_TABLES.length,
    };
  }
}