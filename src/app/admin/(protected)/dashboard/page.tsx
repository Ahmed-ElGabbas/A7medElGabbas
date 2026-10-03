import type { Metadata } from "next";
import { cookies } from "next/headers";
import { adminServerFetch } from "@/lib/admin-session";
import type { ContactInbox } from "@/lib/admin-api";
import AdminDashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  const cookieHeader = (await cookies()).toString();

  /// Only the unread count is needed here; a failure just means the dashboard
  /// card shows no badge, which is not worth surfacing an error for.
  const inbox = await adminServerFetch<ContactInbox>("/contact/submissions", cookieHeader);

  return <AdminDashboardClient unreadContacts={inbox?.unreadCount ?? 0} />;
}