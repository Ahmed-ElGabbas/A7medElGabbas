import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type { ContactInbox } from "@/lib/admin-api";
import AdminContactClient from "./contact-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact inbox",
};

export default async function AdminContactPage({
  searchParams,
}: {
  // Backs the ?submission=<id> deep link in the notification email
  // (BACKEND_PLAN.md §4.4), so the admin lands on the exact message.
  searchParams: Promise<{ submission?: string | string[] }>;
}) {
  const cookieHeader = (await cookies()).toString();
  const params = await searchParams;

  const raw = params.submission;
  const highlightId = (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;

  const inbox = await adminServerFetch<ContactInbox>("/contact/submissions", cookieHeader);

  return (
    <AdminContactClient
      initialInbox={inbox}
      highlightId={highlightId}
    />
  );
}