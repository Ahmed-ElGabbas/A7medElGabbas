"use client";

import Link from "next/link";
import { ExternalLink, Home } from "lucide-react";
import AdminSidebar from "./admin-sidebar";
import AdminDashboardSearch from "./dashboard-search";
import AdminChangePasswordDialog from "./change-password-dialog";
import AdminExportBackupButton from "./export-backup-button";
import { DashboardOverviewProvider } from "./overview-context";
import type { AdminDashboardOverview } from "@/lib/admin-api";

const ACTION_CLASS =
  "inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs transition-colors hover:border-accent-gold/45 hover:bg-accent/10";

/**
 * Two-column dashboard frame: the persistent rail plus a sticky header over the
 * page body.
 *
 * Scoped to the dashboard route on purpose — the section manager pages keep the
 * plain top bar from (protected)/layout.tsx and are untouched by this pass.
 */
export default function AdminDashboardShell({
  overview,
  email,
  children,
}: {
  overview: AdminDashboardOverview | null;
  email: string | null;
  children: React.ReactNode;
}) {
  return (
    <DashboardOverviewProvider value={overview}>
      <div className="relative flex min-h-screen">
        <AdminSidebar
          counts={overview?.counts ?? null}
          unreadContacts={overview?.contact.unread ?? 0}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass-panel sticky top-0 z-20 rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <AdminDashboardSearch />

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Link href="/" className={ACTION_CLASS} title="Open the public site">
                  <Home className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">Live site</span>
                </Link>

                <a
                  href="https://www.ahmedelgabbas.me"
                  target="_blank"
                  rel="noreferrer noopener"
                  title="Open the deployed production site in a new tab"
                  className={ACTION_CLASS}
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">Production</span>
                </a>

                <AdminExportBackupButton />

                {email ? <AdminChangePasswordDialog email={email} /> : null}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </DashboardOverviewProvider>
  );
}