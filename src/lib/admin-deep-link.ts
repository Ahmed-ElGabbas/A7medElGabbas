/**
 * Reads the `?id=` / `?new=1` deep-link params that the dashboard's search
 * results and quick actions link with.
 *
 * Deliberately NOT in `components/admin/use-open-deep-link.ts`: that module is
 * `"use client"`, so every export in it becomes a client reference. Importing
 * `readDeepLinkParams` from there into a server component made both
 * /admin/projects and /admin/certificates throw on *every* render —
 *
 *   "Attempted to call readDeepLinkParams() from the server but
 *    readDeepLinkParams is on the client."
 *
 * TypeScript and `next build` both pass, because the failure is a runtime
 * client-boundary check rather than a type error. Keep this file free of
 * `"use client"` and keep the server-side reads pointed at it.
 */
export function readDeepLinkParams(params: {
  id?: string | string[];
  new?: string | string[];
}): { targetId: string | null; openNew: boolean } {
  const first = (value: string | string[] | undefined): string =>
    (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

  return {
    targetId: first(params.id) || null,
    openNew: first(params.new) === "1",
  };
}
