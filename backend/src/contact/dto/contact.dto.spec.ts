import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CONTACT_LIMITS,
  CreateContactSubmissionDto,
  MarkSubmissionReadDto,
} from './contact.dto';

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
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Flutter app',
  message: 'I would like to discuss a project.',
};

describe('CreateContactSubmissionDto', () => {
  it('accepts a complete submission', async () => {
    await expect(check(CreateContactSubmissionDto, VALID)).resolves.toEqual([]);
  });

  it('accepts a submission with no subject, as the live form allows', async () => {
    await expect(
      check(CreateContactSubmissionDto, { ...VALID, subject: undefined }),
    ).resolves.toEqual([]);
  });

  it('accepts an empty-string subject', async () => {
    await expect(check(CreateContactSubmissionDto, { ...VALID, subject: '' })).resolves.toEqual(
      [],
    );
  });

  it('trims whitespace from name and message', async () => {
    const instance = plainToInstance(CreateContactSubmissionDto, {
      ...VALID,
      name: '  John Doe  ',
      message: '  hello  ',
    });
    expect(instance.name).toBe('John Doe');
    expect(instance.message).toBe('hello');
  });

  it('normalises the email to lowercase', async () => {
    const instance = plainToInstance(CreateContactSubmissionDto, {
      ...VALID,
      email: '  John.Doe@Example.COM ',
    });
    expect(instance.email).toBe('john.doe@example.com');
  });

  it('rejects a whitespace-only name, which trimming empties', async () => {
    const errors = await check(CreateContactSubmissionDto, { ...VALID, name: '   ' });
    expect(errors.join(' ')).toMatch(/name/);
  });

  it('rejects a whitespace-only message', async () => {
    const errors = await check(CreateContactSubmissionDto, { ...VALID, message: '   ' });
    expect(errors.join(' ')).toMatch(/message/);
  });

  it.each([
    'not-an-email',
    'missing@tld',
    '@example.com',
    'two@@example.com',
    'spaces in@example.com',
  ])('rejects the malformed email %p', async (email) => {
    const errors = await check(CreateContactSubmissionDto, { ...VALID, email });
    expect(errors.join(' ')).toMatch(/email/);
  });

  it('requires a message', async () => {
    const { message: _omitted, ...withoutMessage } = VALID;
    const errors = await check(CreateContactSubmissionDto, withoutMessage);
    expect(errors.join(' ')).toMatch(/message/);
  });

  it('rejects unknown properties instead of silently dropping them', async () => {
    const errors = await check(CreateContactSubmissionDto, { ...VALID, isAdmin: true });
    expect(errors.join(' ')).toMatch(/isAdmin/);
  });

  describe('server-side length caps', () => {
    it('caps the name', async () => {
      const errors = await check(CreateContactSubmissionDto, {
        ...VALID,
        name: 'a'.repeat(CONTACT_LIMITS.name + 1),
      });
      expect(errors.join(' ')).toMatch(/name/);
    });

    it('accepts a name exactly at the cap', async () => {
      await expect(
        check(CreateContactSubmissionDto, { ...VALID, name: 'a'.repeat(CONTACT_LIMITS.name) }),
      ).resolves.toEqual([]);
    });

    it('caps the subject', async () => {
      const errors = await check(CreateContactSubmissionDto, {
        ...VALID,
        subject: 'a'.repeat(CONTACT_LIMITS.subject + 1),
      });
      expect(errors.join(' ')).toMatch(/subject/);
    });

    it('caps the message', async () => {
      const errors = await check(CreateContactSubmissionDto, {
        ...VALID,
        message: 'a'.repeat(CONTACT_LIMITS.message + 1),
      });
      expect(errors.join(' ')).toMatch(/message/);
    });

    it('caps the email at the RFC 5321 maximum', async () => {
      const long = `${'a'.repeat(CONTACT_LIMITS.email - 10)}@example.com`;
      expect(long.length).toBeGreaterThan(CONTACT_LIMITS.email);
      const errors = await check(CreateContactSubmissionDto, { ...VALID, email: long });
      expect(errors.join(' ')).toMatch(/email/);
    });

    it('caps the honeypot so it cannot be used as a free-text channel', async () => {
      const errors = await check(CreateContactSubmissionDto, {
        ...VALID,
        website: 'a'.repeat(CONTACT_LIMITS.honeypot + 1),
      });
      expect(errors.join(' ')).toMatch(/website/);
    });
  });

  describe('honeypot', () => {
    it('accepts an absent honeypot', async () => {
      await expect(check(CreateContactSubmissionDto, VALID)).resolves.toEqual([]);
    });

    it('accepts an empty honeypot, which is what a real browser sends', async () => {
      await expect(check(CreateContactSubmissionDto, { ...VALID, website: '' })).resolves.toEqual(
        [],
      );
    });

    it('still accepts a filled honeypot — the decision belongs to the service', async () => {
      await expect(
        check(CreateContactSubmissionDto, { ...VALID, website: 'http://spam.example' }),
      ).resolves.toEqual([]);
    });
  });
});

describe('MarkSubmissionReadDto', () => {
  it('accepts an empty body, defaulting to read', async () => {
    await expect(check(MarkSubmissionReadDto, {})).resolves.toEqual([]);
  });

  it('accepts read: false so a submission can be moved back to unread', async () => {
    await expect(check(MarkSubmissionReadDto, { read: false })).resolves.toEqual([]);
  });

  it('rejects a non-boolean', async () => {
    const errors = await check(MarkSubmissionReadDto, { read: 'yes' });
    expect(errors.join(' ')).toMatch(/read/);
  });

  it('rejects unknown properties', async () => {
    const errors = await check(MarkSubmissionReadDto, { id: 'x' });
    expect(errors.join(' ')).toMatch(/id/);
  });
});