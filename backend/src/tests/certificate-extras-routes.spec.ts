import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import { CertificatesModule } from '../certificates/certificates.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Route-level checks for the certificate_stats and issuing_organizations
 * sub-resources.
 *
 * The reason these are in their own file: both are nested two segments deep
 * under an existing `@Controller('certificates')` that already ends in a
 * `@Get(':id')`. Declaring a literal segment after a parameterised one makes it
 * permanently unreachable — Nest matches in declaration order — and the failure
 * looks like a missing table or a 404 rather than a route typo. These tests pin
 * the ordering so that regression cannot land silently.
 */
const certStat = {
  id: 'cs1',
  value: '6+',
  label: 'Verified Credentials',
  desc: 'Global & Industry Standards',
  order: 0,
};

const issuer = { id: 'io1', name: 'Meta', order: 0 };

describe('certificate stats + issuing organization routes', () => {
  let app: INestApplication;
  const prisma = {
    certificate: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 'c1', category: 'ALGORITHMS_AI' }),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    certificateStat: {
      findMany: jest.fn().mockResolvedValue([certStat]),
      findUnique: jest.fn().mockResolvedValue(certStat),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn().mockResolvedValue(certStat),
      update: jest.fn().mockResolvedValue(certStat),
      delete: jest.fn().mockResolvedValue(certStat),
    },
    issuingOrganization: {
      findMany: jest.fn().mockResolvedValue([issuer]),
      findUnique: jest.fn().mockResolvedValue(issuer),
      aggregate: jest.fn().mockResolvedValue({ _max: { order: 0 } }),
      create: jest.fn().mockResolvedValue(issuer),
      update: jest.fn().mockResolvedValue(issuer),
      delete: jest.fn().mockResolvedValue(issuer),
    },
    $transaction: jest.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, CertificatesModule],
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
    prisma.certificateStat.findMany.mockResolvedValue([certStat]);
    prisma.certificateStat.findUnique.mockResolvedValue(certStat);
    prisma.certificateStat.aggregate.mockResolvedValue({ _max: { order: 0 } });
    prisma.certificateStat.create.mockResolvedValue(certStat);
    prisma.certificateStat.update.mockResolvedValue(certStat);
    prisma.issuingOrganization.findMany.mockResolvedValue([issuer]);
    prisma.issuingOrganization.findUnique.mockResolvedValue(issuer);
    prisma.issuingOrganization.aggregate.mockResolvedValue({ _max: { order: 0 } });
    prisma.issuingOrganization.create.mockResolvedValue(issuer);
    prisma.issuingOrganization.update.mockResolvedValue(issuer);
    prisma.certificate.findUnique.mockResolvedValue({ id: 'c1', category: 'ALGORITHMS_AI' });
  });

  /* ----------------------------- routing guard --------------------------- */

  describe('routing', () => {
    it('does not let :id swallow the stats collection', async () => {
      const res = await request(app.getHttpServer()).get('/certificates/stats').expect(200);
      expect(res.body).toEqual({ items: [certStat] });
    });

    it('does not let :id swallow the issuing-organizations collection', async () => {
      const res = await request(app.getHttpServer())
        .get('/certificates/issuing-organizations')
        .expect(200);
      expect(res.body).toEqual({ items: [issuer] });
    });

    it('still routes a real certificate id through :id', async () => {
      await request(app.getHttpServer()).get('/certificates/c1').expect(200);
      expect(prisma.certificate.findUnique).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });

    it('still routes the categories collection', async () => {
      const res = await request(app.getHttpServer()).get('/certificates/categories').expect(200);
      expect(res.body.categories).toHaveLength(4);
    });
  });

  /* --------------------------- certificate stats ------------------------- */

  describe('certificate stats', () => {
    it('creates a stat with desc omitted', async () => {
      await request(app.getHttpServer())
        .post('/certificates/stats')
        .send({ value: '12+', label: 'Projects Shipped' })
        .expect(201);
      expect(prisma.certificateStat.create).toHaveBeenCalledWith({
        data: { value: '12+', label: 'Projects Shipped', order: 1 },
      });
    });

    it('rejects a stat with no value', async () => {
      await request(app.getHttpServer())
        .post('/certificates/stats')
        .send({ label: 'Only Label' })
        .expect(400);
    });

    it('rejects unknown fields on a stat', async () => {
      await request(app.getHttpServer())
        .post('/certificates/stats')
        .send({ value: '1', label: 'X', order: 9 })
        .expect(400);
    });

    it('updates a stat', async () => {
      await request(app.getHttpServer())
        .patch('/certificates/stats/cs1')
        .send({ value: '10+' })
        .expect(200);
      expect(prisma.certificateStat.update).toHaveBeenCalledWith({
        where: { id: 'cs1' },
        data: { value: '10+' },
      });
    });

    it('reorders stats', async () => {
      prisma.certificateStat.findMany.mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }]);
      prisma.certificateStat.findMany.mockResolvedValueOnce([]);
      await request(app.getHttpServer())
        .patch('/certificates/stats/reorder')
        .send({ ids: ['b', 'a'] })
        .expect(200);
      expect(prisma.certificateStat.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'b' },
        data: { order: 0 },
      });
    });

    it('404s when updating a stat that does not exist', async () => {
      prisma.certificateStat.findUnique.mockResolvedValue(null);
      await request(app.getHttpServer())
        .patch('/certificates/stats/missing')
        .send({ value: '1' })
        .expect(404);
    });

    it('204s when deleting a stat', async () => {
      await request(app.getHttpServer()).delete('/certificates/stats/cs1').expect(204);
      expect(prisma.certificateStat.delete).toHaveBeenCalledWith({ where: { id: 'cs1' } });
    });
  });

  /* ------------------------- issuing organizations ----------------------- */

  describe('issuing organizations', () => {
    it('creates an issuer', async () => {
      await request(app.getHttpServer())
        .post('/certificates/issuing-organizations')
        .send({ name: 'AWS' })
        .expect(201);
      expect(prisma.issuingOrganization.create).toHaveBeenCalledWith({
        data: { name: 'AWS', order: 1 },
      });
    });

    it('rejects a blank issuer name', async () => {
      await request(app.getHttpServer())
        .post('/certificates/issuing-organizations')
        .send({ name: '   ' })
        .expect(400);
    });

    it('renames an issuer', async () => {
      await request(app.getHttpServer())
        .patch('/certificates/issuing-organizations/io1')
        .send({ name: 'Meta Platforms' })
        .expect(200);
      expect(prisma.issuingOrganization.update).toHaveBeenCalledWith({
        where: { id: 'io1' },
        data: { name: 'Meta Platforms' },
      });
    });

    it('reorders issuers', async () => {
      prisma.issuingOrganization.findMany.mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }]);
      prisma.issuingOrganization.findMany.mockResolvedValueOnce([]);
      await request(app.getHttpServer())
        .patch('/certificates/issuing-organizations/reorder')
        .send({ ids: ['b', 'a'] })
        .expect(200);
      expect(prisma.issuingOrganization.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'b' },
        data: { order: 0 },
      });
    });

    it('404s when deleting a missing issuer', async () => {
      prisma.issuingOrganization.findUnique.mockResolvedValue(null);
      await request(app.getHttpServer())
        .delete('/certificates/issuing-organizations/missing')
        .expect(404);
    });
  });
});