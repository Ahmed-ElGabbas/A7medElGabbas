import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type {
  AdminCertificate,
  AdminCertificateStat,
  AdminIssuingOrganization,
  CategoryOption,
} from "@/lib/admin-api";
import AdminCertificatesClient from "./certificates-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Certificates",
};

/** Server-side initial fetch (BACKEND_PLAN.md A6); the client only refetches
 *  after a mutation. */
export default async function AdminCertificatesPage() {
  const cookieHeader = (await cookies()).toString();

  const [certificates, categories, stats, organizations] = await Promise.all([
    adminServerFetch<{ items: AdminCertificate[] }>("/certificates", cookieHeader),
    adminServerFetch<{ categories: CategoryOption[] }>(
      "/certificates/categories",
      cookieHeader,
    ),
    adminServerFetch<{ items: AdminCertificateStat[] }>("/certificates/stats", cookieHeader),
    adminServerFetch<{ items: AdminIssuingOrganization[] }>(
      "/certificates/issuing-organizations",
      cookieHeader,
    ),
  ]);

  return (
    <AdminCertificatesClient
      initialItems={certificates?.items ?? null}
      initialCategories={categories?.categories ?? null}
      initialStats={stats?.items ?? null}
      initialOrganizations={organizations?.items ?? null}
    />
  );
}