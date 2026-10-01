import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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
}
