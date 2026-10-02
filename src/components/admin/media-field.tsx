"use client";

import { useState } from "react";
import { FolderOpen, Upload, X } from "lucide-react";
import {
  adminApi,
  formatBytes,
  type AdminMediaAsset,
  type MediaStatus,
} from "@/lib/admin-api";
import { AssetThumb, UploadDropzone } from "./upload-dropzone";
import { ErrorNote, TextInput } from "./field";

/**
 * A URL field that can also be filled from the media library or a fresh upload.
 *
 * The plain text input stays authoritative and editable on purpose: projects
 * still reference legacy root-relative paths such as
 * /assets/certificates/x.pdf until that content is migrated to R2, so an
 * upload-only widget would make those rows unsaveable.
 */
export function MediaField({
  label,
  value,
  onChange,
  hint,
  kind,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  kind?: "IMAGE" | "PDF";
}) {
  const [mode, setMode] = useState<"none" | "upload" | "library">("none");
  const [assets, setAssets] = useState<AdminMediaAsset[] | null>(null);
  const [status, setStatus] = useState<MediaStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openLibrary() {
    setError(null);
    setMode("library");
    if (assets) return;
    try {
      const res = await adminApi.listMedia();
      setAssets(res.items.filter((a) => (kind ? a.kind === kind : true)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the library.");
    }
  }

  async function openUpload() {
    setError(null);
    setMode("upload");
    try {
      setStatus(await adminApi.mediaStatus());
    } catch {
      // A failed status probe is not fatal; the dropzone will report the real
      // error when a presign is attempted.
    }
  }

  return (
    <div className="space-y-1.5">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground">{label}</span>

      <div className="flex gap-2">
        <TextInput
          value={value}
          onChange={onChange}
          placeholder="https://… or /assets/…"
        />
        <button
          type="button"
          onClick={openUpload}
          title="Upload a new file"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs transition-colors hover:bg-accent"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Upload
        </button>
        <button
          type="button"
          onClick={openLibrary}
          title="Pick from the media library"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs transition-colors hover:bg-accent"
        >
          <FolderOpen className="h-3.5 w-3.5" aria-hidden />
          Library
        </button>
      </div>

      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      <ErrorNote>{error}</ErrorNote>

      {mode === "upload" && status ? (
        <div className="mt-2 rounded-lg border border-border p-3">
          <UploadDropzone
            compact
            maxUploadBytes={status.maxUploadBytes}
            blockedReason={
              status.configured
                ? null
                : `Storage is not configured yet — set ${status.missing.join(", ")} in backend/.env to enable uploads.`
            }
            onUploaded={(asset) => {
              onChange(asset.url);
              setMode("none");
            }}
          />
        </div>
      ) : null}

      {mode === "library" ? (
        <div className="mt-2 rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {assets ? `${assets.length} available` : "Loading…"}
            </span>
            <button
              type="button"
              onClick={() => setMode("none")}
              aria-label="Close media picker"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          {assets && assets.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nothing uploaded yet. Use Upload to add your first file.
            </p>
          ) : null}

          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {assets?.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  onChange(asset.url);
                  setMode("none");
                }}
                title={asset.originalFilename ?? asset.url}
                className="space-y-1 rounded-lg p-1 text-left transition-colors hover:bg-muted"
              >
                <AssetThumb asset={asset} className="h-14 w-full" />
                <span className="block truncate text-[10px] text-muted-foreground">
                  {asset.originalFilename ?? formatBytes(asset.size)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}