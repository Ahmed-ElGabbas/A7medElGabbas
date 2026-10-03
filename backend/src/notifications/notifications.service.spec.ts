import { Logger } from '@nestjs/common';
import type { ContactSubmission } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import type { ResendService } from './resend.service';
import type { SubmissionForEmail } from './submission-email';

/**
 * The Resend transport is stubbed wholesale here, so nothing in this suite can
 * reach the network — the live-send boundary is confined to ResendService and is
 * covered (also stubbed) in resend.service.spec.ts.
 */
function makeResend(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    missingConfig: jest.fn().mockReturnValue([]),
    isConfigured: jest.fn().mockReturnValue(true),
    fromAddress: jest.fn().mockReturnValue('Portfolio <onboarding@resend.dev>'),
    frontendUrl: jest.fn().mockReturnValue('https://ahmedelgabbas.dev'),
    recipient: jest.fn().mockReturnValue('owner@example.com'),
    send: jest.fn().mockResolvedValue({ id: 'email-1' }),
    ...overrides,
  };
}

function makeService(resendOverrides: Record<string, unknown> = {}) {
  const resend = makeResend(resendOverrides);
  const service = new NotificationsService(resend as unknown as ResendService);
  return { service, resend };
}

const SUBMISSION: SubmissionForEmail = {
  id: 'clx123abc',
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Flutter mobile application',
  message: 'I would like to discuss a project.',
  createdAt: new Date('2026-02-14T09:30:00.000Z'),
};

let errorSpy: jest.SpyInstance;
let warnSpy: jest.SpyInstance;

beforeEach(() => {
  errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('status', () => {
  it('reports configured when nothing is missing', () => {
    const { service } = makeService();
    expect(service.status()).toEqual({ configured: true, missing: [] });
  });

  it('lists the missing vars so the admin inbox can explain itself', () => {
    const { service } = makeService({
      missingConfig: jest.fn().mockReturnValue(['RESEND_API_KEY']),
    });
    expect(service.status()).toEqual({ configured: false, missing: ['RESEND_API_KEY'] });
  });
});

describe('notifyNewSubmission', () => {
  it('sends one message to the configured recipient', async () => {
    const { service, resend } = makeService();

    await expect(service.notifyNewSubmission(SUBMISSION)).resolves.toBe(true);
    expect(resend.send).toHaveBeenCalledTimes(1);
    expect(resend.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'owner@example.com' }),
    );
  });

  it("sets reply-to to the sender, so Reply reaches the visitor", async () => {
    const { service, resend } = makeService();

    await service.notifyNewSubmission(SUBMISSION);

    expect(resend.send).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: 'john@example.com' }),
    );
  });

  it('carries the rendered subject, text and html built from the submission', async () => {
    const { service, resend } = makeService();

    await service.notifyNewSubmission(SUBMISSION);

    const sent = resend.send.mock.calls[0][0] as Record<string, string>;
    expect(sent.subject).toBe('New portfolio contact submission from John Doe');
    expect(sent.text).toContain('I would like to discuss a project.');
    expect(sent.html).toContain('I would like to discuss a project.');
  });

  it('builds the deep link from the configured frontend URL', async () => {
    const { service, resend } = makeService({
      frontendUrl: jest.fn().mockReturnValue('https://preview.example.com'),
    });

    await service.notifyNewSubmission(SUBMISSION);

    expect(resend.send).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining(
          'https://preview.example.com/admin/contact?submission=clx123abc',
        ),
      }),
    );
  });

  it('logs the delivery id on success', async () => {
    const logSpy = jest.spyOn(Logger.prototype, 'log');
    const { service } = makeService();

    await service.notifyNewSubmission(SUBMISSION);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('clx123abc'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('email-1'));
  });

  describe('fail-safe', () => {
    it('swallows a rejected send instead of propagating it to the request', async () => {
      const { service } = makeService({
        send: jest.fn().mockRejectedValue(new Error('Resend is down')),
      });

      await expect(service.notifyNewSubmission(SUBMISSION)).resolves.toBe(false);
    });

    it('logs the failure with the stack so it is diagnosable', async () => {
      const { service } = makeService({
        send: jest.fn().mockRejectedValue(new Error('Resend is down')),
      });

      await service.notifyNewSubmission(SUBMISSION);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('clx123abc'),
        expect.stringContaining('Resend is down'),
      );
    });

    it('makes clear the submission itself is unaffected', async () => {
      const { service } = makeService({
        send: jest.fn().mockRejectedValue(new Error('boom')),
      });

      await service.notifyNewSubmission(SUBMISSION);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('The submission is saved'),
        expect.anything(),
      );
    });

    it('handles a non-Error rejection without losing the detail', async () => {
      const { service } = makeService({
        send: jest.fn().mockRejectedValue('a bare string'),
      });

      await expect(service.notifyNewSubmission(SUBMISSION)).resolves.toBe(false);
      expect(errorSpy).toHaveBeenCalledWith(expect.any(String), 'a bare string');
    });

    it('never rejects, whatever the transport does', async () => {
      const hostile = makeService({
        send: jest.fn().mockImplementation(() => {
          throw new Error('synchronous explosion');
        }),
      });

      await expect(hostile.service.notifyNewSubmission(SUBMISSION)).resolves.toBe(false);
    });
  });

  describe('when Resend is not configured', () => {
    it('skips the send entirely', async () => {
      const { service, resend } = makeService({
        isConfigured: jest.fn().mockReturnValue(false),
        missingConfig: jest.fn().mockReturnValue(['RESEND_API_KEY']),
      });

      await expect(service.notifyNewSubmission(SUBMISSION)).resolves.toBe(false);
      expect(resend.send).not.toHaveBeenCalled();
    });

    it('warns and says the submission is still stored', async () => {
      const { service } = makeService({
        isConfigured: jest.fn().mockReturnValue(false),
        missingConfig: jest.fn().mockReturnValue(['RESEND_API_KEY']),
      });

      await service.notifyNewSubmission(SUBMISSION);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('RESEND_API_KEY'),
      );
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('admin inbox'));
    });
  });
});

describe('SubmissionForEmail', () => {
  it('accepts a full database row without transformation', () => {
    const row = {
      ...SUBMISSION,
      subject: '',
      ipHash: 'hash',
      userAgent: null,
      read: false,
    } as unknown as ContactSubmission;

    const { service, resend } = makeService();
    void service.notifyNewSubmission(row);

    expect(resend.send).toHaveBeenCalled();
  });
});