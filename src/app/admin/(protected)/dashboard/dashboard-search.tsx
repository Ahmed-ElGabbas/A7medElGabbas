"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  FolderGit2,
  Inbox,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { adminApi, type AdminSearchResult } from "@/lib/admin-api";

/** Debounce before hitting the API, so typing does not fire a request per keystroke. */
const DEBOUNCE_MS = 250;

const KIND_ICON = {
  project: FolderGit2,
  certificate: Award,
  submission: Inbox,
} as const;

const KIND_LABEL = {
  project: "Project",
  certificate: "Certificate",
  submission: "Message",
} as const;

/**
 * Header search across projects, certificates and contact submissions.
 *
 * Results are deep links that carry the row id, so following one lands on the
 * editor for that exact item rather than the top of its section.
 */
export default function AdminDashboardSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();

  /// Guards against an earlier, slower request overwriting a later one's results.
  const requestRef = useRef(0);

  const runSearch = useCallback(async (term: string) => {
    const token = ++requestRef.current;

    if (!term.trim()) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");

    try {
      const response = await adminApi.dashboardSearch(term);
      if (token !== requestRef.current) return;
      setResults(response.results);
      setStatus("ready");
    } catch {
      if (token !== requestRef.current) return;
      setResults([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => void runSearch(query), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query, runSearch]);

  /// Close on an outside click, and support Escape — the dropdown floats over the
  /// page, so without this it would stay open across unrelated navigation.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const hasQuery = query.trim().length > 0;
  const showPanel = open && hasQuery;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <label htmlFor="admin-search" className="sr-only">
        Search projects, certificates and messages
      </label>

      <div className="relative">
        {status === "loading" ? (
          <Loader2
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : (
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        )}

        <input
          id="admin-search"
          ref={inputRef}
          type="search"
          role="combobox"
          autoComplete="off"
          aria-expanded={showPanel}
          aria-controls={listboxId}
          aria-autocomplete="list"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search projects, certificates, messages…"
          className="w-full rounded-xl border border-border bg-background/60 py-2.5 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent-gold focus:ring-2 focus:ring-accent/25 [&::-webkit-search-cancel-button]:hidden"
        />

        {hasQuery ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setStatus("idle");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      {showPanel ? (
        <div className="glass-panel absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden p-1.5">
          {status === "loading" && results.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">Searching…</p>
          ) : status === "error" ? (
            <p className="px-3 py-4 text-center text-xs text-destructive">
              Search failed. Check that the API is reachable.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No matches for{" "}
              <span className="font-semibold text-foreground">{query.trim()}</span>
            </p>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Search results" className="max-h-80 overflow-y-auto">
              {results.map((result) => {
                const Icon = KIND_ICON[result.kind];
                return (
                  <li key={`${result.kind}:${result.id}`} role="option" aria-selected={false}>
                    <Link
                      href={result.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-accent/10"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 gold-text" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px]">{result.title}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {KIND_LABEL[result.kind]} · {result.subtitle}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}