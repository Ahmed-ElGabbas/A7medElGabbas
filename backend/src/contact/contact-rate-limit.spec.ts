import {
  CONTACT_RATE_LIMIT,
  CONTACT_RATE_WINDOW_SECONDS,
  contactRateLimit,
} from './contact-rate-limit';

describe('contactRateLimit', () => {
  it('defaults to 3 submissions per 15 minutes, per BACKEND_PLAN.md 4.4', () => {
    expect(contactRateLimit({})).toEqual({
      limit: 3,
      ttlMs: 900_000,
      windowSeconds: 900,
    });
  });

  it('keeps the documented defaults as named constants', () => {
    expect(CONTACT_RATE_LIMIT).toBe(3);
    expect(CONTACT_RATE_WINDOW_SECONDS).toBe(900);
  });

  it('converts the window to milliseconds, which is what the throttler expects', () => {
    const { ttlMs, windowSeconds } = contactRateLimit({ CONTACT_RATE_WINDOW: '1m' });
    expect(windowSeconds).toBe(60);
    expect(ttlMs).toBe(60_000);
  });

  it.each([
    ['30s', 30],
    ['15m', 900],
    ['2h', 7200],
    ['1d', 86400],
    ['900', 900],
  ])('parses the %p window shorthand', (input, seconds) => {
    expect(contactRateLimit({ CONTACT_RATE_WINDOW: input }).windowSeconds).toBe(seconds);
  });

  it('reads the limit from the environment', () => {
    expect(contactRateLimit({ CONTACT_RATE_LIMIT: '7' }).limit).toBe(7);
  });

  it('tolerates surrounding whitespace', () => {
    expect(contactRateLimit({ CONTACT_RATE_LIMIT: ' 5 ', CONTACT_RATE_WINDOW: ' 1h ' })).toEqual(
      { limit: 5, ttlMs: 3_600_000, windowSeconds: 3600 },
    );
  });

  describe('falls back rather than misconfiguring', () => {
    it.each([
      ['absent', undefined],
      ['empty', ''],
      ['zero', '0'],
      ['negative', '-5'],
      ['not a number', 'abc'],
      ['fractional', '2.5'],
    ])('uses the default limit when the value is %s', (_label, value) => {
      expect(contactRateLimit({ CONTACT_RATE_LIMIT: value }).limit).toBe(CONTACT_RATE_LIMIT);
    });

    it.each([
      ['absent', undefined],
      ['empty', ''],
      ['unparseable', 'soon'],
      ['unitless nonsense', '15min'],
    ])('uses the default window when the value is %s', (_label, value) => {
      expect(contactRateLimit({ CONTACT_RATE_WINDOW: value }).windowSeconds).toBe(
        CONTACT_RATE_WINDOW_SECONDS,
      );
    });

    it('never produces a zero or negative window, which would block every visitor', () => {
      const result = contactRateLimit({ CONTACT_RATE_WINDOW: '0s' });
      expect(result.windowSeconds).toBeGreaterThanOrEqual(1);
      expect(result.ttlMs).toBeGreaterThanOrEqual(1000);
    });
  });
});