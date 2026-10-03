import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerStorageService,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { contactRateLimit } from './contact-rate-limit';

/**
 * Exercises the real ThrottlerGuard against its real in-memory storage, with
 * only the HTTP context faked.
 *
 * This is what proves the *wiring* — ttl in milliseconds, per-IP keying, 429 on
 * the fourth hit — rather than just the arithmetic in contactRateLimit, which
 * contact-rate-limit.spec.ts covers on its own.
 */

interface Harness {
  guard: ThrottlerGuard;
  storage: ThrottlerStorageService;
  headers: { name: string; value: number }[];
  post(ip: string): ExecutionContext;
  adminGet(ip: string): ExecutionContext;
}

function makeContext(
  ip: string,
  handlerName: 'create' | 'findAll',
  sink: { name: string; value: number }[],
): ExecutionContext {
  const res = { header: (name: string, value: number) => sink.push({ name, value }) };
  const req = { ip, headers: { 'user-agent': 'jest' }, method: 'POST' };

  // The guard folds the class and handler names into its key, so the fake
  // context has to vary the handler the way distinct routes would.
  class ContactController {}
  const handlers = {
    create(this: unknown) {
      return req;
    },
    findAll(this: unknown) {
      return req;
    },
  };

  return {
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    getHandler: () => handlers[handlerName],
    getClass: () => ContactController,
  } as unknown as ExecutionContext;
}

async function makeHarness(env: Record<string, string | undefined> = {}): Promise<Harness> {
  const { ttlMs, limit } = contactRateLimit(env);
  const options: ThrottlerModuleOptions = [{ ttl: ttlMs, limit }];

  const storage = new ThrottlerStorageService();
  openStorages.push(storage);
  const guard = new ThrottlerGuard(options, storage, new Reflector());
  // Nest calls this on boot; outside a container it has to be invoked by hand or
  // the guard has an empty throttler list and allows everything.
  await guard.onModuleInit();

  const headers: { name: string; value: number }[] = [];

  return {
    guard,
    storage,
    headers,
    post: (ip: string) => makeContext(ip, 'create', headers),
    adminGet: (ip: string) => makeContext(ip, 'findAll', headers),
  };
}

/// Tracked so every harness's sweep interval is cleared; the storage keeps one
/// setInterval alive for its whole lifetime.
const openStorages: ThrottlerStorageService[] = [];

afterEach(() => {
  while (openStorages.length > 0) {
    openStorages.pop()?.onApplicationShutdown();
  }
  jest.useRealTimers();
});

describe('POST /contact rate limiting', () => {
  it('allows exactly three submissions from one IP, then rejects the fourth', async () => {
    const { guard, post } = await makeHarness();

    await expect(guard.canActivate(post('203.0.113.7'))).resolves.toBe(true);
    await expect(guard.canActivate(post('203.0.113.7'))).resolves.toBe(true);
    await expect(guard.canActivate(post('203.0.113.7'))).resolves.toBe(true);

    await expect(guard.canActivate(post('203.0.113.7'))).rejects.toBeInstanceOf(
      ThrottlerException,
    );
  });

  it('rejects with 429, which the global exception filter renders as HTTP 429', async () => {
    const { guard, post } = await makeHarness();

    await guard.canActivate(post('203.0.113.7'));
    await guard.canActivate(post('203.0.113.7'));
    await guard.canActivate(post('203.0.113.7'));

    await expect(guard.canActivate(post('203.0.113.7'))).rejects.toMatchObject({ status: 429 });
  });

  it('tracks each IP separately, so one visitor cannot lock out another', async () => {
    const { guard, post } = await makeHarness();

    await guard.canActivate(post('203.0.113.7'));
    await guard.canActivate(post('203.0.113.7'));
    await guard.canActivate(post('203.0.113.7'));

    await expect(guard.canActivate(post('203.0.113.7'))).rejects.toBeInstanceOf(
      ThrottlerException,
    );
    await expect(guard.canActivate(post('198.51.100.9'))).resolves.toBe(true);
  });

  it('publishes the remaining quota in the response headers', async () => {
    const { guard, post, headers } = await makeHarness();

    await guard.canActivate(post('203.0.113.7'));
    await guard.canActivate(post('203.0.113.7'));
    await guard.canActivate(post('203.0.113.7'));

    // The same header is set on every request, so the last value written is the
    // one the final response carried.
    const last = (name: string): number | undefined =>
      headers.filter((h) => h.name === name).at(-1)?.value;

    expect(last('X-RateLimit-Remaining')).toBe(0);
    expect(last('X-RateLimit-Limit')).toBe(3);
  });

  it('sets Retry-After once the limit is hit', async () => {
    const { guard, post, headers } = await makeHarness();

    for (let i = 0; i < 4; i += 1) {
      await guard.canActivate(post('203.0.113.7')).catch(() => undefined);
    }

    expect(
      headers.filter((h) => h.name === 'Retry-After').at(-1)?.value,
    ).toBeGreaterThan(0);
  });

  it('honours a configured limit instead of the default', async () => {
    const { guard, post } = await makeHarness({ CONTACT_RATE_LIMIT: '1' });

    await expect(guard.canActivate(post('203.0.113.7'))).resolves.toBe(true);
    await expect(guard.canActivate(post('203.0.113.7'))).rejects.toBeInstanceOf(
      ThrottlerException,
    );
  });

  it('lets the quota recover once the window has elapsed', async () => {
    jest.useFakeTimers();
    const { guard, post, storage } = await makeHarness({ CONTACT_RATE_WINDOW: '1m' });

    await guard.canActivate(post('203.0.113.7'));
    await guard.canActivate(post('203.0.113.7'));
    await guard.canActivate(post('203.0.113.7'));
    await expect(guard.canActivate(post('203.0.113.7'))).rejects.toBeInstanceOf(
      ThrottlerException,
    );

    jest.advanceTimersByTime(61_000);

    await expect(guard.canActivate(post('203.0.113.7'))).resolves.toBe(true);

    storage.onApplicationShutdown();
    jest.useRealTimers();
  });

  it('keeps separate counters per handler, so a second public route is not throttled by this one', async () => {
    const { guard, post, adminGet } = await makeHarness({ CONTACT_RATE_LIMIT: '1' });

    await expect(guard.canActivate(post('203.0.113.7'))).resolves.toBe(true);
    await expect(guard.canActivate(post('203.0.113.7'))).rejects.toBeInstanceOf(
      ThrottlerException,
    );
    await expect(guard.canActivate(adminGet('203.0.113.7'))).resolves.toBe(true);
  });
});