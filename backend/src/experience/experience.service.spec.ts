import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { ExperienceService } from './experience.service';

function makePrisma() {
  return {
    experience: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    education: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    futureGoals: { findUnique: jest.fn(), upsert: jest.fn() },
    $transaction: jest.fn(),
  };
}

function makeService() {
  const prisma = makePrisma();
  const service = new ExperienceService(prisma as unknown as PrismaService);
  return { service, prisma };
}

describe('ExperienceService', () => {
  describe('findAll', () => {
    it('returns timeline, education and goals together', async () => {
      const { service, prisma } = makeService();
      prisma.experience.findMany.mockResolvedValue([{ id: 'e1' }]);
      prisma.education.findMany.mockResolvedValue([{ id: 'ed1' }]);
      prisma.futureGoals.findUnique.mockResolvedValue(null);

      await expect(service.findAll()).resolves.toEqual({
        experiences: [{ id: 'e1' }],
        education: [{ id: 'ed1' }],
        futureGoals: null,
      });
    });
  });

  describe('experiences', () => {
    it('appends new entries to the end of the timeline', async () => {
      const { service, prisma } = makeService();
      prisma.experience.aggregate.mockResolvedValue({ _max: { order: 2 } });
      prisma.experience.create.mockResolvedValue({});

      await service.createExperience({
        role: 'Mobile Developer',
        company: 'Flutter',
        period: '2024 — Present',
        description: 'Builds apps.',
      });

      expect(prisma.experience.create).toHaveBeenCalledWith({
        data: {
          role: 'Mobile Developer',
          company: 'Flutter',
          period: '2024 — Present',
          description: 'Builds apps.',
          technologies: [],
          order: 3,
        },
      });
    });

    it('rejects updating an entry that does not exist', async () => {
      const { service, prisma } = makeService();
      prisma.experience.findUnique.mockResolvedValue(null);

      await expect(service.updateExperience('nope', { role: 'X' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('education', () => {
    /**
     * Regression guard for the Stage 3 audit finding: `courses` is a real
     * column, and the create path must persist it verbatim so the admin form
     * round-trips. It used to be ignored by the frontend and hardcoded instead.
     */
    it('persists the courses list supplied by the admin', async () => {
      const { service, prisma } = makeService();
      prisma.education.aggregate.mockResolvedValue({ _max: { order: null } });
      prisma.education.create.mockResolvedValue({});

      await service.createEducation({
        degree: 'B.Sc. CS & AI',
        institution: 'HNU',
        period: '2024 — 2028',
        courses: ['Robotics Software', 'Algorithms'],
      });

      expect(prisma.education.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          courses: ['Robotics Software', 'Algorithms'],
          order: 0,
        }),
      });
    });

    it('round-trips an updated course list without dropping other fields', async () => {
      const { service, prisma } = makeService();
      prisma.education.findUnique.mockResolvedValue({ id: 'ed1' });
      prisma.education.update.mockResolvedValue({});

      await service.updateEducation('ed1', { courses: ['Distributed Systems'] });

      expect(prisma.education.update).toHaveBeenCalledWith({
        where: { id: 'ed1' },
        data: { courses: ['Distributed Systems'] },
      });
    });
  });

  describe('future goals', () => {
    it('upserts the singleton and preserves items when only the title changes', async () => {
      const { service, prisma } = makeService();
      prisma.futureGoals.upsert.mockResolvedValue({});

      await service.updateFutureGoals({ title: 'Autonomous Robotics' });

      const call = prisma.futureGoals.upsert.mock.calls[0][0];
      expect(call.where).toEqual({ id: 1 });
      expect(call.update).toEqual({ title: 'Autonomous Robotics' });
      expect(call.update).not.toHaveProperty('items');
    });
  });
});