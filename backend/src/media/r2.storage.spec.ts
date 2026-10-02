import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import type { PresignMediaDto } from './dto/media.dto';
import { R2StorageService, extensionFor } from './r2.storage';

/**
 * The AWS SDK is mocked so no test ever opens a socket to Cloudflare. Only the
 * two constructors under test are replaced; the real command classes stay so
 * assertions can read `.input` off the captured command.
 *
 * The `mock` prefix is required: jest hoists these factories above the const
 * declarations and only permits references to variables named mock*.
 */
const mockSend = jest.fn().mockResolvedValue({});
const mockGetSignedUrl = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({ send: mockSend })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]) => mockGetSignedUrl(...args),
}));

const FULL_ENV: Record<string, string> = {
  R2_ACCOUNT_ID: 'acct123',
  R2_ACCESS_KEY_ID: 'AKIAEXAMPLE',
  R2_SECRET_ACCESS_KEY: 'secret',
  R2_BUCKET: 'portfolio',
  R2_PUBLIC_URL: 'https://cdn.example.com',
};

function makeService(values: Record<string, string> = FULL_ENV): R2StorageService {
  const config = {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
  return new R2StorageService(config);
}

function dto(overrides: Partial<PresignMediaDto> = {}): PresignMediaDto {
  return {
    contentType: 'image/png',
    originalFilename: 'screenshot.png',
    size: 1024,
    ...overrides,
  } as PresignMediaDto;
}

beforeEach(() => {
  mockSend.mockClear();
  mockGetSignedUrl.mockReset();
  mockGetSignedUrl.mockResolvedValue('https://signed.example.com/put');
});

describe('extensionFor', () => {
  it.each([
    ['image/png', '.png'],
    ['image/jpeg', '.jpg'],
    ['image/webp', '.webp'],
    ['image/gif', '.gif'],
    ['image/avif', '.avif'],
    ['image/svg+xml', '.svg'],
    ['application/pdf', '.pdf'],
  ])('maps %s to %s', (mime, expected) => {
    expect(extensionFor(mime, 'anything.bin')).toBe(expected);
  });

  it('is case-insensitive on the content type', () => {
    expect(extensionFor('IMAGE/PNG', 'x')).toBe('.png');
  });

  it('falls back to the filename extension for unknown types', () => {
    expect(extensionFor('application/zip', 'archive.TAR')).toBe('.tar');
  });

  it('returns an empty string when nothing identifies an extension', () => {
    expect(extensionFor('application/zip', 'noextension')).toBe('');
  });

  it('ignores a filename extension that is not at the end', () => {
    expect(extensionFor('application/zip', 'report.pdf.exe')).toBe('.exe');
  });
});

describe('buildKey', () => {
  it('puts the object under uploads/ with the mime-derived extension', () => {
    expect(makeService().buildKey(dto())).toMatch(
      /^uploads\/[a-z0-9]+-[a-z0-9]+\.png$/,
    );
  });

  it('uses the pdf extension for pdf uploads', () => {
    expect(makeService().buildKey(dto({ contentType: 'application/pdf' }))).toMatch(/\.pdf$/);
  });

  it('does not leak the user-supplied filename into the key', () => {
    const key = makeService().buildKey(
      dto({ originalFilename: '../../etc/passwd.png' }),
    );
    expect(key).not.toContain('passwd');
    expect(key).not.toContain('..');
    expect(key).toMatch(/^uploads\//);
  });

  it('produces a different key on each call', () => {
    const service = makeService();
    const keys = new Set(Array.from({ length: 50 }, () => service.buildKey(dto())));
    expect(keys.size).toBe(50);
  });
});

describe('buildPublicUrl', () => {
  it('joins the base and key', () => {
    expect(makeService().buildPublicUrl('uploads/a.png')).toBe(
      'https://cdn.example.com/uploads/a.png',
    );
  });

  it('normalises a trailing slash on the base', () => {
    const service = makeService({ ...FULL_ENV, R2_PUBLIC_URL: 'https://cdn.example.com/' });
    expect(service.buildPublicUrl('uploads/a.png')).toBe(
      'https://cdn.example.com/uploads/a.png',
    );
  });

  it('normalises several trailing slashes', () => {
    const service = makeService({ ...FULL_ENV, R2_PUBLIC_URL: 'https://cdn.example.com///' });
    expect(service.buildPublicUrl('uploads/a.png')).toBe(
      'https://cdn.example.com/uploads/a.png',
    );
  });
});

describe('keyFromPublicUrl', () => {
  it('round-trips a key built by buildKey', () => {
    const service = makeService();
    const key = service.buildKey(dto());
    expect(service.keyFromPublicUrl(service.buildPublicUrl(key))).toBe(key);
  });

  it('rejects a URL on a different origin', () => {
    expect(
      makeService().keyFromPublicUrl('https://evil.example.com/uploads/a.png'),
    ).toBeUndefined();
  });

  it('rejects a key outside the uploads/ prefix', () => {
    expect(
      makeService().keyFromPublicUrl('https://cdn.example.com/secrets/a.png'),
    ).toBeUndefined();
  });

  it('rejects a traversal attempt in the key', () => {
    expect(
      makeService().keyFromPublicUrl('https://cdn.example.com/uploads/../../etc/passwd'),
    ).toBeUndefined();
  });

  it('rejects everything when the public base is unset', () => {
    const service = makeService({ ...FULL_ENV, R2_PUBLIC_URL: '' });
    expect(service.keyFromPublicUrl('https://cdn.example.com/uploads/a.png')).toBeUndefined();
  });
});

describe('config gating', () => {
  it('reports every required var missing when the env is empty', () => {
    const service = makeService({});
    expect(service.missingConfig()).toEqual([
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET',
      'R2_PUBLIC_URL',
    ]);
    expect(service.isConfigured()).toBe(false);
  });

  it('treats a quoted-empty value as missing', () => {
    const service = makeService({ ...FULL_ENV, R2_BUCKET: '   ' });
    expect(service.missingConfig()).toEqual(['R2_BUCKET']);
  });

  it('is configured when all five vars are present', () => {
    const service = makeService();
    expect(service.missingConfig()).toEqual([]);
    expect(service.isConfigured()).toBe(true);
  });

  it('builds an account-scoped endpoint', () => {
    expect(makeService().buildEndpoint()).toBe(
      'https://acct123.r2.cloudflarestorage.com',
    );
  });
});

describe('presignPut', () => {
  it('signs a PutObject carrying the bucket, key and content type', async () => {
    const result = await makeService().presignPut(dto(), 'uploads/key.png');

    const [client, command, options] = mockGetSignedUrl.mock.calls[0];
    expect(client).toBeDefined();
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toEqual({
      Bucket: 'portfolio',
      Key: 'uploads/key.png',
      ContentType: 'image/png',
    });
    expect(options).toEqual({ expiresIn: 300 });

    expect(result).toEqual({
      key: 'uploads/key.png',
      uploadUrl: 'https://signed.example.com/put',
      publicUrl: 'https://cdn.example.com/uploads/key.png',
      expiresInSeconds: 300,
    });
  });

  it('does not sign ContentLength, which intermediaries can rewrite', async () => {
    await makeService().presignPut(dto({ size: 4096 }), 'uploads/key.png');
    const command = mockGetSignedUrl.mock.calls[0][1] as PutObjectCommand;
    expect(command.input).not.toHaveProperty('ContentLength');
  });

  it('rejects with 503 and names the missing vars when unconfigured', async () => {
    await expect(
      makeService({}).presignPut(dto(), 'uploads/key.png'),
    ).rejects.toThrow(/R2_ACCOUNT_ID/);
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
  });
});

describe('deleteObject', () => {
  it('sends a DeleteObject for the bucket and key', async () => {
    await makeService().deleteObject('uploads/key.png');

    const command = mockSend.mock.calls[0][0] as DeleteObjectCommand;
    expect(command).toBeInstanceOf(DeleteObjectCommand);
    expect(command.input).toEqual({ Bucket: 'portfolio', Key: 'uploads/key.png' });
  });

  it('refuses to sign when unconfigured', async () => {
    await expect(makeService({}).deleteObject('uploads/key.png')).rejects.toThrow(
      /R2 is not configured/,
    );
    expect(mockSend).not.toHaveBeenCalled();
  });
});