import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { HeroService } from './hero.service';

function makePrisma() {
  return {
    stat: {
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
  const service = new HeroService(prisma as unknown as PrismaService);
  return { service, prisma };
}

describe('HeroService', () => {
  it('orders the strip by position, falling back to label for ties', async () => {
    const { service, prisma } = makeService();
    prisma.stat.findMany.mockResolvedValue([]);

    await service.findAll();

    expect(prisma.stat.findMany).toHaveBeenCalledWith({
      orderBy: [{ order: 'asc' }, { label: 'asc' }],
    });
  });

  it('appends new stats so adding one does not displace the current first entry', async () => {
    const { service, prisma } = makeService();
    prisma.stat.aggregate.mockResolvedValue({ _max: { order: 3 } });
    prisma.stat.create.mockResolvedValue({});

    await service.create({ value: '99+', label: 'Mentored' });

    expect(prisma.stat.create).toHaveBeenCalledWith({
      data: { value: '99+', label: 'Mentored', order: 4 },
    });
  });

  it('rejects removing a stat that does not exist', async () => {
    const { service, prisma } = makeService();
    prisma.stat.findUnique.mockResolvedValue(null);

    await expect(service.remove('nope')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.stat.delete).not.toHaveBeenCalled();
  });

  it('writes the submitted order through a single transaction', async () => {
    const { service, prisma } = makeService();
    prisma.stat.findMany.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    prisma.$transaction.mockImplementation((ops: unknown[]) => Promise.all(ops));
    prisma.stat.findMany.mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    prisma.stat.findMany.mockResolvedValueOnce([]);

    await service.reorder({ ids: ['c', 'a', 'b'] });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.stat.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'c' },
      data: { order: 0 },
    });
    expect(prisma.stat.update).toHaveBeenNthCalledWith(3, {
      where: { id: 'b' },
      data: { order: 2 },
    });
  });
});