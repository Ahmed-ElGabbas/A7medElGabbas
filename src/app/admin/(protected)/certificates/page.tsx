import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type { AdminCertificate, CategoryOption } from "@/lib/admin-api";
import AdminCertificatesClient from "./certificates-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificates",
};

/** Server-side initial fetch (BACKEND_PLAN.md §6); the client only refetches
 *  after a mutation. */
export default async function AdminCertificatesPage() {
  const cookieHeader = (await cookies()).toString();

  const [certificates, categories] = await Promise.all([
    adminServerFetch<{ items: AdminCertificate[] }>("/certificates", cookieHeader),
    adminServerFetch<{ categories: CategoryOption[] }>(
      "/certificates/categories",
      cookieHeader,
    ),
  ]);

  return (
    <AdminCertificatesClient
      initialItems={certificates?.items ?? null}
      initialCategories={categories?.categories ?? null}
    />
  );
}