"use client";

import Link from "next/link";
import { ExternalLink, Home } from "lucide-react";

const SECTIONS = [
  { label: "Site config", href: null, state: "Stage 0" },
  { label: "Navigation", href: null, state: "Stage 0" },
  { label: "Projects", href: "/admin/projects", state: "Stage 1" },
  { label: "Certificates", href: "/admin/certificates", state: "Stage 1" },
  { label: "Media", href: "/admin/media", state: "Stage 1" },
  { label: "Contact inbox", href: null, state: "Stage 2" },
  { label: "Hero & stats", href: null, state: "Stage 3" },
  { label: "About", href: null, state: "Stage 3" },
  { label: "Skills", href: null, state: "Stage 3" },
  { label: "Experience", href: null, state: "Stage 3" },
] as const;

export default function AdminDashboardClient() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Portfolio admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            <span className="gold-text">{"//"}</span> dashboard
          </h1>
        </div>

        <div className="flex gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-accent"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            View live site
          </Link>
          <a
            href="https://ahmedelgabbas.dev"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-accent"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Production
          </a>
        </div>
      </div>

      <section className="glass-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Sections
        </h2>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => {
            const body = (
              <>
                <span className="text-sm">{section.label}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {section.state}
                </span>
              </>
            );

            const className =
              "flex items-center justify-between rounded-lg border border-border px-4 py-3";

            // Sections from a later stage have no route yet, so they stay
            // inert instead of linking to a 404.
            return section.href ? (
              <li key={section.label}>
                <Link href={section.href} className={`${className} transition-colors hover:border-accent-gold hover:bg-accent/10`}>
                  {body}
                </Link>
              </li>
            ) : (
              <li key={section.label} className={className}>
                {body}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
