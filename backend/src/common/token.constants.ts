export interface JwtAccessPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface JwtRefreshPayload {
  sub: string;
  type: 'refresh';
}

export const ACCESS_COOKIE = 'portfolio_access_token';
export const REFRESH_COOKIE = 'portfolio_refresh_token';
