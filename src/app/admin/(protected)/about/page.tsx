import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type { AdminAboutContent } from "@/lib/admin-api";
import AboutClient from "./about-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
};

export default async function AdminAboutPage() {
  const cookieHeader = (await cookies()).toString();
  const about = await adminServerFetch<AdminAboutContent>("/about", cookieHeader);

  return <AboutClient initialAbout={about ?? null} />;
}