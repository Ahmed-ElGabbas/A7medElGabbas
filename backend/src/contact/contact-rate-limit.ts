import { ttlSeconds } from '../common/ttl';

/**
 * Rate limit for POST /contact (BACKEND_PLAN.md §4.4): 3 submissions per IP per
 * 15 minutes. Deliberately tight — one person sending several real messages in a
 * burst is unlikely, while a scripted flood is the thing being stopped.
 */
export const CONTACT_RATE_LIMIT = 3;
export const CONTACT_RATE_WINDOW_SECONDS = 15 * 60;

export interface ContactRateLimit {
  /** Submissions allowed per window, per IP. */
  limit: number;
  /** Window length in milliseconds — @nestjs/throttler counts `ttl` in ms. */
  ttlMs: number;
  /** Window length in seconds, surfaced by the admin/diagnostics surface. */
  windowSeconds: number;
}

/**
 * Reads the limits from the environment, falling back to the defaults above.
 *
 * Both values are attacker-adjacent config: a typo must not silently disable
 * rate limiting, and a nonsensical value (0, negative, "abc") must not become a
 * limit that blocks every visitor. Anything unparseable or out of range falls
 * back to the default instead.
 */
export function contactRateLimit(env: {
  CONTACT_RATE_LIMIT?: string;
  CONTACT_RATE_WINDOW?: string;
}): ContactRateLimit {
  // Number() rather than parseInt(): parseInt('2.5') silently yields 2, which
  // would turn a typo into a limit nobody chose.
  const parsedLimit = Number((env.CONTACT_RATE_LIMIT ?? '').trim());
  const limit =
    Number.isInteger(parsedLimit) && parsedLimit >= 1 ? parsedLimit : CONTACT_RATE_LIMIT;

  const windowSeconds = Math.max(
    1,
    ttlSeconds(env.CONTACT_RATE_WINDOW, CONTACT_RATE_WINDOW_SECONDS),
  );

  return { limit, ttlMs: windowSeconds * 1000, windowSeconds };
}