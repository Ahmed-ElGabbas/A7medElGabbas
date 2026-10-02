import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
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
 */
export default async function AdminProjectsPage() {
  const cookieHeader = (await cookies()).toString();

  const [projects, categories] = await Promise.all([
    adminServerFetch<{ items: AdminProject[] }>("/projects", cookieHeader),
    adminServerFetch<{ categories: string[] }>("/projects/categories", cookieHeader),
  ]);

  return (
    <AdminProjectsClient
      initialItems={projects?.items ?? null}
      initialCategories={categories?.categories ?? null}
    />
  );
}