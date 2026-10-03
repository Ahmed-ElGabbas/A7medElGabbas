"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MailOpen, Reply } from "lucide-react";
import {
  adminApi,
  type AdminContactSubmission,
  type ContactInbox,
} from "@/lib/admin-api";
import { ErrorNote, SuccessNote } from "@/components/admin/field";

type Filter = "all" | "unread";

function mailtoFor(submission: AdminContactSubmission): string {
  const subject = submission.subject.trim()
    ? `Re: ${submission.subject.trim()}`
    : "Re: your message";
  return `mailto:${submission.email}?subject=${encodeURIComponent(subject)}`;
}

export default function AdminContactClient({
  initialInbox,
  highlightId,
}: {
  initialInbox: ContactInbox | null;
  highlightId: string | null;
}) {
  const [items, setItems] = useState<AdminContactSubmission[]>(initialInbox?.items ?? []);
  /// Never refetched client-side, so this is a plain constant rather than state.
  const notifications = initialInbox?.notifications ?? null;
  const loadError =
    initialInbox === null ? "Could not load the contact inbox from the API." : null;
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);

  const highlightedRef = useRef<HTMLLIElement | null>(null);

  /**
   * Brings the submission from the notification email's ?submission=<id> link
   * into view. Runs after hydration so the server-rendered markup is not
   * disturbed, and only when the id actually matches a row.
   */
  useEffect(() => {
    if (!highlightId) return;
    highlightedRef.current?.scrollIntoView({ block: "center" });
  }, [highlightId]);

  const unreadCount = items.filter((item) => !item.read).length;
  const visible =
    filter === "unread" ? items.filter((item) => !item.read) : items;

  async function toggleRead(submission: AdminContactSubmission) {
    const next = !submission.read;
    setError(null);
    setPendingId(submission.id);

    // Optimistic: the badge should not lag a click behind a round trip.
    setItems((current) =>
      current.map((item) => (item.id === submission.id ? { ...item, read: !next } : item)),
    );

    try {
      const updated = await adminApi.markSubmissionRead(submission.id, next);
      setItems((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(next ? "Marked as read." : "Marked as unread.");
    } catch (caught) {
      setItems((current) =>
        current.map((item) => (item.id === submission.id ? { ...item, read: !next } : item)),
      );
      setError(
        caught instanceof Error ? caught.message : "Could not update the submission.",
      );
    } finally {
      setPendingId(null);
    }
  }

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <Link
        href="/admin/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        dashboard
      </Link>

      <div className="mb-1 flex flex-wrap items-baseline gap-2">
        <h1 className="text-xl font-semibold tracking-tight">
          <span className="gold-text">{"//"}</span> contact inbox
        </h1>
        {unreadCount > 0 ? (
          <span className="rounded-full border border-accent-gold/40 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent-gold">
            {unreadCount} unread
          </span>
        ) : null}
      </div>
      <p className="mb-6 text-xs text-muted-foreground">
        Replying opens your own mail client — there is no in-app composer.
      </p>

      <ErrorNote>{error ?? loadError}</ErrorNote>
      <SuccessNote>{notice}</SuccessNote>

      {notifications && !notifications.configured ? (
        <p className="mb-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Email notifications are off — set{" "}
          <span className="font-mono text-foreground">
            {notifications.missing.join(", ")}
          </span>{" "}
          in <span className="font-mono text-foreground">backend/.env</span>. Submissions
          are still saved and listed here.
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="mb-4 inline-flex rounded-lg border border-border p-0.5">
          {(
            [
              ["all", `All (${items.length})`],
              ["unread", `Unread (${unreadCount})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${
                filter === value
                  ? "bg-accent/15 text-accent-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {initialInbox === null ? null : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing unread.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((submission) => {
            const isHighlighted = submission.id === highlightId;
            const isOpen = expanded.has(submission.id) || isHighlighted;

            return (
              <li
                key={submission.id}
                ref={isHighlighted ? highlightedRef : undefined}
                className={`glass-card p-4 transition-colors ${
                  isHighlighted ? "border-accent-gold/60" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {!submission.read ? (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-accent-gold"
                          aria-label="Unread"
                        />
                      ) : null}
                      <span
                        className={`text-sm ${
                          submission.read ? "text-muted-foreground" : "font-semibold"
                        }`}
                      >
                        {submission.name}
                      </span>
                      <a
                        href={`mailto:${submission.email}`}
                        className="truncate text-xs text-muted-foreground hover:text-foreground"
                      >
                        {submission.email}
                      </a>
                    </div>

                    <p className="mt-1 text-sm text-foreground/90">
                      {submission.subject.trim() || <em className="text-muted-foreground">no subject</em>}
                    </p>
                  </div>

                  {/* suppressHydrationWarning: this string is formatted in the
                      visitor's locale on the client and the server's on the SSR
                      pass, so the two legitimately differ. */}
                  <time
                    dateTime={submission.createdAt}
                    suppressHydrationWarning
                    title={submission.createdAt}
                    className="shrink-0 text-[11px] text-muted-foreground"
                  >
                    {new Date(submission.createdAt).toLocaleString()}
                  </time>
                </div>

                <p
                  className={`mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/80 ${
                    isOpen ? "" : "line-clamp-3"
                  }`}
                >
                  {submission.message}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href={mailtoFor(submission)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] transition-colors hover:border-accent-gold hover:bg-accent/10"
                  >
                    <Reply className="h-3 w-3" aria-hidden />
                    Reply
                  </a>

                  <button
                    type="button"
                    onClick={() => void toggleRead(submission)}
                    disabled={pendingId === submission.id}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] transition-colors hover:bg-accent/10 disabled:opacity-60"
                  >
                    {submission.read ? (
                      <Mail className="h-3 w-3" aria-hidden />
                    ) : (
                      <MailOpen className="h-3 w-3" aria-hidden />
                    )}
                    {submission.read ? "Mark unread" : "Mark as read"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleExpanded(submission.id)}
                    className="text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {isOpen ? "Show less" : "Show full message"}
                  </button>

                  {!submission.read ? (
                    <span className="ml-auto rounded-full border border-accent-gold/40 bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent-gold">
                      unread
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}