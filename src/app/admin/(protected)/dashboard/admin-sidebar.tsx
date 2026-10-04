"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Terminal } from "lucide-react";
import AdminSignOutButton from "../sign-out-button";
import { ADMIN_SECTIONS, isActiveSection, pluralise } from "./sections";
import type { AdminDashboardOverview } from "@/lib/admin-api";

/**
 * The dashboard's persistent left rail. Always rendered, at every breakpoint —
 * there is no collapse toggle, because the dashboard is the only page in this
 * pass that uses the rail and a hideable one would just add state to maintain.
 *
 * Narrow screens keep the rail (narrower, labels only) rather than dropping to
 * a drawer: the section list is the primary navigation for this page.
 */
export default function AdminSidebar({
  counts,
  unreadContacts,
}: {
  counts: AdminDashboardOverview["counts"] | null;
  unreadContacts: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  return (
    <aside className="glass-sidebar sticky top-0 z-30 flex h-screen w-52 shrink-0 flex-col lg:w-64">
      <div className="flex items-center gap-2.5 px-4 py-5 lg:px-6">
        <span className="gold-glow-sm flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent-gold/30 bg-accent/10">
          <Terminal className="h-4 w-4 gold-text" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold tracking-tight">
            <span className="gold-text">{"//"}</span> admin
          </span>
          <span className="block truncate text-[10px] uppercase tracking-wider text-muted-foreground">
            control panel
          </span>
        </span>
      </div>

      <hr className="gold-hairline mx-4 lg:mx-6" />

      <nav aria-label="Admin sections" className="flex-1 overflow-y-auto px-2.5 py-4 lg:px-3.5">
        <ul className="space-y-0.5">
          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon;
            const active = isActiveSection(section.href, pathname, search);
            const count = section.countKey ? counts?.[section.countKey] : undefined;
            const unread = section.label === "Contact inbox" ? unreadContacts : 0;

            return (
              <li key={section.href}>
                <Link
                  href={section.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-all duration-300 lg:px-3 ${
                    active
                      ? "border-accent-gold/45 bg-accent/10 gold-glow-sm"
                      : "border-transparent hover:border-accent-gold/25 hover:bg-accent/5"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      active ? "gold-text" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                    aria-hidden
                  />

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[13px] leading-tight ${
                        active ? "font-semibold text-foreground" : "text-foreground/85"
                      }`}
                    >
                      {section.label}
                    </span>
                    {section.hint ? (
                      <span className="hidden truncate text-[10px] leading-tight text-muted-foreground lg:block">
                        {section.hint}
                      </span>
                    ) : null}
                  </span>

                  {unread > 0 ? (
                    <span className="shrink-0 rounded-full border border-accent-gold/40 bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums gold-text">
                      {unread}
                    </span>
                  ) : typeof count === "number" && count > 0 ? (
                    <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 pb-5 lg:px-6">
        <p className="mb-3 text-[10px] leading-relaxed text-muted-foreground">
          {counts
            ? `${counts.projects} ${pluralise(counts.projects, "project")} · ${counts.certificates} ${pluralise(counts.certificates, "certificate")}`
            : "Counters unavailable"}
        </p>
        {/* Reused from the section pages so signing out stays one code path. */}
        <AdminSignOutButton />
      </div>
    </aside>
  );
}