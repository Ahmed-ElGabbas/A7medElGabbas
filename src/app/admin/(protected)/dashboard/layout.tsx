import { cookies } from "next/headers";
import { adminServerFetch, getSession } from "@/lib/admin-session";
import type { AdminDashboardOverview } from "@/lib/admin-api";
import AdminDashboardShell from "./dashboard-shell";

export const dynamic = "force-dynamic";

/**
 * Frame for the dashboard only.
 *
 * Lives here rather than in (protected)/layout.tsx so the section manager pages
 * keep the plain top bar they have today — this pass is dashboard-only.
 *
 * The overview is fetched once here and shared with the page body through
 * context (see overview-context.tsx), so the rail's counters and the stat tiles
 * come from a single request.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = (await cookies()).toString();

  /// The layout above already resolved the session; this only needs the address
  /// for the change-password dialog, and it is null-safe if that call fails.
  const [session, overview] = await Promise.all([
    getSession(cookieHeader),
    adminServerFetch<AdminDashboardOverview>("/dashboard/overview?limit=10", cookieHeader),
  ]);

  return (
    <AdminDashboardShell overview={overview} email={session?.email ?? null}>
      {children}
    </AdminDashboardShell>
  );
}