import { createHmac } from 'node:crypto';
import { hashIp, ipHashSecret } from './contact-privacy';

const SECRET = 'a-server-side-secret';

describe('hashIp', () => {
  it('produces a stable digest for the same address', () => {
    expect(hashIp('203.0.113.7', SECRET)).toBe(hashIp('203.0.113.7', SECRET));
  });

  it('returns a hex sha256 HMAC', () => {
    expect(hashIp('203.0.113.7', SECRET)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('matches an independently computed HMAC', () => {
    const expected = createHmac('sha256', SECRET).update('203.0.113.7').digest('hex');
    expect(hashIp('203.0.113.7', SECRET)).toBe(expected);
  });

  it('never contains the address it hashed', () => {
    expect(hashIp('203.0.113.7', SECRET)).not.toContain('203.0.113.7');
  });

  it('gives different digests for different addresses', () => {
    expect(hashIp('203.0.113.7', SECRET)).not.toBe(hashIp('203.0.113.8', SECRET));
  });

  it('gives different digests for the same address under different secrets', () => {
    expect(hashIp('203.0.113.7', SECRET)).not.toBe(hashIp('203.0.113.7', 'other-secret'));
  });

  it('trims the address so a stray space cannot change the digest', () => {
    expect(hashIp('  203.0.113.7 ', SECRET)).toBe(hashIp('203.0.113.7', SECRET));
  });

  it('handles an IPv6 address', () => {
    expect(hashIp('2001:db8::1', SECRET)).toMatch(/^[0-9a-f]{64}$/);
  });

  it.each([
    ['an absent address', undefined],
    ['a blank address', '   '],
  ])('returns null for %s', (_label, ip) => {
    expect(hashIp(ip, SECRET)).toBeNull();
  });

  it.each([
    ['an absent secret', undefined],
    ['a blank secret', '   '],
  ])('returns null rather than hashing with %s', (_label, secret) => {
    expect(hashIp('203.0.113.7', secret)).toBeNull();
  });
});

describe('ipHashSecret', () => {
  it('prefers the dedicated salt when it is set', () => {
    expect(ipHashSecret({ CONTACT_IP_HASH_SALT: 'salt', JWT_SECRET: 'jwt' })).toBe('salt');
  });

  it('falls back to JWT_SECRET so the column is never a readable IP', () => {
    expect(ipHashSecret({ JWT_SECRET: 'jwt' })).toBe('jwt');
  });

  it('prefers the salt even when JWT_SECRET is the longer value', () => {
    expect(ipHashSecret({ CONTACT_IP_HASH_SALT: 'salt', JWT_SECRET: 'x'.repeat(64) })).toBe(
      'salt',
    );
  });

  it('ignores a whitespace-only salt rather than using it as a key', () => {
    expect(ipHashSecret({ CONTACT_IP_HASH_SALT: '   ', JWT_SECRET: 'jwt' })).toBe('jwt');
  });

  it('returns undefined when nothing is configured', () => {
    expect(ipHashSecret({})).toBeUndefined();
    expect(ipHashSecret({ JWT_SECRET: '  ' })).toBeUndefined();
  });
});