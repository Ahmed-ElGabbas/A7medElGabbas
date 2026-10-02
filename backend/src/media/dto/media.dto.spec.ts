import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { MAX_UPLOAD_BYTES, PresignMediaDto, RegisterMediaDto } from './media.dto';

/** Mirrors the global ValidationPipe: transform + whitelist + forbid unknown. */
async function check<T extends object>(
  cls: new () => T,
  payload: Record<string, unknown>,
): Promise<string[]> {
  const instance = plainToInstance(cls, payload);
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.flatMap((e) => Object.values(e.constraints ?? {}));
}

const VALID = {
  contentType: 'image/png',
  originalFilename: 'screenshot.png',
  size: 2048,
};

describe('PresignMediaDto', () => {
  it('caps uploads at 25 MB', () => {
    expect(MAX_UPLOAD_BYTES).toBe(26_214_400);
  });

  it('accepts a well-formed image upload', async () => {
    await expect(check(PresignMediaDto, VALID)).resolves.toEqual([]);
  });

  it('accepts a pdf upload', async () => {
    await expect(
      check(PresignMediaDto, { ...VALID, contentType: 'application/pdf' }),
    ).resolves.toEqual([]);
  });

  it.each([
    'text/html',
    'application/javascript',
    'image/bmp',
    'application/zip',
    '',
  ])('rejects contentType %p', async (contentType) => {
    const errors = await check(PresignMediaDto, { ...VALID, contentType });
    expect(errors.join(' ')).toMatch(/contentType/);
  });

  it('rejects a size over the ceiling', async () => {
    const errors = await check(PresignMediaDto, {
      ...VALID,
      size: MAX_UPLOAD_BYTES + 1,
    });
    expect(errors.join(' ')).toMatch(/size/);
  });

  it('rejects a zero or negative size', async () => {
    await expect(check(PresignMediaDto, { ...VALID, size: 0 })).resolves.not.toEqual([]);
    await expect(check(PresignMediaDto, { ...VALID, size: -1 })).resolves.not.toEqual([]);
  });

  it('rejects a non-integer size', async () => {
    await expect(
      check(PresignMediaDto, { ...VALID, size: 12.5 }),
    ).resolves.not.toEqual([]);
  });

  it('requires a filename', async () => {
    const errors = await check(PresignMediaDto, { ...VALID, originalFilename: '' });
    expect(errors.join(' ')).toMatch(/originalFilename/);
  });

  it('trims surrounding whitespace from the filename', async () => {
    const instance = plainToInstance(PresignMediaDto, {
      ...VALID,
      originalFilename: '  spaced.png  ',
    });
    expect(instance.originalFilename).toBe('spaced.png');
  });

  it('rejects unknown properties instead of silently dropping them', async () => {
    const errors = await check(PresignMediaDto, { ...VALID, sneaky: 'value' });
    expect(errors.join(' ')).toMatch(/sneaky/);
  });
});

describe('RegisterMediaDto', () => {
  const KEYED = { ...VALID, key: 'uploads/abc123.png', kind: 'IMAGE' };

  it('accepts a clean key', async () => {
    await expect(check(RegisterMediaDto, KEYED)).resolves.toEqual([]);
  });

  it('requires a key', async () => {
    const errors = await check(RegisterMediaDto, { ...VALID, kind: 'IMAGE' });
    expect(errors.join(' ')).toMatch(/key/);
  });

  it('rejects a key with a leading slash', async () => {
    const errors = await check(RegisterMediaDto, { ...KEYED, key: '/uploads/abc.png' });
    expect(errors.join(' ')).toMatch(/key/);
  });

  it('rejects a traversal key', async () => {
    const errors = await check(RegisterMediaDto, {
      ...KEYED,
      key: 'uploads/../../etc/passwd',
    });
    expect(errors.join(' ')).toMatch(/key/);
  });

  it('rejects a key containing a space', async () => {
    const errors = await check(RegisterMediaDto, { ...KEYED, key: 'uploads/a b.png' });
    expect(errors.join(' ')).toMatch(/key/);
  });

  it('inherits the PresignMediaDto rules', async () => {
    const errors = await check(RegisterMediaDto, {
      ...KEYED,
      contentType: 'text/html',
    });
    expect(errors.join(' ')).toMatch(/contentType/);
  });

  it('rejects an unknown kind', async () => {
    const errors = await check(RegisterMediaDto, { ...KEYED, kind: 'VIDEO' });
    expect(errors.join(' ')).toMatch(/kind/);
  });

  it('accepts PDF kind', async () => {
    await expect(check(RegisterMediaDto, { ...KEYED, kind: 'PDF' })).resolves.toEqual([]);
  });
});