import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ttlSeconds } from '../common/ttl';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  admin: { id: string; email: string };
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

    const [accessToken, refreshToken] = await this.issueTokens(admin.id, admin.email);

    return {
      accessToken,
      refreshToken,
      admin: { id: admin.id, email: admin.email },
    };
  }

  async issueTokens(
    adminId: string,
    email: string,
  ): Promise<[string, string]> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: adminId, email, type: 'access' },
        {
          secret: this.config.getOrThrow<string>('JWT_SECRET'),
          expiresIn: ttlSeconds(
            this.config.get<string>('JWT_ACCESS_EXPIRES_IN'),
            3600,
          ),
        },
      ),
      this.jwtService.signAsync(
        { sub: adminId, type: 'refresh' },
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
    let payload: { sub: string };
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

    const [accessToken, newRefreshToken] = await this.issueTokens(
      admin.id,
      admin.email,
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
}

// A real bcrypt hash of a throwaway value, used only for timing equalisation.
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEeO1sJ0bqZ0eQO4Zk3xhkK1v0mR8mZqUuAq';
