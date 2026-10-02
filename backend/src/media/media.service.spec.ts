import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MediaKind } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import type { PresignMediaDto, RegisterMediaDto } from './dto/media.dto';
import { MediaService } from './media.service';
import type { R2StorageService } from './r2.storage';

const PUBLIC_URL = 'https://cdn.example.com';

function makePrisma() {
  return {
    mediaAsset: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };
}

function makeStorage(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    missingConfig: jest.fn().mockReturnValue([]),
    buildKey: jest.fn().mockReturnValue('uploads/abc.png'),
    buildPublicUrl: jest.fn((key: string) => `${PUBLIC_URL}/${key}`),
    keyFromPublicUrl: jest.fn((url: string) =>
      url.startsWith(`${PUBLIC_URL}/uploads/`)
        ? url.slice(PUBLIC_URL.length + 1)
        : undefined,
    ),
    presignPut: jest.fn().mockResolvedValue({
      key: 'uploads/abc.png',
      uploadUrl: 'https://signed/put',
      publicUrl: `${PUBLIC_URL}/uploads/abc.png`,
      expiresInSeconds: 300,
    }),
    deleteObject: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeService(storageOverrides: Record<string, unknown> = {}) {
  const prisma = makePrisma();
  const storage = makeStorage(storageOverrides);
  const service = new MediaService(
    prisma as unknown as PrismaService,
    storage as unknown as R2StorageService,
  );
  return { service, prisma, storage };
}

const PRESIGN_DTO = {
  contentType: 'image/png',
  originalFilename: 'a.png',
  size: 10,
} as PresignMediaDto;

const REGISTER_DTO = {
  contentType: 'image/png',
  originalFilename: 'a.png',
  size: 10,
  key: 'uploads/abc.png',
  kind: MediaKind.IMAGE,
} as RegisterMediaDto;

describe('status', () => {
  it('reports configured when nothing is missing', () => {
    const { service } = makeService();
    expect(service.status()).toEqual({
      configured: true,
      missing: [],
      maxUploadBytes: 26_214_400,
    });
  });

  it('lists the missing vars so the admin can explain itself', () => {
    const { service } = makeService({
      missingConfig: jest.fn().mockReturnValue(['R2_BUCKET']),
    });
    expect(service.status()).toEqual({
      configured: false,
      missing: ['R2_BUCKET'],
      maxUploadBytes: 26_214_400,
    });
  });
});

describe('presign', () => {
  it('generates a key then delegates to storage', async () => {
    const { service, storage } = makeService();
    await expect(service.presign(PRESIGN_DTO)).resolves.toMatchObject({
      key: 'uploads/abc.png',
    });
    expect(storage.buildKey).toHaveBeenCalledWith(PRESIGN_DTO);
    expect(storage.presignPut).toHaveBeenCalledWith(PRESIGN_DTO, 'uploads/abc.png');
  });

  it('propagates a 503 from storage when R2 is unconfigured', async () => {
    const { service } = makeService({
      presignPut: jest.fn().mockRejectedValue(new Error('not configured')),
    });
    await expect(service.presign(PRESIGN_DTO)).rejects.toThrow('not configured');
  });
});

describe('register', () => {
  it('creates a registry row pointed at the public URL', async () => {
    const { service, prisma } = makeService();
    prisma.mediaAsset.findFirst.mockResolvedValue(null);
    prisma.mediaAsset.create.mockResolvedValue({ id: 'asset-1' });

    await expect(service.register(REGISTER_DTO)).resolves.toEqual({ id: 'asset-1' });
    expect(prisma.mediaAsset.create).toHaveBeenCalledWith({
      data: {
        url: `${PUBLIC_URL}/uploads/abc.png`,
        kind: MediaKind.IMAGE,
        originalFilename: 'a.png',
        size: 10,
      },
    });
  });

  it('is idempotent for a key that is already registered', async () => {
    const { service, prisma } = makeService();
    prisma.mediaAsset.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(service.register(REGISTER_DTO)).resolves.toEqual({ id: 'existing' });
    expect(prisma.mediaAsset.create).not.toHaveBeenCalled();
  });
});

describe('findAll', () => {
  it('returns every asset newest first', async () => {
    const { service, prisma } = makeService();
    prisma.mediaAsset.findMany.mockResolvedValue([]);
    await service.findAll();
    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('filters by kind', async () => {
    const { service, prisma } = makeService();
    prisma.mediaAsset.findMany.mockResolvedValue([]);
    await service.findAll(MediaKind.PDF);
    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith({
      where: { kind: MediaKind.PDF },
      orderBy: { createdAt: 'desc' },
    });
  });
});

describe('remove', () => {
  it('deletes the R2 object and then the registry row', async () => {
    const { service, prisma, storage } = makeService();
    prisma.mediaAsset.findUnique.mockResolvedValue({
      id: 'asset-1',
      url: `${PUBLIC_URL}/uploads/abc.png`,
    });
    prisma.mediaAsset.delete.mockResolvedValue({ id: 'asset-1' });

    await expect(service.remove('asset-1')).resolves.toEqual({ id: 'asset-1' });
    expect(storage.deleteObject).toHaveBeenCalledWith('uploads/abc.png');
    expect(prisma.mediaAsset.delete).toHaveBeenCalledWith({ where: { id: 'asset-1' } });
  });

  it('still drops the row when the R2 delete fails, so the UI cannot show a dead asset', async () => {
    const { service, prisma, storage } = makeService();
    prisma.mediaAsset.findUnique.mockResolvedValue({
      id: 'asset-1',
      url: `${PUBLIC_URL}/uploads/abc.png`,
    });
    storage.deleteObject = jest.fn().mockRejectedValue(new Error('R2 unreachable'));
    prisma.mediaAsset.delete.mockResolvedValue({ id: 'asset-1' });

    await expect(service.remove('asset-1')).resolves.toEqual({ id: 'asset-1' });
    expect(prisma.mediaAsset.delete).toHaveBeenCalled();
  });

  it('404s for an unknown id', async () => {
    const { service, prisma } = makeService();
    prisma.mediaAsset.findUnique.mockResolvedValue(null);
    await expect(service.remove('nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses to touch R2 when the URL is not one of ours', async () => {
    const { service, prisma, storage } = makeService();
    prisma.mediaAsset.findUnique.mockResolvedValue({
      id: 'asset-1',
      url: 'https://evil.example.com/uploads/abc.png',
    });

    await expect(service.remove('asset-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.deleteObject).not.toHaveBeenCalled();
    expect(prisma.mediaAsset.delete).not.toHaveBeenCalled();
  });
});