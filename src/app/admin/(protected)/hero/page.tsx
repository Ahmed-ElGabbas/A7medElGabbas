import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type { AdminStat } from "@/lib/admin-api";
import HeroClient from "./hero-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hero & stats",
};

/**
 * The hero strip is four stat rows, not the whole hero — the identity fields it
 * also renders (name, title, headline, roles, photo) live under Site config,
 * since they are the same `site_config` singleton the footer and header read.
 * This page exists to avoid editing one row from two places.
 */
export default async function AdminHeroPage() {
  const cookieHeader = (await cookies()).toString();
  const stats = await adminServerFetch<{ items: AdminStat[] }>("/stats", cookieHeader);

  return <HeroClient initialItems={stats?.items ?? null} />;
}