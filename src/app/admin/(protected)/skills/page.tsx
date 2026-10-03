import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type { SkillsPayload } from "@/lib/admin-api";
import SkillsClient from "./skills-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Skills",
};

/**
 * One page for all three skills data sets the section renders: the category
 * cards (each with nested skills + a spotlight), the philosophy quote, and the
 * ticker strip. They are edited together because they only ever appear as one
 * section.
 */
export default async function AdminSkillsPage() {
  const cookieHeader = (await cookies()).toString();
  const payload = await adminServerFetch<SkillsPayload>("/skills", cookieHeader);

  return <SkillsClient initial={payload ?? null} />;
}