import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../common/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../common/token.constants';

/**
 * Password change + session revocation, over real HTTP with real signed tokens.
 *
 * The service-level spec (`auth.password.spec.ts`) pins the logic. What it cannot
 * see is the part that actually breaks the user experience: after the change, the
 * caller's cookies must be replaced, because the ones they are still holding
 * carry the pre-bump version and the very next silent refresh would be refused —
 * i.e. "I changed my password and got logged out immediately". These tests drive
 * the real controller so that cookie re-issue is covered.
 */

const ACCESS_SECRET = 'test-access-secret';
const REFRESH_SECRET = 'test-refresh-secret';

const CURRENT_PASSWORD = 'current-password-123';
const NEW_PASSWORD = 'a-much-longer-passphrase';
/** Cost 4 keeps the suite fast; the cost factor is not what is under test here. */
const CURRENT_HASH = bcrypt.hashSync(CURRENT_PASSWORD, 4);

describe('password change revokes other sessions', () => {
  let app: INestApplication;
  let jwt: JwtService;

  const prisma = {
    adminUser: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  /** Mints a token exactly the way AuthService would, so the payload is real. */
  const signRefresh = (ver?: number) =>
    jwt.sign({ sub: 'admin-1', type: 'refresh', ...(ver === undefined ? {} : { ver }) }, {
      secret: REFRESH_SECRET,
      expiresIn: 600,
    });

  const signAccess = (ver?: number) =>
    jwt.sign({ sub: 'admin-1', email: 'owner@example.com', type: 'access', ...(ver === undefined ? {} : { ver }) }, {
      secret: ACCESS_SECRET,
      expiresIn: 600,
    });

  /**
   * supertest types `res.headers` as `IncomingHttpHeaders`, where `set-cookie` is
   * an index-signature lookup rather than a typed array of strings.
   */
  const setCookies = (res: request.Response): string[] =>
    (res.headers['set-cookie'] ?? []) as unknown as string[];

  /** Pulls one cookie's value out of its Set-Cookie header. */
  const cookieValue = (res: request.Response, name: string): string | undefined => {
    const header = setCookies(res).find((cookie) => cookie.startsWith(`${name}=`));
    return header?.slice(name.length + 1).split(';')[0];
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PrismaModule,
        AuthModule,
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: ACCESS_SECRET,
              JWT_REFRESH_SECRET: REFRESH_SECRET,
            }),
          ],
        }),
      ],
      // The real AuthGuard, not a stub: the interesting assertions are about
      // which cookies get set for an authenticated caller, and a stubbed guard
      // would not catch a token that verifies but carries the wrong version.
      providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    jwt = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'owner@example.com',
      passwordHash: CURRENT_HASH,
      tokenVersion: 7,
    });
    prisma.adminUser.update.mockResolvedValue({ tokenVersion: 8 });
  });

  describe('PATCH /auth/password', () => {
    it('replaces both auth cookies so the caller is not signed out', async () => {
      const res = await request(app.getHttpServer())
        .patch('/auth/password')
        .set('Authorization', `Bearer ${signAccess(7)}`)
        .send({ currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD })
        .expect(200);

      expect(res.body).toEqual({ success: true });

      const names = setCookies(res).map((cookie) => cookie.split('=')[0]);
      expect(names).toEqual(expect.arrayContaining([ACCESS_COOKIE, REFRESH_COOKIE]));

      /// The new tokens must be the post-bump pair, or the caller's own next
      /// refresh fails and they are bounced to the login screen.
      expect(jwt.verify(cookieValue(res, ACCESS_COOKIE)!, { secret: ACCESS_SECRET })).toMatchObject({
        sub: 'admin-1',
        ver: 8,
      });
      expect(jwt.verify(cookieValue(res, REFRESH_COOKIE)!, { secret: REFRESH_SECRET })).toMatchObject({
        sub: 'admin-1',
        ver: 8,
      });
    });

    it('writes the new hash and bumps the version in a single update', async () => {
      await request(app.getHttpServer())
        .patch('/auth/password')
        .set('Authorization', `Bearer ${signAccess(7)}`)
        .send({ currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD })
        .expect(200);

      expect(prisma.adminUser.update).toHaveBeenCalledTimes(1);
      const call = prisma.adminUser.update.mock.calls[0][0] as {
        data: { passwordHash: string; tokenVersion: { increment: number } };
      };
      expect(await bcrypt.compare(NEW_PASSWORD, call.data.passwordHash)).toBe(true);
      expect(call.data.tokenVersion).toEqual({ increment: 1 });
    });

    it('sets no cookies when the current password is wrong', async () => {
      const res = await request(app.getHttpServer())
        .patch('/auth/password')
        .set('Authorization', `Bearer ${signAccess(7)}`)
        .send({ currentPassword: 'wrong', newPassword: NEW_PASSWORD })
        .expect(401);

      expect(setCookies(res)).toHaveLength(0);
      expect(prisma.adminUser.update).not.toHaveBeenCalled();
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .patch('/auth/password')
        .send({ currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    /** The controller reads the refresh token from the cookie, never the body. */
    const withRefreshCookie = (token: string) => ({
      Cookie: `${REFRESH_COOKIE}=${token}`,
    });

    it('rejects a token from before the password change and issues no cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set(withRefreshCookie(signRefresh(6)))
        .expect(401);

      /// No Set-Cookie here is the important part: a revoked device must not be
      /// handed a fresh token, and must not keep retrying with a live cookie.
      expect(setCookies(res)).toHaveLength(0);
    });

    it('rejects a token issued before the token_version column existed', async () => {
      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-1',
        email: 'owner@example.com',
        passwordHash: CURRENT_HASH,
        tokenVersion: 0,
      });

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set(withRefreshCookie(signRefresh()))
        .expect(401);
    });

    it('rotates the refresh cookie for a token at the current version', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set(withRefreshCookie(signRefresh(7)))
        .expect(200);

      expect(cookieValue(res, REFRESH_COOKIE)).toBeDefined();
      expect(jwt.verify(cookieValue(res, REFRESH_COOKIE)!, { secret: REFRESH_SECRET })).toMatchObject({
        sub: 'admin-1',
        ver: 7,
      });
    });
  });
});