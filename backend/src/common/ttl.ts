/**
 * Converts a human-readable duration ("1h", "7d", "900") into seconds.
 * Returns the fallback when the input is unparseable, so a malformed env var
 * degrades to a sane default instead of breaking token signing at runtime.
 */
export function ttlSeconds(value: string | undefined, fallbackSeconds: number): number {
  const match = /^(\d+)([smhd])?$/.exec((value ?? '').trim());
  if (!match) return fallbackSeconds;

  const amount = Number(match[1]);
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return amount * (multipliers[match[2] ?? 's'] ?? 1);
}
