"use client";

import { createContext, useContext } from "react";
import type { AdminDashboardOverview } from "@/lib/admin-api";

/**
 * Overview payload, fetched once in the dashboard layout.
 *
 * The shell (sidebar counters, header) and the page body (stat tiles, activity
 * feed) are siblings under that layout, so context is what lets them share one
 * request instead of each fetching its own copy.
 *
 * `null` means the server-side fetch failed — the UI shows that rather than
 * rendering a wall of zeroes that would read as "no content yet".
 */
const DashboardOverviewContext = createContext<AdminDashboardOverview | null>(null);

export const DashboardOverviewProvider = DashboardOverviewContext.Provider;

export function useDashboardOverview(): AdminDashboardOverview | null {
  return useContext(DashboardOverviewContext);
}