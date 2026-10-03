import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { SkillsService } from './skills.service';

function makePrisma() {
  return {
    skillCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    skill: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    skillSpotlight: { upsert: jest.fn() },
    philosophyQuote: { findUnique: jest.fn(), upsert: jest.fn() },
    tickerSkill: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };
}

function makeService() {
  const prisma = makePrisma();
  const service = new SkillsService(prisma as unknown as PrismaService);
  return { service, prisma };
}

const CATEGORY = { id: 'cat1', title: 'Programming Languages', icon: 'code' };

describe('SkillsService', () => {
  describe('findAll', () => {
    it('returns categories with nested skills and spotlight in one payload', async () => {
      const { service, prisma } = makeService();
      prisma.skillCategory.findMany.mockResolvedValue([{ ...CATEGORY, skills: [], spotlight: null }]);
      prisma.philosophyQuote.findUnique.mockResolvedValue(null);
      prisma.tickerSkill.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual({
        categories: [{ ...CATEGORY, skills: [], spotlight: null }],
        philosophyQuote: null,
        tickerSkills: [],
      });
      expect(prisma.skillCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ include: { skills: expect.any(Object), spotlight: true } }),
      );
    });
  });

  describe('categories', () => {
    it('appends new categories to the end of the list', async () => {
      const { service, prisma } = makeService();
      prisma.skillCategory.aggregate.mockResolvedValue({ _max: { order: 5 } });
      prisma.skillCategory.create.mockResolvedValue({});

      await service.createCategory({ title: 'Cloud', icon: 'cloud' });

      expect(prisma.skillCategory.create).toHaveBeenCalledWith({
        data: { title: 'Cloud', icon: 'cloud', order: 6 },
      });
    });

    it('deletes a category and lets its skills cascade', async () => {
      const { service, prisma } = makeService();
      prisma.skillCategory.findUnique.mockResolvedValue(CATEGORY);
      prisma.skillCategory.delete.mockResolvedValue({});

      await service.removeCategory('cat1');

      expect(prisma.skillCategory.delete).toHaveBeenCalledWith({ where: { id: 'cat1' } });
    });

    it('rejects removing a category that does not exist', async () => {
      const { service, prisma } = makeService();
      prisma.skillCategory.findUnique.mockResolvedValue(null);

      await expect(service.removeCategory('nope')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.skillCategory.delete).not.toHaveBeenCalled();
    });
  });

  describe('skills within a category', () => {
    it('numbers skills relative to their own category, not globally', async () => {
      const { service, prisma } = makeService();
      prisma.skillCategory.findUnique.mockResolvedValue(CATEGORY);
      prisma.skill.aggregate.mockResolvedValue({ _max: { order: 7 } });
      prisma.skill.create.mockResolvedValue({});

      await service.createSkill('cat1', { name: 'Rust' });

      expect(prisma.skill.create).toHaveBeenCalledWith({
        data: { name: 'Rust', categoryId: 'cat1', order: 8 },
      });
    });

    /**
     * Guards the nested-resource boundary: a skill id belonging to a different
     * category must not be editable through this category's route.
     */
    it('refuses to update a skill that belongs to another category', async () => {
      const { service, prisma } = makeService();
      prisma.skill.findUnique.mockResolvedValue({ id: 's1', categoryId: 'cat2' });

      await expect(service.updateSkill('cat1', 's1', { name: 'Go' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.skill.update).not.toHaveBeenCalled();
    });

    /**
     * Reorder ids are validated against the parent category's skills only, so a
     * client cannot reorder across categories by mixing ids.
     */
    it('scopes skill reordering to the parent category', async () => {
      const { service, prisma } = makeService();
      prisma.skillCategory.findUnique.mockResolvedValue(CATEGORY);
      prisma.skill.findMany
        .mockResolvedValueOnce([{ id: 's1' }, { id: 's2' }]) // existing in cat1
        .mockResolvedValueOnce([]);
      prisma.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops));

      await expect(service.reorderSkills('cat1', { ids: ['s2', 's1'] })).resolves.toBeDefined();

      expect(prisma.skill.findMany).toHaveBeenNthCalledWith(1, {
        where: { categoryId: 'cat1' },
        select: { id: true },
      });
      expect(prisma.skill.update).toHaveBeenNthCalledWith(1, {
        where: { id: 's2' },
        data: { order: 0 },
      });
    });

    it('honours startOrder so a nested list cannot collide with its parent ordering', async () => {
      const { service, prisma } = makeService();
      prisma.skillCategory.findUnique.mockResolvedValue(CATEGORY);
      prisma.skill.findMany
        .mockResolvedValueOnce([{ id: 's1' }])
        .mockResolvedValueOnce([]);
      prisma.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops));

      await service.reorderSkills('cat1', { ids: ['s1'], startOrder: 10 });

      expect(prisma.skill.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { order: 10 },
      });
    });
  });

  describe('spotlight', () => {
    it('creates the spotlight on first save and updates afterwards', async () => {
      const { service, prisma } = makeService();
      prisma.skillCategory.findUnique.mockResolvedValue(CATEGORY);
      prisma.skillSpotlight.upsert.mockResolvedValue({});

      await service.updateSpotlight('cat1', { summary: 'Core languages' });

      const call = prisma.skillSpotlight.upsert.mock.calls[0][0];
      expect(call.where).toEqual({ categoryId: 'cat1' });
      expect(call.create).toMatchObject({ categoryId: 'cat1', summary: 'Core languages' });
      expect(call.update).toEqual({ summary: 'Core languages' });
    });

    it('does not wipe patterns when only the summary is saved', async () => {
      const { service, prisma } = makeService();
      prisma.skillCategory.findUnique.mockResolvedValue(CATEGORY);
      prisma.skillSpotlight.upsert.mockResolvedValue({});

      await service.updateSpotlight('cat1', { summary: 'New' });

      expect(prisma.skillSpotlight.upsert.mock.calls[0][0].update).not.toHaveProperty('patterns');
    });
  });

  describe('philosophy quote', () => {
    it('preserves the author when only the quote text changes', async () => {
      const { service, prisma } = makeService();
      prisma.philosophyQuote.upsert.mockResolvedValue({});

      await service.updatePhilosophyQuote({ quote: 'New quote' });

      expect(prisma.philosophyQuote.upsert.mock.calls[0][0].update).toEqual({
        quote: 'New quote',
      });
    });
  });
});