const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Reads the session on the server by calling the backend directly with the
 * incoming cookie header. Returns null when the access token is missing or
 * expired — the /api/* rewrite is not involved here because a server-side
 * fetch has no browser origin to rewrite.
 */
export async function getSession(
  cookieHeader: string | undefined,
): Promise<AdminUser | null> {
  if (!cookieHeader) return null;

  try {
    const res = await fetch(`${API_ORIGIN}/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { admin: AdminUser | null };
    return data.admin ?? null;
  } catch {
    return null;
  }
}

export { API_ORIGIN };
