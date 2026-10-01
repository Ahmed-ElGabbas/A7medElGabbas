import type { Metadata } from "next";
import AdminDashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
