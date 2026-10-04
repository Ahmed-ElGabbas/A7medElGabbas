import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  buildAuthCookies,
  buildClearCookies,
  buildRefreshCookie,
} from './auth.cookies';
import { Public } from '../common/public.decorator';
import { AuthenticatedUser, RequestWithUser } from '../common/auth.guard';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../common/token.constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    const cookies = buildAuthCookies(this.config);
    res.cookie(ACCESS_COOKIE, result.accessToken, cookies[0]);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookies[1]);

    return { admin: result.admin };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = (req.cookies as Record<string, string | undefined>)?.[
      REFRESH_COOKIE
    ];

    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const result = await this.authService.refresh(token);
    res.cookie(
      REFRESH_COOKIE,
      result.refreshToken,
      buildRefreshCookie(this.config),
    );

    return { admin: result.admin };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    for (const cookie of buildClearCookies(this.config)) {
      const { name, ...options } = cookie;
      res.clearCookie(name, options);
    }
    return this.authService.logout();
  }

  @Get('me')
  me(@Req() req: RequestWithUser) {
    const user: AuthenticatedUser | undefined = req.user;
    return { admin: user ?? null };
  }

  /**
   * Lets the signed-in admin rotate their own password from the UI.
   *
   * Authenticated (no `@Public()`), and the target row comes from the verified
   * token via `req.user.sub` — there is no id in the body to tamper with.
   *
   * The change revokes every other session (see `AuthService.changePassword`),
   * which would otherwise strand this one too: the caller's cookies still carry
   * the pre-bump `ver`, so the next silent refresh would be refused. Re-issuing
   * both cookies from the returned tokens keeps the device that made the change
   * signed in and leaves everyone else at the login form.
   */
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.changePassword(req.user!.sub, dto);

    const cookies = buildAuthCookies(this.config);
    res.cookie(ACCESS_COOKIE, result.accessToken, cookies[0]);
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookies[1]);

    return { success: true };
  }
}
