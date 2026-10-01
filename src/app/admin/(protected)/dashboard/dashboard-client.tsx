"use client";

import Link from "next/link";
import { ExternalLink, Home } from "lucide-react";

const SECTIONS = [
  { label: "Site config", state: "Stage 0" },
  { label: "Navigation", state: "Stage 0" },
  { label: "Projects", state: "Stage 1" },
  { label: "Certificates", state: "Stage 1" },
  { label: "Contact inbox", state: "Stage 2" },
  { label: "Hero & stats", state: "Stage 3" },
  { label: "About", state: "Stage 3" },
  { label: "Skills", state: "Stage 3" },
  { label: "Experience", state: "Stage 3" },
];

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
          {SECTIONS.map((section) => (
            <li
              key={section.label}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <span className="text-sm">{section.label}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {section.state}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
