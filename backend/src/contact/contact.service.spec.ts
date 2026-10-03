import { Logger, NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { ContactSubmission } from '@prisma/client';
import { ContactService } from './contact.service';
import type { CreateContactSubmissionDto } from './dto/contact.dto';
import type { NotificationsService } from '../notifications/notifications.service';
import type { PrismaService } from '../prisma/prisma.service';

function makePrisma() {
  return {
    contactSubmission: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
}

function makeNotifications(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    notifyNewSubmission: jest.fn().mockResolvedValue(true),
    status: jest.fn().mockReturnValue({ configured: true, missing: [] }),
    ...overrides,
  };
}

function makeService(
  options: {
    env?: Record<string, string>;
    notifications?: Record<string, unknown>;
  } = {},
) {
  const prisma = makePrisma();
  const notifications = makeNotifications(options.notifications);
  const values = options.env ?? {};
  const config = { get: (key: string) => values[key] } as unknown as ConfigService;

  const service = new ContactService(
    prisma as unknown as PrismaService,
    notifications as unknown as NotificationsService,
    config,
  );

  return { service, prisma, notifications };
}

const DTO: CreateContactSubmissionDto = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Flutter mobile application',
  message: 'I would like to discuss a project.',
};

const ROW = {
  id: 'clx123abc',
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Flutter mobile application',
  message: 'I would like to discuss a project.',
  ipHash: 'deadbeef',
  userAgent: 'jest',
  read: false,
  createdAt: new Date('2026-02-14T09:30:00.000Z'),
} as unknown as ContactSubmission;

