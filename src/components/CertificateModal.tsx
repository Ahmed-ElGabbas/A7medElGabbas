"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  X,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Certificate } from "@/data/portfolio";

const CertificatePdfViewer = dynamic(
  () => import("@/components/CertificatePdfViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <span className="font-mono text-xs">Loading PDF…</span>
      </div>
    ),
  }
);

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;
const ZOOM_DEFAULT = 1;

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

function getFileKind(file: string): "pdf" | "image" {
  return /\.pdf$/i.test(file) ? "pdf" : "image";
}

function GlassControlButton({
  className,
  label,
  ...props
}: React.ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg border border-(--color-border) bg-(--color-glass-fill-strong) text-muted-foreground transition-colors duration-150 hover:text-foreground hover:border-primary/40 disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    />
  );
}

export default function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const file = certificate.file;
  const kind = file ? getFileKind(file) : "image";
  const fileUrl = file ? encodeURI(file) : "";

  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const [zoom, setZoom] = useState(ZOOM_DEFAULT);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusable = panel?.querySelector<HTMLElement>("[data-autofocus]");
    focusable?.focus();
    return () => {
      document.body.style.overflow = "";
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const goToPage = useCallback(
    (next: number) => {
      setPageNumber(Math.min(Math.max(next, 1), Math.max(numPages, 1)));
    },
    [numPages]
  );

  const isPdf = kind === "pdf";
  const hasMultiplePages = isPdf && numPages > 1;

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-modal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex w-full max-w-3xl md:max-w-4xl max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-glass-fill) backdrop-blur-md shadow-2xl shadow-black/50"
      >
        {/* Title bar */}
        <div className="relative flex items-center justify-between gap-3 border-b border-(--color-border) bg-(--color-glass-fill-strong) px-4 py-3">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <h3
            id="cert-modal-title"
            className="truncate px-2 font-display text-xs font-semibold text-foreground sm:text-sm md:absolute md:left-1/2 md:max-w-[55%] md:-translate-x-1/2 md:text-center"
          >
            {certificate.title}
          </h3>
          <div className="flex items-center gap-2">
            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 text-[11px] font-medium text-primary transition-colors duration-150 hover:bg-primary hover:text-primary-foreground sm:px-3"
              >
                <ExternalLink size={13} />
                <span className="hidden sm:inline">Open in new tab</span>
              </a>
            )}
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              aria-label="Close certificate preview"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-border) text-muted-foreground transition-colors duration-150 hover:border-destructive/50 hover:text-destructive"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--color-border) bg-(--color-glass-fill) px-3 py-2 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-primary">
              {isPdf ? <FileText size={11} /> : <ImageIcon size={11} />}
              {isPdf ? "PDF" : "Image"}
            </span>
            {isPdf && (
              <div className="flex items-center gap-1.5">
                <GlassControlButton
                  label="Previous page"
                  disabled={!hasMultiplePages || pageNumber <= 1}
                  onClick={() => goToPage(pageNumber - 1)}
                >
                  <ChevronLeft size={14} />
                </GlassControlButton>
                <span className="min-w-16 text-center font-mono text-[11px] text-muted-foreground">
                  {numPages > 0 ? `${pageNumber} / ${numPages}` : "…"}
                </span>
                <GlassControlButton
                  label="Next page"
                  disabled={!hasMultiplePages || pageNumber >= numPages}
                  onClick={() => goToPage(pageNumber + 1)}
                >
                  <ChevronRight size={14} />
                </GlassControlButton>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <GlassControlButton
              label="Zoom out"
              disabled={zoom <= ZOOM_MIN}
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
            >
              <ZoomOut size={14} />
            </GlassControlButton>
            <span className="min-w-11 text-center font-mono text-[11px] text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
            <GlassControlButton
              label="Zoom in"
              disabled={zoom >= ZOOM_MAX}
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
            >
              <ZoomIn size={14} />
            </GlassControlButton>
            <GlassControlButton
              label="Reset zoom"
              disabled={zoom === ZOOM_DEFAULT}
              onClick={() => setZoom(ZOOM_DEFAULT)}
            >
              <RotateCcw size={13} />
            </GlassControlButton>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 overflow-auto bg-background/40 p-4 sm:p-6">
          {!file ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <p className="text-sm">This certificate has no document attached yet.</p>
            </div>
          ) : isPdf ? (
            <CertificatePdfViewer
              file={fileUrl}
              zoom={zoom}
              pageNumber={pageNumber}
              onDocumentLoad={(loadedNumPages) => {
                setNumPages(loadedNumPages);
                setPageNumber(1);
              }}
            />
          ) : (
            <div className="flex justify-center">
              <Image
                src={fileUrl}
                alt={certificate.title}
                width={1200}
                height={1600}
                unoptimized
                style={{ zoom }}
                className="h-auto w-auto max-w-full rounded-md object-contain shadow-lg shadow-black/50"
              />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}