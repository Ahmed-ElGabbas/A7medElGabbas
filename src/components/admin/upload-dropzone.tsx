"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import {
  AdminApiError,
  formatBytes,
  uploadFile,
  type AdminMediaAsset,
} from "@/lib/admin-api";
import { ErrorNote, SuccessNote } from "./field";

/**
 * Drag-and-drop uploader (BACKEND_PLAN.md §5). Files go straight from the
 * browser to R2 via a presigned PUT — the bytes never pass through NestJS.
 *
 * `blockedReason` is non-null when /media/status reports R2 is unconfigured; the
 * dropzone then disables itself and explains which env vars are missing instead
 * of letting the user pick a file and fail at submit time.
 */
export function UploadDropzone({
  blockedReason,
  maxUploadBytes,
  onUploaded,
  compact = false,
}: {
  blockedReason: string | null;
  maxUploadBytes: number;
  onUploaded: (asset: AdminMediaAsset) => void;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      setError(null);
      setDone(null);
      setBusy(true);
      try {
        for (const file of accepted) {
          const asset = await uploadFile(file);
          onUploaded(asset);
          setDone(`Uploaded ${asset.originalFilename ?? "file"}`);
        }
      } catch (caught) {
        setError(
          caught instanceof AdminApiError
            ? caught.message
            : "Upload failed unexpectedly. Check the console.",
        );
      } finally {
        setBusy(false);
      }
    },
    [onUploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: busy || blockedReason !== null,
    multiple: true,
    maxSize: maxUploadBytes,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/avif": [".avif"],
      "image/svg+xml": [".svg"],
      "application/pdf": [".pdf"],
    },
    onDropRejected: (rejections) => {
      const first = rejections[0];
      const code = first?.errors[0]?.code;
      setError(
        code === "file-too-large"
          ? `That file is larger than the ${formatBytes(maxUploadBytes)} limit.`
          : "That file type is not supported. Use an image or a PDF.",
      );
    },
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`rounded-xl border border-dashed p-6 text-center transition-colors ${
          blockedReason
            ? "cursor-not-allowed border-border opacity-60"
            : isDragActive
              ? "cursor-copy border-accent-gold bg-accent/10"
              : "cursor-pointer border-border hover:border-accent-gold/60 hover:bg-muted/30"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-accent-gold" aria-hidden />
          ) : (
            <UploadCloud className="h-5 w-5 text-muted-foreground" aria-hidden />
          )}
          <p className="text-sm">
            {busy
              ? "Uploading…"
              : isDragActive
                ? "Drop to upload"
                : compact
                  ? "Drop a file or click to choose"
                  : "Drag files here, or click to choose"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Images or PDF, up to {formatBytes(maxUploadBytes)}
          </p>
        </div>
      </div>

      {blockedReason ? <SuccessNote>{blockedReason}</SuccessNote> : null}
      <ErrorNote>{error}</ErrorNote>
      <SuccessNote>{done}</SuccessNote>
    </div>
  );
}

export function AssetThumb({
  asset,
  className = "",
}: {
  asset: Pick<AdminMediaAsset, "url" | "kind">;
  className?: string;
}) {
  if (asset.kind === "PDF") {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-border bg-muted/40 ${className}`}
      >
        <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    // Deliberately a plain img: next/image would need the R2 host added to
    // remotePatterns, and these are small admin thumbnails.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.url}
      alt=""
      className={`rounded-lg border border-border object-cover ${className}`}
    />
  );
}