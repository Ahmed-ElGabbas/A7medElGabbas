import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import { DashboardController } from '../dashboard/dashboard.controller';
import { DashboardModule } from '../dashboard/dashboard.module';
import { IS_PUBLIC_KEY } from '../common/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Route-level checks for the admin dashboard: the exact paths and payload shapes
 * the dashboard client calls, plus the two privacy guarantees that are easy to
 * regress silently — the export must not carry credentials or visitor messages,
 * and none of these routes may ever become `@Public()`.
 */
const OLDER = new Date('2026-09-01T00:00:00.000Z');
const NEWER = new Date('2026-10-01T00:00:00.000Z');

describe('dashboard routes', () => {
  let app: INestApplication;

  const prisma = {
    project: {
      count: jest.fn().mockResolvedValue(7),
      findMany: jest.fn().mockResolvedValue([]),
    },
    certificate: {
      count: jest.fn().mockResolvedValue(5),
      findMany: jest.fn().mockResolvedValue([]),
    },
    skill: { count: jest.fn().mockResolvedValue(30), findMany: jest.fn().mockResolvedValue([]) },
    skillCategory: { count: jest.fn().mockResolvedValue(4), findMany: jest.fn().mockResolvedValue([]) },
    skillSpotlight: { findMany: jest.fn().mockResolvedValue([]) },
    experience: { count: jest.fn().mockResolvedValue(3), findMany: jest.fn().mockResolvedValue([]) },
    education: { count: jest.fn().mockResolvedValue(2), findMany: jest.fn().mockResolvedValue([]) },
    navItem: { count: jest.fn().mockResolvedValue(6), findMany: jest.fn().mockResolvedValue([]) },
    stat: { count: jest.fn().mockResolvedValue(4), findMany: jest.fn().mockResolvedValue([]) },
    quickFact: { count: jest.fn().mockResolvedValue(8), findMany: jest.fn().mockResolvedValue([]) },
    tickerSkill: { count: jest.fn().mockResolvedValue(12), findMany: jest.fn().mockResolvedValue([]) },
    certificateStat: { count: jest.fn().mockResolvedValue(3), findMany: jest.fn().mockResolvedValue([]) },
    issuingOrganization: {
      count: jest.fn().mockResolvedValue(9),
      findMany: jest.fn().mockResolvedValue([]),
    },
    mediaAsset: { count: jest.fn().mockResolvedValue(11), findMany: jest.fn().mockResolvedValue([]) },
    contactSubmission: {
      count: jest.fn().mockResolvedValue(4),
      findMany: jest.fn().mockResolvedValue([]),
    },
    siteConfig: { findMany: jest.fn().mockResolvedValue([]) },
    socialLinks: { findMany: jest.fn().mockResolvedValue([]) },
    sectionMeta: { findMany: jest.fn().mockResolvedValue([]) },
    aboutContent: { findMany: jest.fn().mockResolvedValue([]) },
    philosophyQuote: { findMany: jest.fn().mockResolvedValue([]) },
    futureGoals: { findMany: jest.fn().mockResolvedValue([]) },
    $transaction: jest.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, DashboardModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    /// clearAllMocks only resets calls, not the values set by mockResolvedValue,
    /// so every mock a test overrides is put back to its default here.
    prisma.project.findMany.mockResolvedValue([]);
    prisma.certificate.findMany.mockResolvedValue([]);
    prisma.skill.findMany.mockResolvedValue([]);
    prisma.navItem.findMany.mockResolvedValue([]);
    prisma.siteConfig.findMany.mockResolvedValue([]);
    prisma.contactSubmission.findMany.mockResolvedValue([]);
  });

  /* -------------------------------- overview ------------------------------ */

  describe('GET /dashboard/overview', () => {
    it('returns counters, inbox totals and an activity feed', async () => {
      const res = await request(app.getHttpServer()).get('/dashboard/overview').expect(200);

      expect(res.body.counts).toMatchObject({
        projects: 7,
        certificates: 5,
        skills: 30,
        experiences: 3,
        mediaAssets: 11,
      });
      expect(res.body.contact).toEqual({ total: 4, unread: 4 });
      expect(Array.isArray(res.body.activity)).toBe(true);
      expect(typeof res.body.generatedAt).toBe('string');
    });

    it('orders activity newest first across tables', async () => {
      prisma.project.findMany.mockResolvedValue([{ id: 'p1', title: 'Older project', updatedAt: OLDER }]);
      prisma.skill.findMany.mockResolvedValue([{ id: 's1', name: 'Newer skill', updatedAt: NEWER }]);

      const res = await request(app.getHttpServer()).get('/dashboard/overview').expect(200);

      expect(res.body.activity[0]).toMatchObject({
        kind: 'skill',
        id: 'skill:s1',
        title: 'Newer skill',
        section: 'Skills',
        href: '/admin/skills?id=s1',
      });
      expect(res.body.activity[1].id).toBe('project:p1');
    });

    it('caps the feed at the requested limit', async () => {
      const rows = Array.from({ length: 20 }, (_, index) => ({
        id: `p${index}`,
        title: `Project ${index}`,
        updatedAt: new Date(2026, 0, 1 + index),
      }));
      prisma.project.findMany.mockResolvedValue(rows);

      const res = await request(app.getHttpServer())
        .get('/dashboard/overview?limit=3')
        .expect(200);

      expect(res.body.activity).toHaveLength(3);
    });

    it('merges a second query parameter rather than appending a second "?"', async () => {
      prisma.navItem.findMany.mockResolvedValue([{ id: 'n1', label: 'Work', updatedAt: NEWER }]);

      const res = await request(app.getHttpServer()).get('/dashboard/overview').expect(200);

      expect(res.body.activity[0].href).toBe('/admin/site-config?tab=nav&id=n1');
    });

    it('links singletons to the bare section, with no meaningless id', async () => {
      prisma.siteConfig.findMany.mockResolvedValue([{ id: 1, name: 'Portfolio', updatedAt: NEWER }]);

      const res = await request(app.getHttpServer()).get('/dashboard/overview').expect(200);

      expect(res.body.activity[0]).toMatchObject({
        kind: 'site-config',
        title: 'Portfolio',
        href: '/admin/site-config',
      });
    });

    it('falls back to the default limit when the value is not a number', async () => {
      /// The global ValidationPipe coerces "all" to NaN, and Nest's
      /// DefaultValuePipe substitutes its default for NaN by design — so the
      /// feed is served rather than 400ing on a typo.
      prisma.project.findMany.mockResolvedValue([
        { id: 'p1', title: 'One', updatedAt: NEWER },
      ]);

      const res = await request(app.getHttpServer()).get('/dashboard/overview?limit=all').expect(200);

      expect(res.body.activity).toHaveLength(1);
    });

    it('rejects a fractional limit', async () => {
      await request(app.getHttpServer()).get('/dashboard/overview?limit=1.5').expect(400);
    });

    it('clamps an out-of-range limit instead of trusting it', async () => {
      prisma.project.findMany.mockResolvedValue(
        Array.from({ length: 60 }, (_, index) => ({
          id: `p${index}`,
          title: `Project ${index}`,
          updatedAt: new Date(2026, 0, 1 + index),
        })),
      );

      const res = await request(app.getHttpServer())
        .get('/dashboard/overview?limit=9999')
        .expect(200);

      /// Upper bound is 50, so a caller cannot ask for the whole table.
      expect(res.body.activity).toHaveLength(50);
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });
  });

  /* --------------------------------- search ------------------------------- */

  describe('GET /dashboard/search', () => {
    it('deep-links projects, certificates and messages to the right row', async () => {
      prisma.project.findMany.mockResolvedValue([
        { id: 'p1', title: 'Portfolio CMS', category: 'Web' },
      ]);
      prisma.certificate.findMany.mockResolvedValue([
        { id: 'c1', title: 'Flutter cert', issuer: 'Google' },
      ]);
      prisma.contactSubmission.findMany.mockResolvedValue([
        { id: 'm1', name: 'Sara', subject: 'Freelance work', read: false },
      ]);

      const res = await request(app.getHttpServer())
        .get('/dashboard/search?q=flutter')
        .expect(200);

      expect(res.body.results).toEqual([
        {
          kind: 'project',
          id: 'p1',
          title: 'Portfolio CMS',
          subtitle: 'Web',
          href: '/admin/projects?id=p1',
        },
        {
          kind: 'certificate',
          id: 'c1',
          title: 'Flutter cert',
          subtitle: 'Google',
          href: '/admin/certificates?id=c1',
        },
        {
          kind: 'submission',
          id: 'm1',
          title: 'Sara',
          subtitle: 'Freelance work',
          href: '/admin/contact?submission=m1',
        },
      ]);
    });

    it('falls back to the read state when a message has no subject', async () => {
      prisma.contactSubmission.findMany.mockResolvedValue([
        { id: 'm1', name: 'Sara', subject: '   ', read: true },
      ]);

      const res = await request(app.getHttpServer()).get('/dashboard/search?q=sara').expect(200);

      expect(res.body.results[0].subtitle).toBe('No subject · read');
    });

    it('trims the term before matching', async () => {
      prisma.project.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer()).get('/dashboard/search?q=%20%20react%20').expect(200);

      expect(res.body.query).toBe('react');
      expect(prisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { title: { contains: 'react', mode: 'insensitive' } } }),
      );
    });

    it('rejects a blank term', async () => {
      await request(app.getHttpServer()).get('/dashboard/search?q=%20%20').expect(400);
    });
  });

  /* --------------------------------- export ------------------------------- */

  describe('GET /dashboard/export', () => {
    it('is served as a downloadable JSON attachment', async () => {
      const res = await request(app.getHttpServer()).get('/dashboard/export').expect(200);

      expect(res.headers['content-type']).toContain('application/json');
      expect(res.headers['content-disposition']).toContain('attachment');
    });

    it('includes every content table', async () => {
      const res = await request(app.getHttpServer()).get('/dashboard/export').expect(200);

      expect(Object.keys(res.body.data).sort()).toEqual(
        [
          'aboutContent',
          'certificateStats',
          'certificates',
          'education',
          'experiences',
          'futureGoals',
          'issuingOrganizations',
          'mediaAssets',
          'navItems',
          'philosophyQuote',
          'projects',
          'quickFacts',
          'sectionMeta',
          'siteConfig',
          'skillCategories',
          'skillSpotlights',
          'skills',
          'socialLinks',
          'stats',
          'tickerSkills',
        ].sort(),
      );
    });

    it('never carries admin credentials or visitor submissions', async () => {
      const res = await request(app.getHttpServer()).get('/dashboard/export').expect(200);

      expect(res.body.data).not.toHaveProperty('adminUsers');
      expect(res.body.data).not.toHaveProperty('admin_users');
      expect(res.body.data).not.toHaveProperty('contactSubmissions');
      expect(res.body.data).not.toHaveProperty('contact_submissions');
      /// Neither table may even be queried on the way to building the payload.
      expect(prisma.contactSubmission.findMany).not.toHaveBeenCalled();
    });

    it('stamps the snapshot so the filename can match its contents', async () => {
      const res = await request(app.getHttpServer()).get('/dashboard/export').expect(200);

      expect(res.body.version).toBe(1);
      expect(Number.isNaN(Date.parse(res.body.generatedAt))).toBe(false);
    });
  });

  /* ------------------------------ auth posture --------------------------- */

  it('leaves every dashboard route authenticated', () => {
    /// No handler on the dashboard controller may carry @Public(): the export
    /// alone is a full content dump, and search leaks submission metadata.
    const prototype = DashboardController.prototype as unknown as Record<string, unknown>;
    const handlers = Object.getOwnPropertyNames(prototype).filter(
      (name) => name !== 'constructor',
    );

    expect(handlers.length).toBeGreaterThan(0);

    for (const name of handlers) {
      const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, prototype[name] as object);
      expect({ handler: name, isPublic }).toEqual({ handler: name, isPublic: undefined });
    }
  });
});