beforeEach(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('create', () => {
  it('stores the submission and returns the row', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.create.mockResolvedValue(ROW);

    await expect(service.create(DTO)).resolves.toBe(ROW);
    expect(prisma.contactSubmission.create).toHaveBeenCalledWith({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Flutter mobile application',
        message: 'I would like to discuss a project.',
        ipHash: null,
        userAgent: null,
      },
    });
  });

  it('defaults a blank subject to an empty string, since the column is NOT NULL', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.create.mockResolvedValue(ROW);

    await service.create({ ...DTO, subject: undefined });

    expect(prisma.contactSubmission.create.mock.calls[0][0].data.subject).toBe('');
  });

  it('starts every submission unread', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.create.mockResolvedValue(ROW);

    await service.create(DTO);

    expect(prisma.contactSubmission.create.mock.calls[0][0].data).not.toHaveProperty('read');
  });

  describe('honeypot', () => {
    it('drops the submission and returns null when the field is filled', async () => {
      const { service, prisma } = makeService();

      await expect(
        service.create({ ...DTO, website: 'http://spam.example' }),
      ).resolves.toBeNull();
      expect(prisma.contactSubmission.create).not.toHaveBeenCalled();
    });

    it('does not notify the admin about a honeypot submission', async () => {
      const { service, notifications } = makeService();

      await service.create({ ...DTO, website: 'http://spam.example' });

      expect(notifications.notifyNewSubmission).not.toHaveBeenCalled();
    });

    it('warns so the drop is visible server-side', async () => {
      const { service } = makeService();
      const warn = jest.spyOn(Logger.prototype, 'warn');

      await service.create({ ...DTO, website: 'http://spam.example' });

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('honeypot'));
    });

    it('proceeds when the honeypot is an empty string, which real browsers send', async () => {
      const { service, prisma } = makeService();
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await expect(service.create({ ...DTO, website: '' })).resolves.toBe(ROW);
      expect(prisma.contactSubmission.create).toHaveBeenCalled();
    });

    it('proceeds when the honeypot is absent entirely', async () => {
      const { service, prisma } = makeService();
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await expect(service.create(DTO)).resolves.toBe(ROW);
    });
  });

  describe('ip hashing', () => {
    it('stores a digest rather than the address', async () => {
      const { service, prisma } = makeService({ env: { CONTACT_IP_HASH_SALT: 'salt' } });
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await service.create(DTO, { ip: '203.0.113.7' });

      const { ipHash } = prisma.contactSubmission.create.mock.calls[0][0].data;
      expect(ipHash).toMatch(/^[0-9a-f]{64}$/);
      expect(ipHash).not.toContain('203.0.113.7');
    });

    it('falls back to JWT_SECRET when no dedicated salt is set', async () => {
      const { service, prisma } = makeService({ env: { JWT_SECRET: 'jwt-secret' } });
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await service.create(DTO, { ip: '203.0.113.7' });

      expect(prisma.contactSubmission.create.mock.calls[0][0].data.ipHash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('stores null when there is no secret to hash with', async () => {
      const { service, prisma } = makeService();
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await service.create(DTO, { ip: '203.0.113.7' });

      expect(prisma.contactSubmission.create.mock.calls[0][0].data.ipHash).toBeNull();
    });

    it('stores null when no address was resolved', async () => {
      const { service, prisma } = makeService({ env: { CONTACT_IP_HASH_SALT: 'salt' } });
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await service.create(DTO);

      expect(prisma.contactSubmission.create.mock.calls[0][0].data.ipHash).toBeNull();
    });
  });

  describe('user agent', () => {
    it('stores the header', async () => {
      const { service, prisma } = makeService();
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await service.create(DTO, { userAgent: 'Mozilla/5.0' });

      expect(prisma.contactSubmission.create.mock.calls[0][0].data.userAgent).toBe('Mozilla/5.0');
    });

    it('truncates an unbounded header instead of letting it fill the row', async () => {
      const { service, prisma } = makeService();
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await service.create(DTO, { userAgent: 'u'.repeat(5000) });

      expect(prisma.contactSubmission.create.mock.calls[0][0].data.userAgent).toHaveLength(500);
    });

    it('stores null for a missing header', async () => {
      const { service, prisma } = makeService();
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await service.create(DTO, { userAgent: '   ' });

      expect(prisma.contactSubmission.create.mock.calls[0][0].data.userAgent).toBeNull();
    });
  });

  describe('non-blocking notification', () => {
    /**
     * The gate never resolves until the test releases it. If create() awaited the
     * notification, the await below would hang and the test would time out —
     * which is exactly the property BACKEND_PLAN.md §4.4 requires.
     */
    it('returns the stored row without waiting for the notification', async () => {
      let release!: () => void;
      const gate = new Promise<boolean>((resolve) => {
        release = () => resolve(true);
      });

      const { service, prisma, notifications } = makeService({
        notifications: { notifyNewSubmission: jest.fn().mockReturnValue(gate) },
      });
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await expect(service.create(DTO)).resolves.toBe(ROW);

      release();
      await gate;
      expect(notifications.notifyNewSubmission).toHaveBeenCalled();
    });

    it('hands the stored row to the notification service', async () => {
      const { service, prisma, notifications } = makeService();
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await service.create(DTO);

      expect(notifications.notifyNewSubmission).toHaveBeenCalledWith(ROW);
    });

    it('still succeeds when the notification rejects', async () => {
      const { service, prisma } = makeService({
        notifications: {
          notifyNewSubmission: jest.fn().mockRejectedValue(new Error('resend down')),
        },
      });
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await expect(service.create(DTO)).resolves.toBe(ROW);
    });

    it('logs a rejected notification without failing the submission', async () => {
      const { service, prisma } = makeService({
        notifications: {
          notifyNewSubmission: jest.fn().mockRejectedValue(new Error('resend down')),
        },
      });
      prisma.contactSubmission.create.mockResolvedValue(ROW);
      const error = jest.spyOn(Logger.prototype, 'error');

      await service.create(DTO);

      expect(error).toHaveBeenCalledWith(
        expect.stringContaining('clx123abc'),
        expect.stringContaining('resend down'),
      );
    });

    it('survives a notification that throws synchronously', async () => {
      const { service, prisma } = makeService({
        notifications: {
          notifyNewSubmission: jest.fn().mockImplementation(() => {
            throw new Error('exploded synchronously');
          }),
        },
      });
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await expect(service.create(DTO)).resolves.toBe(ROW);
    });

    it('logs a synchronous throw too', async () => {
      const { service, prisma } = makeService({
        notifications: {
          notifyNewSubmission: jest.fn().mockImplementation(() => {
            throw new Error('exploded synchronously');
          }),
        },
      });
      prisma.contactSubmission.create.mockResolvedValue(ROW);
      const error = jest.spyOn(Logger.prototype, 'error');

      await service.create(DTO);

      expect(error).toHaveBeenCalledWith(
        expect.stringContaining('clx123abc'),
        expect.stringContaining('exploded synchronously'),
      );
    });

    it('does not leave an unhandled rejection behind', async () => {
      const rejections: unknown[] = [];
      const onRejection = (reason: unknown) => rejections.push(reason);
      process.on('unhandledRejection', onRejection);

      const { service, prisma } = makeService({
        notifications: {
          notifyNewSubmission: jest.fn().mockRejectedValue(new Error('resend down')),
        },
      });
      prisma.contactSubmission.create.mockResolvedValue(ROW);

      await service.create(DTO);
      // Give the microtask queue a chance to surface any unhandled rejection.
      await new Promise((resolve) => setImmediate(resolve));

      process.off('unhandledRejection', onRejection);
      expect(rejections).toEqual([]);
    });
  });
});

describe('findAll', () => {
  it('returns submissions newest first with the unread count', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.findMany.mockResolvedValue([ROW]);
    prisma.contactSubmission.count.mockResolvedValue(1);

    await expect(service.findAll()).resolves.toEqual({
      items: [ROW],
      unreadCount: 1,
      notifications: { configured: true, missing: [] },
    });
  });

  it('orders newest first', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.findMany.mockResolvedValue([]);
    prisma.contactSubmission.count.mockResolvedValue(0);

    await service.findAll();

    expect(prisma.contactSubmission.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });

  it('counts only unread rows', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.findMany.mockResolvedValue([]);
    prisma.contactSubmission.count.mockResolvedValue(0);

    await service.findAll();

    expect(prisma.contactSubmission.count).toHaveBeenCalledWith({ where: { read: false } });
  });

  it('reports notification configuration so the inbox can warn', async () => {
    const { service, prisma } = makeService({
      notifications: {
        status: jest.fn().mockReturnValue({ configured: false, missing: ['RESEND_API_KEY'] }),
      },
    });
    prisma.contactSubmission.findMany.mockResolvedValue([]);
    prisma.contactSubmission.count.mockResolvedValue(0);

    await expect(service.findAll()).resolves.toMatchObject({
      notifications: { configured: false, missing: ['RESEND_API_KEY'] },
    });
  });

  it('handles an empty inbox', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.findMany.mockResolvedValue([]);
    prisma.contactSubmission.count.mockResolvedValue(0);

    await expect(service.findAll()).resolves.toMatchObject({ items: [], unreadCount: 0 });
  });
});

