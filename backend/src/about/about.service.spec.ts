import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { AboutService } from './about.service';

function makePrisma() {
  return {
    aboutContent: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    quickFact: {
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
  const service = new AboutService(prisma as unknown as PrismaService);
  return { service, prisma };
}

describe('AboutService', () => {
  describe('updateAbout', () => {
    /**
     * The interesting case: every field in AboutContent is optional, so a
     * partial save must not blank out the fields the caller did not send. If the
     * service ever reverts to spreading the whole DTO into `update`, saving just
     * the subtitle would silently erase the paragraphs.
     */
    it('leaves omitted fields untouched on a partial update', async () => {
      const { service, prisma } = makeService();
      prisma.aboutContent.upsert.mockResolvedValue({ id: 1 });

      await service.updateAbout({ sectionSubtitle: 'New subtitle' });

      const update = prisma.aboutContent.upsert.mock.calls[0][0].update;
      expect(update).toEqual({ sectionSubtitle: 'New subtitle' });
      expect(update).not.toHaveProperty('paragraphs');
      expect(update).not.toHaveProperty('highlights');
    });

    it('upserts on the singleton id so a fresh install can save without seeding', async () => {
      const { service, prisma } = makeService();
      prisma.aboutContent.upsert.mockResolvedValue({ id: 1 });

      await service.updateAbout({ narrativeTitle: 'Title' });

      const call = prisma.aboutContent.upsert.mock.calls[0][0];
      expect(call.where).toEqual({ id: 1 });
      expect(call.create).toMatchObject({ id: 1, narrativeTitle: 'Title' });
    });

    it('sends empty arrays when the admin clears a list field', async () => {
      const { service, prisma } = makeService();
      prisma.aboutContent.upsert.mockResolvedValue({ id: 1 });

      await service.updateAbout({ paragraphs: [] });

      expect(prisma.aboutContent.upsert.mock.calls[0][0].update).toEqual({
        paragraphs: [],
      });
    });
  });

  describe('quick facts', () => {
    it('attaches new quick facts to the singleton AboutContent row', async () => {
      const { service, prisma } = makeService();
      prisma.quickFact.aggregate.mockResolvedValue({ _max: { order: 3 } });
      prisma.quickFact.create.mockResolvedValue({});

      await service.createQuickFact({ label: 'Degree', value: 'B.Sc.' });

      expect(prisma.quickFact.create).toHaveBeenCalledWith({
        data: { label: 'Degree', value: 'B.Sc.', detail: null, icon: null, aboutId: 1, order: 4 },
      });
    });

    it('stores the icon on the row so rendering does not depend on position', async () => {
      const { service, prisma } = makeService();
      prisma.quickFact.aggregate.mockResolvedValue({ _max: { order: null } });
      prisma.quickFact.create.mockResolvedValue({});

      await service.createQuickFact({
        label: 'Core Stack',
        value: 'Flutter, React, .NET',
        icon: 'terminal',
      });

      expect(prisma.quickFact.create.mock.calls[0][0].data).toMatchObject({
        icon: 'terminal',
        order: 0,
      });
    });

    it('preserves an explicitly provided icon on update', async () => {
      const { service, prisma } = makeService();
      prisma.quickFact.findUnique.mockResolvedValue({ id: 'q1' });
      prisma.quickFact.update.mockResolvedValue({});

      await service.updateQuickFact('q1', { icon: 'location' });

      expect(prisma.quickFact.update).toHaveBeenCalledWith({
        where: { id: 'q1' },
        data: { icon: 'location' },
      });
    });

    it('rejects updating a quick fact that does not exist', async () => {
      const { service, prisma } = makeService();
      prisma.quickFact.findUnique.mockResolvedValue(null);

      await expect(service.updateQuickFact('missing', { value: 'x' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prisma.quickFact.update).not.toHaveBeenCalled();
    });

    it('reorders only after every id is known to the service', async () => {
      const { service, prisma } = makeService();
      prisma.quickFact.findMany
        .mockResolvedValueOnce([{ id: 'q1' }, { id: 'q2' }])
        .mockResolvedValueOnce([]);
      prisma.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops));

      await service.reorderQuickFacts({ ids: ['q2', 'q1'] });

      expect(prisma.quickFact.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'q2' },
        data: { order: 0 },
      });
      expect(prisma.quickFact.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'q1' },
        data: { order: 1 },
      });
    });
  });
});