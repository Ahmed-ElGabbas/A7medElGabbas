"use client";

import Link from "next/link";
import {
  Award,
  Briefcase,
  Building2,
  Code2,
  Compass,
  Feather,
  FolderGit2,
  Gauge,
  GraduationCap,
  Image as ImageIcon,
  Inbox,
  Layers,
  Plus,
  Quote,
  Settings,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useDashboardOverview } from "./overview-context";
import { pluralise } from "./sections";
import type { AdminActivityKind } from "@/lib/admin-api";

/** How many activity rows to show. The API is asked for this many too. */
const ACTIVITY_LIMIT = 10;

/** One icon per content table, so the feed reads as a log rather than a list. */
const ACTIVITY_ICON: Record<AdminActivityKind, LucideIcon> = {
  project: FolderGit2,
  certificate: Award,
  "certificate-stat": TrendingUp,
  "issuing-organization": Building2,
  "skill-category": Layers,
  skill: Code2,
  "skill-spotlight": Sparkles,
  "ticker-skill": Type,
  experience: Briefcase,
  education: GraduationCap,
  "quick-fact": Zap,
  "nav-item": Compass,
  stat: Gauge,
  "site-config": Settings,
  "social-links": Share2,
  about: Feather,
  "philosophy-quote": Quote,
  "future-goals": Target,
};

/**
 * Coarse "time since" label.
 *
 * Hand-rolled rather than `Intl.RelativeTimeFormat` so the output is identical
 * on the server and in the browser: a locale-formatted string would differ
 * between the SSR pass and hydration and trip a mismatch warning.
 */
function relativeTime(iso: string): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 6) return `${weeks}w ago`;

  /// Past a month an exact relative offset stops being useful; the ISO date is
  /// unambiguous and needs no locale.
  return iso.slice(0, 10);
}

export default function AdminDashboardClient() {
  const overview = useDashboardOverview();

  if (!overview) {
    return (
      <div className="glass-panel p-6">
        <h1 className="text-lg font-semibold tracking-tight">
          <span className="gold-text">{"//"}</span> dashboard
        </h1>
        <p className="mt-2 text-sm text-destructive">
          Could not load the dashboard from the API. Check that the backend is running, then
          reload.
        </p>
      </div>
    );
  }

  const { counts, contact, activity } = overview;

  const tiles = [
    {
      label: "Projects",
      unit: "project",
      value: counts.projects,
      href: "/admin/projects",
      icon: FolderGit2,
    },
    {
      label: "Certificates",
      unit: "certificate",
      value: counts.certificates,
      href: "/admin/certificates",
      icon: Award,
    },
    { label: "Skills", unit: "skill", value: counts.skills, href: "/admin/skills", icon: Code2 },
    {
      label: "Roles",
      unit: "role",
      value: counts.experiences,
      href: "/admin/experience",
      icon: Briefcase,
    },
  ];

  const quickActions = [
    { label: "Add project", href: "/admin/projects?new=1", icon: Plus },
    { label: "Add certificate", href: "/admin/certificates?new=1", icon: Plus },
    { label: "Upload media", href: "/admin/media", icon: ImageIcon },
    { label: "Edit site config", href: "/admin/site-config", icon: Settings },
  ];

  const rows = activity.slice(0, ACTIVITY_LIMIT);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Portfolio admin
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
            <span className="gold-text">{"//"}</span> dashboard
          </h1>
        </div>

        <p className="text-xs text-muted-foreground">
          {counts.mediaAssets} {pluralise(counts.mediaAssets, "media file")} ·{" "}
          {counts.skillCategories} {pluralise(counts.skillCategories, "skill category", "skill categories")}{" "}
          · {counts.education} {pluralise(counts.education, "education entry", "education entries")}
        </p>
      </div>

      {/* Content counts */}
      <section aria-label="Content overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link key={tile.label} href={tile.href} className="glass-panel-lift block p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-2xl font-semibold tabular-nums tracking-tight">
                  {tile.value}
                </span>
                <Icon className="h-4 w-4 shrink-0 gold-text" aria-hidden />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {tile.value} {pluralise(tile.value, tile.unit)}
              </p>
            </Link>
          );
        })}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Unread messages — the one number that is time-sensitive. */}
        <section
          aria-label="Contact inbox summary"
          className={`glass-panel p-5 ${
            contact.unread > 0 ? "gold-glow border-accent-gold/40" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-2xl font-semibold tabular-nums tracking-tight">
              {contact.unread}
            </span>
            <Inbox className="h-4 w-4 shrink-0 gold-text" aria-hidden />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            unread {pluralise(contact.unread, "message")} of {contact.total}
          </p>

          <Link
            href="/admin/contact"
            className="mt-4 inline-flex items-center gap-1.5 text-xs gold-text hover:underline"
          >
            Open inbox
            <span aria-hidden>→</span>
          </Link>
        </section>

        {/* Quick actions */}
        <section aria-label="Quick actions" className="glass-panel p-5 lg:col-span-2">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
            Quick actions
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-3 text-xs transition-colors hover:border-accent-gold/45 hover:bg-accent/10"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 gold-text" aria-hidden />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      {/* Recent activity */}
      <section aria-label="Recent activity" className="glass-panel p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
            Recent activity
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Last {rows.length} {pluralise(rows.length, "change")}, newest first
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Nothing has been edited yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {rows.map((entry) => {
              const Icon = ACTIVITY_ICON[entry.kind];

              return (
                <li key={entry.id}>
                  <Link
                    href={entry.href}
                    className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent-gold/25 bg-accent/10">
                      <Icon className="h-3.5 w-3.5 gold-text" aria-hidden />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{entry.title}</span>
                      <span className="block truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                        {entry.section}
                      </span>
                    </span>

                    {/* Relative labels are computed from Date.now(), which differs
                        by a second between the SSR pass and hydration. */}
                    <time
                      dateTime={entry.updatedAt}
                      title={entry.updatedAt}
                      suppressHydrationWarning
                      className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
                    >
                      {relativeTime(entry.updatedAt)}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}