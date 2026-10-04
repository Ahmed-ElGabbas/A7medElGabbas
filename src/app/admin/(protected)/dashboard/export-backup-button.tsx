"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { adminApi } from "@/lib/admin-api";

/**
 * Downloads a JSON snapshot of all portfolio content.
 *
 * Fetched rather than linked so the request carries the httpOnly session cookie
 * (a plain `<a href>` would too, but going through `apiFetch` also surfaces a
 * 401 as a readable message instead of a browser download of an error body).
 *
 * `admin_users` and `contact_submissions` are excluded server-side.
 */
export default function AdminExportBackupButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleExport() {
    setPending(true);
    setError(null);
    setNotice(null);

    try {
      const backup = await adminApi.exportBackup();

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      // Dated from the payload's own generatedAt rather than the browser clock,
      // so the filename always matches what is inside the file.
      const stamp = new Date(backup.generatedAt)
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `portfolio-backup-${stamp}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      // Revoked on the next tick: revoking synchronously can cancel the download
      // in some browsers before it has started reading the blob.
      setTimeout(() => URL.revokeObjectURL(url), 0);

      const tables = Object.keys(backup.data).length;
      setNotice(`Exported ${tables} tables.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not export the backup.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleExport}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs transition-colors hover:border-accent-gold/45 hover:bg-accent/10 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <Download className="h-3.5 w-3.5 gold-text" aria-hidden />
        )}
        {pending ? "Exporting…" : "Export backup"}
      </button>

      {error ? (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="text-[11px] gold-text">
          {notice}
        </p>
      ) : null}
    </div>
  );
}