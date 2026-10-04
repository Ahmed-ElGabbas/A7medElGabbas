import type { Metadata } from "next";
import AdminDashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * The counters and activity feed arrive with the layout (see layout.tsx) and
 * are read from context, so this page renders no fetches of its own.
 */
export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}