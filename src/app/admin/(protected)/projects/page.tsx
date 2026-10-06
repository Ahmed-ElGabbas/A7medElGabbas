import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import { readDeepLinkParams } from "@/lib/admin-deep-link";
import type { AdminProject } from "@/lib/admin-api";
import AdminProjectsClient from "./projects-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
};

/**
 * Initial rows are fetched here on the server (BACKEND_PLAN.md §6) so the list
 * paints immediately. The client component only refetches after a mutation —
 * no loading-from-empty effect.
 *
 * `?id=` / `?new=1` are the dashboard's deep links into this page (search
 * results and the "Add project" shortcut); they are resolved here so the client
 * receives plain props.
 */
export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[]; new?: string | string[] }>;
}) {
  const cookieHeader = (await cookies()).toString();
  const deepLink = readDeepLinkParams(await searchParams);

  const [projects, categories] = await Promise.all([
    adminServerFetch<{ items: AdminProject[] }>("/projects", cookieHeader),
    adminServerFetch<{ categories: string[] }>("/projects/categories", cookieHeader),
  ]);

  return (
    <AdminProjectsClient
      initialItems={projects?.items ?? null}
      initialCategories={categories?.categories ?? null}
      deepLinkId={deepLink.targetId}
      openNew={deepLink.openNew}
    />
  );
}