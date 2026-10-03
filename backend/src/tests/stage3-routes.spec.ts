import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import { HeroModule } from '../hero/hero.module';
import { AboutModule } from '../about/about.module';
import { SkillsModule } from '../skills/skills.module';
import { ExperienceModule } from '../experience/experience.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Route-level checks for the Stage 3 modules: the exact paths and payload
 * shapes the frontend and admin client will call. Service behaviour is covered
 * by the per-module unit specs; this file exists to catch route typos, a
 * misplaced @Public(), and DTO validation that would reject the admin's real
 * payloads — the failures that only surface as a 404 or 400 at runtime.
 */
const stat = { id: 's1', value: '2+', label: 'Years Experience', order: 0 };
const quickFact = {
  id: 'q1',
  label: 'Core Stack',
  value: 'Flutter, React, .NET',
  detail: 'TypeScript & Dart',
  icon: 'terminal',
  order: 0,
};

describe('Stage 3 content routes', () => {
  let app: INestApplication;
  const prisma = {
    stat: {
      findMany: jest.fn().mockResolvedValue([stat]),
      findUnique: jest.fn().mockResolvedValue(stat),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn().mockResolvedValue(stat),
      update: jest.fn().mockResolvedValue(stat),
      delete: jest.fn().mockResolvedValue(stat),
    },
    aboutContent: {
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        sectionSubtitle: 'Sub',
        narrativeTitle: 'Title',
        paragraphs: ['p1'],
        highlights: ['h1'],
        academicFocusTitle: 'Focus',
        academicFocusDescription: 'Desc',
        quickFacts: [quickFact],
      }),
      upsert: jest.fn().mockResolvedValue({ id: 1 }),
    },
    quickFact: {
      findMany: jest.fn().mockResolvedValue([quickFact]),
      findUnique: jest.fn().mockResolvedValue(quickFact),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn().mockResolvedValue(quickFact),
      update: jest.fn().mockResolvedValue(quickFact),
      delete: jest.fn().mockResolvedValue(quickFact),
    },
    skillCategory: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 'cat1', title: 'Lang', icon: 'code' }),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn().mockResolvedValue({ id: 'cat1' }),
      update: jest.fn().mockResolvedValue({ id: 'cat1' }),
      delete: jest.fn().mockResolvedValue({ id: 'cat1' }),
    },
    skill: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 'sk1', categoryId: 'cat1' }),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn().mockResolvedValue({ id: 'sk1' }),
      update: jest.fn().mockResolvedValue({ id: 'sk1' }),
      delete: jest.fn().mockResolvedValue({ id: 'sk1' }),
    },
    skillSpotlight: { upsert: jest.fn().mockResolvedValue({ id: 'sp1' }) },
    philosophyQuote: {
      findUnique: jest.fn().mockResolvedValue({ id: 1, quote: 'Q', author: 'A' }),
      upsert: jest.fn().mockResolvedValue({ id: 1 }),
    },
    tickerSkill: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 't1', label: 'React' }),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn().mockResolvedValue({ id: 't1' }),
      update: jest.fn().mockResolvedValue({ id: 't1' }),
      delete: jest.fn().mockResolvedValue({ id: 't1' }),
    },
    experience: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 'e1' }),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn().mockResolvedValue({ id: 'e1' }),
      update: jest.fn().mockResolvedValue({ id: 'e1' }),
      delete: jest.fn().mockResolvedValue({ id: 'e1' }),
    },
    education: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 'ed1' }),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn().mockResolvedValue({ id: 'ed1' }),
      update: jest.fn().mockResolvedValue({ id: 'ed1' }),
      delete: jest.fn().mockResolvedValue({ id: 'ed1' }),
    },
    futureGoals: {
      findUnique: jest.fn().mockResolvedValue({ id: 1, title: 'T', description: 'D', items: [] }),
      upsert: jest.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: jest.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      // PrismaModule is @Global and supplies PrismaService in the real app; it
      // has to be imported here too for the override below to bind.
      imports: [PrismaModule, HeroModule, AboutModule, SkillsModule, ExperienceModule],
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
    prisma.stat.findMany.mockResolvedValue([stat]);
    prisma.stat.findUnique.mockResolvedValue(stat);
    prisma.stat.aggregate.mockResolvedValue({ _max: { order: 0 } });
    prisma.stat.create.mockResolvedValue(stat);
    prisma.stat.update.mockResolvedValue(stat);
    prisma.quickFact.findMany.mockResolvedValue([quickFact]);
    prisma.quickFact.findUnique.mockResolvedValue(quickFact);
    prisma.skillCategory.findUnique.mockResolvedValue({ id: 'cat1', title: 'Lang', icon: 'code' });
    prisma.skill.findUnique.mockResolvedValue({ id: 'sk1', categoryId: 'cat1' });
    prisma.skill.findMany.mockResolvedValue([]);
    prisma.experience.findUnique.mockResolvedValue({ id: 'e1' });
    prisma.education.findUnique.mockResolvedValue({ id: 'ed1' });
    prisma.tickerSkill.findUnique.mockResolvedValue({ id: 't1', label: 'React' });
  });

  /* --------------------------------- hero -------------------------------- */

  describe('stats', () => {
    it('exposes the strip publicly', async () => {
      const res = await request(app.getHttpServer()).get('/stats').expect(200);
      expect(res.body).toEqual({ items: [stat] });
    });

    it('creates a stat', async () => {
      await request(app.getHttpServer())
        .post('/stats')
        .send({ value: '99+', label: 'Mentored' })
        .expect(201);
      expect(prisma.stat.create).toHaveBeenCalledWith({
        data: { value: '99+', label: 'Mentored', order: 1 },
      });
    });

    it('rejects a stat with a blank value', async () => {
      await request(app.getHttpServer()).post('/stats').send({ value: '   ', label: 'X' }).expect(400);
    });

    it('rejects unknown fields instead of silently dropping them', async () => {
      await request(app.getHttpServer())
        .post('/stats')
        .send({ value: '1', label: 'X', sneaky: 'payload' })
        .expect(400);
    });

    it('reorders the strip', async () => {
      prisma.stat.findMany.mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }]);
      prisma.stat.findMany.mockResolvedValueOnce([]);
      await request(app.getHttpServer()).patch('/stats/reorder').send({ ids: ['b', 'a'] }).expect(200);
      expect(prisma.stat.update).toHaveBeenNthCalledWith(1, { where: { id: 'b' }, data: { order: 0 } });
    });
  });

  /* --------------------------------- about ------------------------------- */

  describe('about', () => {
    it('returns the narrative with its quick facts nested', async () => {
      const res = await request(app.getHttpServer()).get('/about').expect(200);
      expect(res.body.quickFacts).toEqual([quickFact]);
      expect(res.body.paragraphs).toEqual(['p1']);
    });

    it('saves the narrative', async () => {
      await request(app.getHttpServer())
        .patch('/about')
        .send({ sectionSubtitle: 'New', paragraphs: ['a', 'b'] })
        .expect(200);
      expect(prisma.aboutContent.upsert).toHaveBeenCalled();
    });

    it('rejects an over-long paragraph', async () => {
      await request(app.getHttpServer())
        .patch('/about')
        .send({ paragraphs: ['x'.repeat(1300)] })
        .expect(400);
    });

    it('accepts a known quick-fact icon key', async () => {
      await request(app.getHttpServer())
        .post('/about/quick-facts')
        .send({ label: 'Location', value: 'Cairo', icon: 'location' })
        .expect(201);
      expect(prisma.quickFact.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ icon: 'location' }),
      });
    });

    it('rejects an unknown quick-fact icon key and names the valid ones', async () => {
      const res = await request(app.getHttpServer())
        .post('/about/quick-facts')
        .send({ label: 'X', value: 'Y', icon: 'not-a-real-icon' })
        .expect(400);
      expect(JSON.stringify(res.body)).toContain('graduation');
    });

    it('reorders quick facts', async () => {
      prisma.quickFact.findMany.mockResolvedValueOnce([{ id: 'q1' }, { id: 'q2' }]);
      prisma.quickFact.findMany.mockResolvedValueOnce([]);
      await request(app.getHttpServer())
        .patch('/about/quick-facts/reorder')
        .send({ ids: ['q2', 'q1'] })
        .expect(200);
      expect(prisma.quickFact.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'q2' },
        data: { order: 0 },
      });
    });
  });

  /* -------------------------------- skills ------------------------------- */

  describe('skills', () => {
    it('returns categories, quote and ticker together', async () => {
      const res = await request(app.getHttpServer()).get('/skills').expect(200);
      expect(res.body).toHaveProperty('categories');
      expect(res.body).toHaveProperty('philosophyQuote');
      expect(res.body).toHaveProperty('tickerSkills');
    });

    it('creates a nested skill under its category', async () => {
      await request(app.getHttpServer())
        .post('/skill-categories/cat1/skills')
        .send({ name: 'Rust' })
        .expect(201);
      expect(prisma.skill.create).toHaveBeenCalledWith({
        data: { name: 'Rust', categoryId: 'cat1', order: 1 },
      });
    });

    it('rejects a skill name that is only whitespace', async () => {
      await request(app.getHttpServer())
        .post('/skill-categories/cat1/skills')
        .send({ name: '  ' })
        .expect(400);
    });

    it('rejects an unknown category icon key', async () => {
      await request(app.getHttpServer())
        .post('/skill-categories')
        .send({ title: 'Cloud', icon: 'nope-icon' })
        .expect(400);
    });

    it('accepts a known category icon key', async () => {
      await request(app.getHttpServer())
        .post('/skill-categories')
        .send({ title: 'Cloud', icon: 'cloud' })
        .expect(201);
    });

    it('updates the spotlight for a category', async () => {
      await request(app.getHttpServer())
        .patch('/skill-categories/cat1/spotlight')
        .send({ summary: 'Core languages', patterns: ['OOP'] })
        .expect(200);
      expect(prisma.skillSpotlight.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { categoryId: 'cat1' } }),
      );
    });

    it('saves the philosophy quote', async () => {
      await request(app.getHttpServer())
        .patch('/philosophy-quote')
        .send({ quote: 'Simplicity is pr discipline' })
        .expect(200);
    });

    it('rejects a quote beyond the column limit', async () => {
      await request(app.getHttpServer())
        .patch('/philosophy-quote')
        .send({ quote: 'x'.repeat(700) })
        .expect(400);
    });

    it('404s when updating a skill through the wrong category', async () => {
      prisma.skill.findUnique.mockResolvedValue({ id: 'sk9', categoryId: 'other' });
      await request(app.getHttpServer())
        .patch('/skill-categories/cat1/skills/sk9')
        .send({ name: 'Go' })
        .expect(404);
    });
  });

  /* ------------------------------ experience ----------------------------- */

  describe('experience', () => {
    it('returns timeline, education and goals', async () => {
      const res = await request(app.getHttpServer()).get('/experience').expect(200);
      expect(res.body).toHaveProperty('experiences');
      expect(res.body).toHaveProperty('education');
      expect(res.body).toHaveProperty('futureGoals');
    });

    it('accepts an education entry with a course list', async () => {
      await request(app.getHttpServer())
        .post('/education')
        .send({
          degree: 'B.Sc. CS & AI',
          institution: 'HNU',
          period: '2024 — 2028',
          courses: ['Robotics Software', 'Algorithms'],
        })
        .expect(201);
      expect(prisma.education.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ courses: ['Robotics Software', 'Algorithms'] }),
      });
    });

    it('rejects a course list that is too long', async () => {
      await request(app.getHttpServer())
        .post('/education')
        .send({
          degree: 'B.Sc.',
          institution: 'HNU',
          period: '2024',
          courses: ['x'.repeat(100)],
        })
        .expect(400);
    });

    it('creates an experience entry with technologies', async () => {
      await request(app.getHttpServer())
        .post('/experiences')
        .send({
          role: 'Mobile Developer',
          company: 'Flutter',
          period: '2024 — Present',
          description: 'Builds apps.',
          technologies: ['Flutter', 'Dart'],
        })
        .expect(201);
      expect(prisma.experience.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ technologies: ['Flutter', 'Dart'] }),
      });
    });

    it('rejects an experience entry missing its description', async () => {
      await request(app.getHttpServer())
        .post('/experiences')
        .send({ role: 'Dev', company: 'X', period: '2024' })
        .expect(400);
    });

    it('saves future goals', async () => {
      await request(app.getHttpServer())
        .patch('/future-goals')
        .send({ title: 'Autonomous Robotics', items: ['ROS2'] })
        .expect(200);
    });
  });
});