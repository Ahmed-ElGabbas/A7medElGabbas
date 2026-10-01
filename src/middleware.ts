import { NextResponse, type NextRequest } from "next/server";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const ACCESS_COOKIE = "portfolio_access_token";
const REFRESH_COOKIE = "portfolio_refresh_token";

/**
 * Auth wall for /admin/*. The access token lives only 1h, so when it is stale
 * we transparently exchange the 7-day refresh token for a new pair.
 *
 * Middleware is the only place that can both read the incoming httpOnly cookies
 * and write updated ones. Crucially, on a successful refresh we also rewrite
 * the *request* cookie header so the server component rendering this same
 * request sees the new access token instead of redirecting to the login page.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page handles its own redirect once authenticated.
  if (pathname === "/admin" || pathname === "/admin/") {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie") ?? "";

  const me = await fetch(`${API_ORIGIN}/auth/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  }).catch(() => null);

  if (me?.ok) {
    return NextResponse.next();
  }

  if (!request.cookies.has(REFRESH_COOKIE)) {
    return redirectToLogin(request);
  }

  const refreshed = await fetch(`${API_ORIGIN}/auth/refresh`, {
    method: "POST",
    headers: { cookie: cookieHeader },
    cache: "no-store",
  }).catch(() => null);

  if (!refreshed?.ok) {
    const response = redirectToLogin(request);
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  const setCookies = refreshed.headers.getSetCookie();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", mergeCookies(cookieHeader, setCookies));

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  for (const cookie of setCookies) {
    response.headers.append("set-cookie", cookie);
  }

  return response;
}

/** Overlays refreshed `name=value` pairs onto an existing Cookie header. */
function mergeCookies(cookieHeader: string, setCookies: string[]): string {
  const jar = new Map<string, string>();

  for (const pair of cookieHeader.split(";")) {
    const [name, ...rest] = pair.trim().split("=");
    if (name) jar.set(name, rest.join("="));
  }

  for (const raw of setCookies) {
    const first = raw.split(";")[0];
    const [name, ...rest] = first.split("=");
    if (name) jar.set(name.trim(), rest.join("="));
  }

  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/admin";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path+"],
};
