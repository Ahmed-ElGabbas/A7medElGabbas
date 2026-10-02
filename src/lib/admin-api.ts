/**
 * Browser-side helpers for the admin panel.
 *
 * All calls go through the relative /api/* path so Next's rewrite proxies them
 * to the backend on the same origin — that keeps the httpOnly auth cookie
 * same-site and avoids CORS entirely (see next.config.ts).
 */

export type MediaKind = "IMAGE" | "PDF";

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  featured: boolean;
  imageUrl: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  order: number;
  updatedAt: string;
}

export interface AdminCertificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string | null;
  category: string;
  categoryLabel: string;
  skills: string[];
  badgeText: string;
  description: string;
  featured: boolean;
  previewImageUrl: string | null;
  fileUrl: string | null;
  order: number;
  updatedAt: string;
}

export interface AdminMediaAsset {
  id: string;
  url: string;
  kind: MediaKind;
  originalFilename: string | null;
  size: number | null;
  createdAt: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface MediaStatus {
  configured: boolean;
  missing: string[];
  maxUploadBytes: number;
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "message" in payload) {
    const { message } = payload as { message: unknown };
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new AdminApiError("Could not reach the API. Is the backend running?", 0);
  }

  if (res.status === 204) return undefined as T;

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new AdminApiError(extractMessage(payload, `Request failed (${res.status})`), res.status);
  }

  return payload as T;
}

export const adminApi = {
  listProjects: () => apiFetch<{ items: AdminProject[] }>("/projects"),
  projectCategories: () => apiFetch<{ categories: string[] }>("/projects/categories"),
  createProject: (body: unknown) =>
    apiFetch<AdminProject>("/projects", { method: "POST", body: JSON.stringify(body) }),
  updateProject: (id: string, body: unknown) =>
    apiFetch<AdminProject>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteProject: (id: string) => apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),
  reorderProjects: (ids: string[]) =>
    apiFetch<{ items: AdminProject[] }>("/projects/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),

  listCertificates: () => apiFetch<{ items: AdminCertificate[] }>("/certificates"),
  certificateCategories: () =>
    apiFetch<{ categories: CategoryOption[] }>("/certificates/categories"),
  createCertificate: (body: unknown) =>
    apiFetch<AdminCertificate>("/certificates", { method: "POST", body: JSON.stringify(body) }),
  updateCertificate: (id: string, body: unknown) =>
    apiFetch<AdminCertificate>(`/certificates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteCertificate: (id: string) =>
    apiFetch<void>(`/certificates/${id}`, { method: "DELETE" }),
  reorderCertificates: (ids: string[]) =>
    apiFetch<{ items: AdminCertificate[] }>("/certificates/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),

  mediaStatus: () => apiFetch<MediaStatus>("/media/status"),
  listMedia: () => apiFetch<{ items: AdminMediaAsset[] }>("/media"),
  registerMedia: (body: unknown) =>
    apiFetch<AdminMediaAsset>("/media", { method: "POST", body: JSON.stringify(body) }),
  deleteMedia: (id: string) => apiFetch<void>(`/media/${id}`, { method: "DELETE" }),
};

export interface PresignResult {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresInSeconds: number;
}

/**
 * Three-step direct-to-R2 upload (BACKEND_PLAN.md §5):
 * ask the API to sign a PUT, send the bytes straight to R2, then record the
 * finished object in media_assets so it can be reused later.
 *
 * The Content-Type header on the PUT is not optional — it is part of the
 * signature, and R2 rejects a mismatched value with SignatureDoesNotMatch.
 */
export async function uploadFile(file: File): Promise<AdminMediaAsset> {
  const presign = await apiFetch<PresignResult>("/media/presign", {
    method: "POST",
    body: JSON.stringify({
      contentType: file.type,
      originalFilename: file.name,
      size: file.size,
    }),
  });

  const put = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!put.ok) {
    throw new AdminApiError(
      `Upload to storage failed (${put.status}). The presigned link may have expired — try again.`,
      put.status,
    );
  }

  return adminApi.registerMedia({
    contentType: file.type,
    originalFilename: file.name,
    size: file.size,
    key: presign.key,
    kind: file.type === "application/pdf" ? "PDF" : "IMAGE",
  });
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}