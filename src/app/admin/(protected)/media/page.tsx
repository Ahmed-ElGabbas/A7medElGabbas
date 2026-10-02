import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type { AdminMediaAsset, MediaStatus } from "@/lib/admin-api";
import AdminMediaClient from "./media-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Media",
};

export default async function AdminMediaPage() {
  const cookieHeader = (await cookies()).toString();

  const [media, status] = await Promise.all([
    adminServerFetch<{ items: AdminMediaAsset[] }>("/media", cookieHeader),
    adminServerFetch<MediaStatus>("/media/status", cookieHeader),
  ]);

  return (
    <AdminMediaClient initialItems={media?.items ?? null} initialStatus={status} />
  );
}