import { Logger, ServiceUnavailableException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { RESEND_TEST_FROM, ResendService } from './resend.service';

/**
 * STUBBED LIVE SEND — the only place a real network call could happen is
 * `Resend.emails.send`, and the SDK module is mocked here so no test ever opens
 * a socket to Resend. Same approach as the R2 presign stub in Stage 1
 * (r2.storage.spec.ts).
 *
 * The mock has to be named with a `mock` prefix: jest hoists these factories
 * above the const declarations and only allows references to mock* variables.
 */
const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

const FULL_ENV: Record<string, string> = {
  RESEND_API_KEY: 're_test_key',
  ADMIN_NOTIFICATION_EMAIL: 'owner@example.com',
  FRONTEND_URL: 'https://ahmedelgabbas.dev',
};

function makeService(values: Record<string, string> = FULL_ENV): ResendService {
  const config = { get: (key: string) => values[key] } as unknown as ConfigService;
  return new ResendService(config);
}

const EMAIL = {
  to: 'owner@example.com',
  replyTo: 'john@example.com',
  subject: 'New portfolio contact submission from John Doe',
  text: 'plain',
  html: '<p>html</p>',
};

beforeEach(() => {
  mockSend.mockReset();
  mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });
});

describe('config gating', () => {
  it('reports every required var missing when the env is empty', () => {
    const service = makeService({});
    expect(service.missingConfig()).toEqual(['RESEND_API_KEY', 'ADMIN_NOTIFICATION_EMAIL']);
    expect(service.isConfigured()).toBe(false);
  });

  it('treats a quoted-empty value as missing', () => {
    expect(makeService({ ...FULL_ENV, RESEND_API_KEY: '   ' }).missingConfig()).toEqual([
      'RESEND_API_KEY',
    ]);
  });

  it('is configured when both vars are present', () => {
    expect(makeService().isConfigured()).toBe(true);
  });

  it('never reports FRONTEND_URL as required, since a relative link still works', () => {
    expect(makeService().missingConfig()).toEqual([]);
  });
});

describe('fromAddress', () => {
  it('uses the configured sender', () => {
    const service = makeService({
      ...FULL_ENV,
      NOTIFICATION_FROM_EMAIL: 'Portfolio <notifications@example.com>',
    });
    expect(service.fromAddress()).toBe('Portfolio <notifications@example.com>');
  });

  it("falls back to Resend's test sender when none is configured", () => {
    expect(makeService().fromAddress()).toBe(RESEND_TEST_FROM);
  });

  it('ignores a whitespace-only sender', () => {
    expect(makeService({ ...FULL_ENV, NOTIFICATION_FROM_EMAIL: '  ' }).fromAddress()).toBe(
      RESEND_TEST_FROM,
    );
  });
});

describe('frontendUrl and recipient', () => {
  it('reads and trims both values', () => {
    const service = makeService({
      ...FULL_ENV,
      FRONTEND_URL: '  https://example.com  ',
      ADMIN_NOTIFICATION_EMAIL: '  owner@example.com ',
    });
    expect(service.frontendUrl()).toBe('https://example.com');
    expect(service.recipient()).toBe('owner@example.com');
  });

  it('returns an empty string rather than undefined when unset', () => {
    const values: Record<string, string> = { ...FULL_ENV };
    delete values.FRONTEND_URL;
    expect(makeService(values).frontendUrl()).toBe('');
  });
});

describe('send', () => {
  it('forwards the message to the SDK with the configured sender', async () => {
    await expect(makeService().send(EMAIL)).resolves.toEqual({ id: 'email-1' });

    expect(mockSend).toHaveBeenCalledWith({
      from: RESEND_TEST_FROM,
      to: 'owner@example.com',
      replyTo: 'john@example.com',
      subject: 'New portfolio contact submission from John Doe',
      text: 'plain',
      html: '<p>html</p>',
    });
  });

  it('uses the configured sender when one is set', async () => {
    await makeService({ ...FULL_ENV, NOTIFICATION_FROM_EMAIL: 'N <n@example.com>' }).send(EMAIL);
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ from: 'N <n@example.com>' }));
  });

  it('throws when Resend resolves with an error instead of rejecting', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'API key is invalid' } });

    await expect(makeService().send(EMAIL)).rejects.toThrow(/API key is invalid/);
  });

  it('propagates a transport-level rejection', async () => {
    mockSend.mockRejectedValue(new Error('socket hang up'));
    await expect(makeService().send(EMAIL)).rejects.toThrow('socket hang up');
  });

  it('rejects with 503 and names the missing vars when unconfigured', async () => {
    await expect(makeService({}).send(EMAIL)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(makeService({}).send(EMAIL)).rejects.toThrow(/RESEND_API_KEY/);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('logs the incomplete config so the cause is visible server-side', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    await expect(makeService({}).send(EMAIL)).rejects.toThrow();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('RESEND_API_KEY'));
    warn.mockRestore();
  });
});