describe('markRead', () => {
  it('marks the submission read by default', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.findUnique.mockResolvedValue({ ...ROW, read: false });
    prisma.contactSubmission.update.mockResolvedValue({ ...ROW, read: true });

    await expect(service.markRead('clx123abc')).resolves.toMatchObject({ read: true });
    expect(prisma.contactSubmission.update).toHaveBeenCalledWith({
      where: { id: 'clx123abc' },
      data: { read: true },
    });
  });

  it('can move a submission back to unread', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.findUnique.mockResolvedValue({ ...ROW, read: true });
    prisma.contactSubmission.update.mockResolvedValue({ ...ROW, read: false });

    await service.markRead('clx123abc', { read: false });

    expect(prisma.contactSubmission.update).toHaveBeenCalledWith({
      where: { id: 'clx123abc' },
      data: { read: false },
    });
  });

  it('is idempotent for an already-read submission', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.findUnique.mockResolvedValue({ ...ROW, read: true });
    prisma.contactSubmission.update.mockResolvedValue({ ...ROW, read: true });

    await expect(service.markRead('clx123abc')).resolves.toMatchObject({ read: true });
  });

  it('404s for an unknown id', async () => {
    const { service, prisma } = makeService();
    prisma.contactSubmission.findUnique.mockResolvedValue(null);

    await expect(service.markRead('nope')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.contactSubmission.update).not.toHaveBeenCalled();
  });
});