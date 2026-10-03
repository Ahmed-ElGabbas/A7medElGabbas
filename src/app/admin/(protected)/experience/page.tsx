import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type { ExperiencePayload } from "@/lib/admin-api";
import ExperienceClient from "./experience-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Experience",
};

export default async function AdminExperiencePage() {
  const cookieHeader = (await cookies()).toString();
  const payload = await adminServerFetch<ExperiencePayload>("/experience", cookieHeader);

  return <ExperienceClient initial={payload ?? null} />;
}