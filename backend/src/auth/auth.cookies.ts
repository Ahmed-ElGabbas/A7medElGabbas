import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../common/token.constants';
import { ttlSeconds } from '../common/ttl';

export interface NamedCookieOptions extends CookieOptions {
  name: string;
}

function isProduction(config: ConfigService): boolean {
  return config.get('NODE_ENV') === 'production';
}

function accessTtl(config: ConfigService): number {
  // Express cookie maxAge is milliseconds — convert from seconds.
  return ttlSeconds(config.get<string>('JWT_ACCESS_EXPIRES_IN'), 3600) * 1000;
}

function refreshTtl(config: ConfigService): number {
  return ttlSeconds(config.get<string>('JWT_REFRESH_EXPIRES_IN'), 604800) * 1000;
}

/**
 * Both tokens are set as httpOnly cookies. The frontend never reads them — it
 * calls the backend through its own origin via the /api/* rewrite, so
 * `sameSite: lax` keeps this same-site and no cross-origin CORS is needed.
 */
export function buildAuthCookies(config: ConfigService): NamedCookieOptions[] {
  const secure = isProduction(config);

  return [
    {
      name: ACCESS_COOKIE,
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: accessTtl(config),
    },
    {
      name: REFRESH_COOKIE,
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: refreshTtl(config),
    },
  ];
}

export function buildRefreshCookie(
  config: ConfigService,
): NamedCookieOptions {
  return {
    name: REFRESH_COOKIE,
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction(config),
    path: '/',
    maxAge: refreshTtl(config),
  };
}

export function buildClearCookies(config: ConfigService): NamedCookieOptions[] {
  const secure = isProduction(config);

  return [ACCESS_COOKIE, REFRESH_COOKIE].map((name) => ({
    name,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    expires: new Date(0),
  }));
}
