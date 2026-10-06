import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import { readDeepLinkParams } from "@/lib/admin-deep-link";
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
 *  after a mutation.
 *
 *  `?id=` / `?new=1` are the dashboard's deep links into this page (search
 *  results and the "Add certificate" shortcut). */
export default async function AdminCertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[]; new?: string | string[] }>;
}) {
  const cookieHeader = (await cookies()).toString();
  const deepLink = readDeepLinkParams(await searchParams);

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
      deepLinkId={deepLink.targetId}
      openNew={deepLink.openNew}
    />
  );
}