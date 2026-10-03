import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type {
  AdminNavItem,
  AdminSectionMeta,
  SiteConfigPayload,
} from "@/lib/admin-api";
import SiteConfigClient from "./site-config-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site config",
};

const TABS = ["identity", "links", "nav", "headings"] as const;
type Tab = (typeof TABS)[number];

/**
 * Four singletons/short lists share one page because they are all "global site
 * settings" an editor expects to find in the same place: identity, social
 * links, nav order, and the six section headings. Server-fetched on first paint
 * per BACKEND_PLAN.md §6; the client refetches only after a mutation.
 *
 * `?tab=` is read here rather than in the client so the dashboard can deep-link
 * straight to a panel without needing useSearchParams (and its Suspense
 * boundary) in a client component.
 */
export default async function AdminSiteConfigPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieHeader = (await cookies()).toString();
  const requested = (await searchParams).tab;
  const raw = Array.isArray(requested) ? requested[0] : requested;
  const initialTab: Tab = TABS.includes(raw as Tab) ? (raw as Tab) : "identity";

  const [payload, nav, headings] = await Promise.all([
    adminServerFetch<SiteConfigPayload>("/site-config", cookieHeader),
    adminServerFetch<{ items: AdminNavItem[] }>("/nav-items", cookieHeader),
    adminServerFetch<{ items: AdminSectionMeta[] }>("/section-meta", cookieHeader),
  ]);

  return (
    <SiteConfigClient
      initialConfig={payload?.config ?? null}
      initialLinks={payload?.links ?? null}
      initialNav={nav?.items ?? null}
      initialHeadings={headings?.items ?? null}
      initialTab={initialTab}
    />
  );
}