"use client";

import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ExternalLink } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface CertificatePdfViewerProps {
  file: string;
  zoom: number;
  pageNumber: number;
  onDocumentLoad: (numPages: number) => void;
}

export default function CertificatePdfViewer({
  file,
  zoom,
  pageNumber,
  onDocumentLoad,
}: CertificatePdfViewerProps) {
  return (
    <Document
      file={file}
      onLoadSuccess={(pdf: PDFDocumentProxy) => onDocumentLoad(pdf.numPages)}
      loading={
        <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          <span className="font-mono text-xs">Loading PDF…</span>
        </div>
      }
      error={
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
          <p className="text-sm">Failed to render this PDF.</p>
          <a
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink size={12} /> Open in new tab
          </a>
        </div>
      }
      noData={
        <div className="flex min-h-48 items-center justify-center text-muted-foreground">
          <p className="text-sm">No PDF file specified.</p>
        </div>
      }
      className="flex justify-center"
    >
      <Page
        pageNumber={pageNumber}
        scale={zoom}
        renderTextLayer={false}
        renderAnnotationLayer={false}
        className="shadow-lg shadow-black/50"
      />
    </Document>
  );
}