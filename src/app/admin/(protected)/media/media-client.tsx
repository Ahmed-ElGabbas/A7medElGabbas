"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import {
  adminApi,
  formatBytes,
  type AdminMediaAsset,
  type MediaStatus,
} from "@/lib/admin-api";
import { ErrorNote, SuccessNote } from "@/components/admin/field";
import { AssetThumb, UploadDropzone } from "@/components/admin/upload-dropzone";

export default function AdminMediaClient({
  initialItems,
  initialStatus,
}: {
  initialItems: AdminMediaAsset[] | null;
  initialStatus: MediaStatus | null;
}) {
  const [assets, setAssets] = useState<AdminMediaAsset[]>(initialItems ?? []);
  const [status, setStatus] = useState<MediaStatus | null>(initialStatus);
  const [loadError, setLoadError] = useState<string | null>(
    initialItems === null ? "Could not load the media library from the API." : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /** Refetch after a mutation. Never called on mount — the page server-fetches. */
  async function load() {
    try {
      const [media, mediaStatus] = await Promise.all([
        adminApi.listMedia(),
        adminApi.mediaStatus(),
      ]);
      setAssets(media.items);
      setStatus(mediaStatus);
      setLoadError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the media library.");
    }
  }

  async function handleDelete(asset: AdminMediaAsset) {
    if (!window.confirm(`Delete ${asset.originalFilename ?? "this file"}?`)) return;
    setError(null);
    try {
      await adminApi.deleteMedia(asset.id);
      setNotice("File deleted.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the file.");
    }
  }

  async function copyUrl(asset: AdminMediaAsset) {
    try {
      await navigator.clipboard.writeText(asset.url);
      setNotice("URL copied to clipboard.");
    } catch {
      setError("Clipboard is unavailable in this browser. Copy the URL manually.");
    }
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

      <h1 className="mb-1 text-xl font-semibold tracking-tight">
        <span className="gold-text">{"//"}</span> media
      </h1>
      <p className="mb-6 text-xs text-muted-foreground">
        Uploads go straight to Cloudflare R2 through a short-lived presigned link.
      </p>

      <ErrorNote>{error ?? loadError}</ErrorNote>
      <SuccessNote>{notice}</SuccessNote>

      <section className="glass-card mb-8 p-5">
        <h2 className="mb-3 text-sm font-semibold">Upload</h2>
        {status ? (
          <UploadDropzone
            maxUploadBytes={status.maxUploadBytes}
            blockedReason={
              status.configured
                ? null
                : `Storage is not configured yet — set ${status.missing.join(", ")} in backend/.env, then restart the API. Everything else works without it.`
            }
            onUploaded={() => {
              setNotice("Upload complete.");
              void load();
            }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Checking storage configuration…</p>
        )}
      </section>

      <h2 className="mb-3 text-sm font-semibold">
        Library {assets.length > 0 ? `(${assets.length})` : ""}
      </h2>

      {initialItems === null ? null : assets.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing uploaded yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {assets.map((asset) => (
            <li key={asset.id} className="glass-card space-y-2 p-3">
              <AssetThumb asset={asset} className="h-28 w-full" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">
                  {asset.originalFilename ?? "Untitled"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {asset.kind} · {formatBytes(asset.size)}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => void copyUrl(asset)}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] transition-colors hover:bg-accent"
                >
                  <Copy className="h-3 w-3" aria-hidden />
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(asset)}
                  aria-label={`Delete ${asset.originalFilename ?? "file"}`}
                  className="rounded-md border border-border px-2 py-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}