import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { describe, beforeEach, it, expect } from '@jest/globals';
import { AuthService } from './auth.service';

/**
 * Self-service password change, and the session revocation it triggers.
 *
 * The security-relevant part of this service: a stolen access cookie must not be
 * enough to take the account over, so the current password is verified before
 * anything is written. These tests pin that ordering rather than the hashing
 * itself, and then pin the revocation guarantee — a password change must end
 * every other session that the old password had opened.
 */

/** bcrypt hash of "current-password-123" at cost 10 (cost is irrelevant to compare). */
const CURRENT_HASH = '$2b$10$DRMgBYf.PGje2iVpC1lDh.uz5HvlmQ74IeHp1lzyXT/NB0rXOno9K';
const CURRENT_PASSWORD = 'current-password-123';
const NEW_PASSWORD = 'a-much-longer-passphrase';

describe('AuthService.changePassword', () => {
  const prisma = {
    adminUser: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwt = { signAsync: jest.fn(), verifyAsync: jest.fn() };
  const config = { get: jest.fn(), getOrThrow: jest.fn() };

  const service = new AuthService(
    prisma as never,
    jwt as unknown as JwtService,
    config as unknown as ConfigService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'owner@example.com',
      passwordHash: CURRENT_HASH,
      tokenVersion: 3,
    });
    prisma.adminUser.update.mockResolvedValue({ tokenVersion: 4 });
    config.get.mockReturnValue(undefined);
    config.getOrThrow.mockImplementation((key: string) => `secret-for-${key}`);
    jwt.signAsync
      .mockResolvedValueOnce('fresh-access-token')
      .mockResolvedValueOnce('fresh-refresh-token');
  });

  it('rejects a wrong current password without writing anything', async () => {
    await expect(
      service.changePassword('admin-1', {
        currentPassword: 'not-the-password',
        newPassword: NEW_PASSWORD,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.adminUser.update).not.toHaveBeenCalled();
  });

  it('rejects the change when the account no longer exists', async () => {
    prisma.adminUser.findUnique.mockResolvedValue(null);

    await expect(
      service.changePassword('gone', {
        currentPassword: CURRENT_PASSWORD,
        newPassword: NEW_PASSWORD,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(prisma.adminUser.update).not.toHaveBeenCalled();
  });

  it('refuses a new password identical to the current one', async () => {
    await expect(
      service.changePassword('admin-1', {
        currentPassword: CURRENT_PASSWORD,
        newPassword: CURRENT_PASSWORD,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.adminUser.update).not.toHaveBeenCalled();
  });

  it('stores a fresh hash of the new password on the caller’s own row', async () => {
    const result = await service.changePassword('admin-1', {
      currentPassword: CURRENT_PASSWORD,
      newPassword: NEW_PASSWORD,
    });

    expect(result.success).toBe(true);
    expect(prisma.adminUser.update).toHaveBeenCalledTimes(1);

    const call = prisma.adminUser.update.mock.calls[0][0] as {
      where: { id: string };
      data: { passwordHash: string };
    };

    /// The id must come from the verified token, never from the body.
    expect(call.where.id).toBe('admin-1');
    expect(call.data.passwordHash).not.toBe(CURRENT_HASH);
    expect(await bcrypt.compare(NEW_PASSWORD, call.data.passwordHash)).toBe(true);
    /// And the plaintext must never be what lands in the column.
    expect(call.data.passwordHash).not.toContain(NEW_PASSWORD);
  });

  it('revokes every other session by bumping the token version', async () => {
    await service.changePassword('admin-1', {
      currentPassword: CURRENT_PASSWORD,
      newPassword: NEW_PASSWORD,
    });

    const call = prisma.adminUser.update.mock.calls[0][0] as {
      data: { passwordHash: string; tokenVersion: { increment: number } };
    };

    /// Incremented in the same statement as the hash, so there is no window in
    /// which the new password is live but old sessions still refresh. Setting a
    /// fixed value instead would let two concurrent changes pick the same one.
    expect(call.data.tokenVersion).toEqual({ increment: 1 });
  });

  it('re-issues tokens at the new version so the caller stays signed in', async () => {
    const result = await service.changePassword('admin-1', {
      currentPassword: CURRENT_PASSWORD,
      newPassword: NEW_PASSWORD,
    });

    expect(result.accessToken).toBe('fresh-access-token');
    expect(result.refreshToken).toBe('fresh-refresh-token');

    /// Both tokens must carry the version the UPDATE actually produced — the
    /// caller's old cookies hold the pre-bump value and would be refused.
    const payloads = jwt.signAsync.mock.calls.map(
      (call) => (call[0] as { type: string; ver: number }) ?? {},
    );
    expect(payloads).toHaveLength(2);
    for (const payload of payloads) {
      expect(payload.ver).toBe(4);
    }
  });
});

/**
 * The other half of the guarantee: bumping the version is only useful if the
 * refresh path actually consults it. These exercise `refresh()` directly, which
 * is the only place a revoked session can be stopped — access tokens are
 * stateless and the guard never reads the database, so they expire on their own.
 */
describe('AuthService.refresh — session revocation', () => {
  const prisma = { adminUser: { findUnique: jest.fn() } };
  const jwt = { signAsync: jest.fn(), verifyAsync: jest.fn() };
  const config = { get: jest.fn(), getOrThrow: jest.fn() };

  const service = new AuthService(
    prisma as never,
    jwt as unknown as JwtService,
    config as unknown as ConfigService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    config.get.mockReturnValue(undefined);
    config.getOrThrow.mockImplementation((key: string) => `secret-for-${key}`);
    prisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'owner@example.com',
      tokenVersion: 4,
    });
    jwt.signAsync.mockResolvedValue('next-token');
  });

  it('refuses a token minted before the password change', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'admin-1', type: 'refresh', ver: 3 });

    await expect(service.refresh('old-refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    /// The point of refusing: no new access token may be minted from it.
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('refuses a legacy token that carries no version claim at all', async () => {
    /// Tokens issued before the token_version migration exist have no `ver`.
    /// undefined !== 0 must therefore refuse them, so adding the column signs
    /// out pre-existing sessions exactly once rather than never.
    prisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'owner@example.com',
      tokenVersion: 0,
    });
    jwt.verifyAsync.mockResolvedValue({ sub: 'admin-1', type: 'refresh' });

    await expect(service.refresh('legacy-refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('accepts a token at the current version', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'admin-1', type: 'refresh', ver: 4 });

    const result = await service.refresh('current-refresh-token');

    expect(result.accessToken).toBe('next-token');
    const payload = jwt.signAsync.mock.calls[0][0] as { ver: number };
    expect(payload.ver).toBe(4);
  });

  it('reports a revoked session separately from a malformed token', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'admin-1', type: 'refresh', ver: 1 });

    /// The UI needs to tell "sign in again" apart from "your token is broken",
    /// otherwise a revoked session looks like an unexplained logout loop.
    await expect(service.refresh('stale')).rejects.toThrow(
      'Session has been revoked',
    );
  });
});