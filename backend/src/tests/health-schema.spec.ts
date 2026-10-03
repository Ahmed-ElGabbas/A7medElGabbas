import { ServiceUnavailableException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { HealthController } from '../health.controller';

const ALL_TABLES = [
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
];

function makeController(options?: {
  tables?: string[];
  unfinished?: number;
  connectFails?: boolean;
}) {
  const tables = options?.tables ?? ALL_TABLES;
  const prisma = {
    $queryRaw: jest.fn(async (strings: TemplateStringsArray) => {
      const sql = strings.join('?').toLowerCase();

      if (sql.includes('select 1')) {
        if (options?.connectFails) {
          throw new Error('connection refused');
        }
        return [{ '?1': 1 }];
      }

      if (sql.includes('information_schema.tables')) {
        return tables.map((table_name) => ({ table_name }));
      }

      if (sql.includes('_prisma_migrations')) {
        return [{ count: BigInt(options?.unfinished ?? 0) }];
      }

      return [];
    }),
  };

  const controller = new HealthController(prisma as unknown as PrismaService);
  return { controller, prisma };
}

describe('HealthController', () => {
  it('reports ok only when every mapped table exists', async () => {
    const { controller } = makeController();

    await expect(controller.health()).resolves.toEqual({
      status: 'ok',
      database: 'connected',
      schema: 'current',
      tables: 22,
    });
  });

  it('fails when the database has no tables at all', async () => {
    const { controller } = makeController({ tables: [] });

    await expect(controller.health()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('names the missing tables so the cause is diagnosable', async () => {
    const { controller } = makeController({
      tables: ALL_TABLES.filter((t) => t !== 'admin_users'),
    });

    await expect(controller.health()).rejects.toMatchObject({
      response: expect.objectContaining({
        schema: 'incomplete',
        missingTables: ['admin_users'],
      }),
    });
  });

  it('detects a half-applied migration set', async () => {
    const { controller } = makeController({ tables: ALL_TABLES, unfinished: 1 });

    await expect(controller.health()).rejects.toMatchObject({
      response: expect.objectContaining({
        schema: 'incomplete',
        unfinishedMigrations: 1,
      }),
    });
  });

  it('propagates a genuine connection failure', async () => {
    const { controller } = makeController({ connectFails: true });

    await expect(controller.health()).rejects.toThrow('connection refused');
  });
});