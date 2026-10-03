import { createHmac } from 'node:crypto';

/**
 * contact_submissions.ip_hash is deliberately a keyed digest rather than a raw
 * address (BACKEND_PLAN.md §3.1): the column exists to spot repeated submissions
 * from the same source, and a raw IP would make the table a PII store that still
 * needs its own retention policy.
 *
 * HMAC-SHA256 rather than a bare hash because an IP space is small enough to
 * brute-force offline — salting with a secret that never leaves the server is
 * what makes the digest non-reversible in practice.
 *
 * Returns null when there is nothing to hash or no secret to hash it with, so
 * callers can store null rather than a misleading constant.
 */
export function hashIp(ip: string | undefined, secret: string | undefined): string | null {
  const address = (ip ?? '').trim();
  const key = (secret ?? '').trim();

  if (!address || !key) return null;

  return createHmac('sha256', key).update(address).digest('hex');
}

/**
 * Reads the hashing secret, preferring a dedicated salt and falling back to
 * JWT_SECRET so a deployment that never sets one still gets non-reversible
 * hashes rather than a column of nulls.
 */
export function ipHashSecret(env: {
  CONTACT_IP_HASH_SALT?: string;
  JWT_SECRET?: string;
}): string | undefined {
  const salt = (env.CONTACT_IP_HASH_SALT ?? '').trim();
  if (salt) return salt;
  return (env.JWT_SECRET ?? '').trim() || undefined;
}