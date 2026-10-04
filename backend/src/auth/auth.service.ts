import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ttlSeconds } from '../common/ttl';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  admin: { id: string; email: string };
}

/// Shape of the refresh-token payload this service is willing to accept.
/// `ver` is optional only so a token minted before the column existed decodes
/// cleanly and is then refused by the version check, rather than throwing inside
/// the verify step and being reported as a malformed token.
interface RefreshPayload {
  sub: string;
  ver?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const email = dto.email.trim().toLowerCase();
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    // Compare against a dummy hash when the user is missing so the response
    // time does not reveal whether the email exists.
    const hash = admin?.passwordHash ?? DUMMY_HASH;
    const matches = await bcrypt.compare(dto.password, hash);

    if (!admin || !matches) {
      this.logger.warn(`Failed login attempt for ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const [accessToken, refreshToken] = await this.issueTokens(
      admin.id,
      admin.email,
      admin.tokenVersion,
    );

    return {
      accessToken,
      refreshToken,
      admin: { id: admin.id, email: admin.email },
    };
  }

  /**
   * Signs an access/refresh pair carrying the account's current `tokenVersion`.
   *
   * The version travels inside both tokens so a later bump makes every token
   * issued before it detectably stale, without needing a per-token database row.
   */
  async issueTokens(
    adminId: string,
    email: string,
    tokenVersion: number,
  ): Promise<[string, string]> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: adminId, email, type: 'access', ver: tokenVersion },
        {
          secret: this.config.getOrThrow<string>('JWT_SECRET'),
          expiresIn: ttlSeconds(
            this.config.get<string>('JWT_ACCESS_EXPIRES_IN'),
            3600,
          ),
        },
      ),
      this.jwtService.signAsync(
        { sub: adminId, type: 'refresh', ver: tokenVersion },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: ttlSeconds(
            this.config.get<string>('JWT_REFRESH_EXPIRES_IN'),
            604800,
          ),
        },
      ),
    ]);

    return [accessToken, refreshToken];
  }

  async refresh(refreshToken: string): Promise<LoginResult> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin account no longer exists');
    }

    // The signature is still good, but this token predates a password change (or
    // predates the token_version column entirely, in which case ver is undefined).
    // Without this check a rotated password would leave every other logged-in
    // device able to mint a fresh access token indefinitely.
    if (payload.ver !== admin.tokenVersion) {
      this.logger.warn(
        `Refused a stale refresh token for ${admin.email} (token ver ${String(
          payload.ver,
        )}, account ver ${admin.tokenVersion})`,
      );
      throw new UnauthorizedException(
        'Session has been revoked. Please sign in again.',
      );
    }

    const [accessToken, newRefreshToken] = await this.issueTokens(
      admin.id,
      admin.email,
      admin.tokenVersion,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      admin: { id: admin.id, email: admin.email },
    };
  }

  async logout(): Promise<{ success: true }> {
    return { success: true };
  }

/**
   * Replaces the signed-in admin's own password hash and revokes every other
   * session that was opened with the old password.
   *
   * The current password is verified first so a stolen access cookie alone
   * cannot lock the owner out of their account — that is the whole point of
   * requiring it. `adminId` comes from the verified access token on the request
   * (AuthGuard puts it there), never from the request body, so this can only
   * ever touch the caller's own row.
   *
   * Revocation is a `tokenVersion` bump in the same UPDATE as the new hash.
   * Every previously issued token carries the old version, so `refresh()` now
   * refuses it and that device cannot mint another access token. A token that
   * was already minted stays usable until it expires on its own — access tokens
   * are stateless and the guard never queries the database, so revocation takes
   * effect at `JWT_ACCESS_EXPIRES_IN` (1 hour by default) at the latest.
   *
   * The caller is not signed out: the controller sets a freshly minted pair from
   * the returned tokens, so the tab doing the change keeps working while every
   * other device is forced back through the login form.
   */
  async changePassword(
    adminId: string,
    dto: ChangePasswordDto,
  ): Promise<{ success: true } & LoginResult> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, passwordHash: true, tokenVersion: true },
    });

    if (!admin) {
      // The token verified but the account is gone; treat it as unauthenticated
      // rather than leaking that the row disappeared.
      throw new UnauthorizedException('Admin account no longer exists');
    }

    const matches = await bcrypt.compare(dto.currentPassword, admin.passwordHash);

    if (!matches) {
      this.logger.warn(`Failed password change for ${admin.email}`);
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (await bcrypt.compare(dto.newPassword, admin.passwordHash)) {
      // Not a failure worth a stack trace, but the UI must say so plainly
      // instead of appearing to succeed with no change.
      throw new BadRequestException('New password must be different from the current one');
    }

    const updated = await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS),
        // Incremented rather than set to a fixed value so two concurrent
        // changes cannot collide on the same version and leave a token valid.
        tokenVersion: { increment: 1 },
      },
      select: { tokenVersion: true },
    });

    const [accessToken, refreshToken] = await this.issueTokens(
      admin.id,
      admin.email,
      updated.tokenVersion,
    );

    this.logger.log(
      `Password changed for ${admin.email}; revoked other sessions (token version now ${updated.tokenVersion})`,
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      admin: { id: admin.id, email: admin.email },
    };
  }
}

/// Cost factor for new hashes. Matches the rounds the seed script uses, so every
/// stored hash in the table has the same cost.
const BCRYPT_ROUNDS = 12;

// A real bcrypt hash of a throwaway value, used only for timing equalisation.
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO1sJ0bqZ0eQO4Zk3xhkK1v0mR8mZqUuAq';
