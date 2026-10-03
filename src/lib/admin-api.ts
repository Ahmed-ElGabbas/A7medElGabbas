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

export interface AdminContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Keyed digest of the submitter's IP, never the address itself. */
  ipHash: string | null;
  userAgent: string | null;
  read: boolean;
  createdAt: string;
}

/** Whether email notifications can be sent, surfaced so the inbox can warn. */
export interface NotificationStatus {
  configured: boolean;
  missing: string[];
}

export interface ContactInbox {
  items: AdminContactSubmission[];
  unreadCount: number;
  notifications: NotificationStatus;
}

export interface MediaStatus {
  configured: boolean;
  missing: string[];
  maxUploadBytes: number;
}

/* ----------------------------- Stage 3 types ---------------------------- */
/* These mirror the DB row shapes the Stage 3 controllers return. Kept as
   distinct types from the public ones in @/lib/content because the admin needs
   the write-side fields (order, ids, nullable FKs) that the public page drops. */

export interface AdminSiteConfig {
  name: string;
  firstName: string | null;
  lastName: string | null;
  title: string;
  metaDescription: string;
  url: string | null;
  headline: string | null;
  photoUrl: string | null;
  resumeUrl: string | null;
  location: string | null;
  status: string | null;
  statusSubtext: string | null;
  roles: string[];
}

export interface AdminSocialLinks {
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  twitter: string;
  facebook: string;
}

export interface SiteConfigPayload {
  config: AdminSiteConfig | null;
  links: AdminSocialLinks | null;
}

export interface AdminNavItem {
  id: string;
  label: string;
  href: string;
  order: number;
}

export interface AdminSectionMeta {
  id: number;
  key: string;
  index: string | null;
  label: string | null;
  title: string;
  subtitle: string | null;
  order: number;
}

export interface AdminStat {
  id: string;
  value: string;
  label: string;
  order: number;
}

export interface AdminAboutContent {
  id: number;
  sectionSubtitle: string | null;
  narrativeTitle: string | null;
  paragraphs: string[];
  highlights: string[];
  academicFocusTitle: string | null;
  academicFocusDescription: string | null;
  quickFacts: AdminQuickFact[];
}

export interface AdminQuickFact {
  id: string;
  label: string;
  value: string;
  detail: string | null;
  icon: string | null;
  order: number;
}

export interface AdminSkillSpotlight {
  id: string;
  categoryId: string;
  summary: string | null;
  patterns: string[];
  primaryProject: string | null;
}

export interface AdminSkill {
  id: string;
  categoryId: string;
  name: string;
  order: number;
}

export interface AdminSkillCategory {
  id: string;
  title: string;
  icon: string | null;
  order: number;
  skills: AdminSkill[];
  spotlight: AdminSkillSpotlight | null;
}

export interface AdminPhilosophyQuote {
  id: number;
  quote: string;
  author: string | null;
}

export interface AdminTickerSkill {
  id: string;
  label: string;
  order: number;
}

export interface SkillsPayload {
  categories: AdminSkillCategory[];
  philosophyQuote: AdminPhilosophyQuote | null;
  tickerSkills: AdminTickerSkill[];
}

export interface AdminExperience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  order: number;
}

export interface AdminEducation {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string | null;
  gpa: string | null;
  courses: string[];
  order: number;
}

export interface AdminFutureGoals {
  id: number;
  title: string;
  description: string | null;
  items: string[];
}

export interface ExperiencePayload {
  experiences: AdminExperience[];
  education: AdminEducation[];
  futureGoals: AdminFutureGoals | null;
}

export interface AdminCertificateStat {
  id: string;
  value: string;
  label: string;
  desc: string | null;
  order: number;
}

export interface AdminIssuingOrganization {
  id: string;
  name: string;
  order: number;
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

  contactInbox: () => apiFetch<ContactInbox>("/contact/submissions"),
  markSubmissionRead: (id: string, read = true) =>
    apiFetch<AdminContactSubmission>(`/contact/submissions/${id}/read`, {
      method: "PATCH",
      body: JSON.stringify({ read }),
    }),

  /* --------------------------- Stage 3 ------------------------------- */

  /* site config, social links, nav, section headings */

  getSiteConfig: () => apiFetch<SiteConfigPayload>("/site-config"),
  updateSiteConfig: (body: unknown) =>
    apiFetch<AdminSiteConfig>("/site-config", { method: "PATCH", body: JSON.stringify(body) }),
  updateSocialLinks: (body: unknown) =>
    apiFetch<AdminSocialLinks>("/social-links", { method: "PATCH", body: JSON.stringify(body) }),
  listNavItems: () => apiFetch<{ items: AdminNavItem[] }>("/nav-items"),
  createNavItem: (body: unknown) =>
    apiFetch<AdminNavItem>("/nav-items", { method: "POST", body: JSON.stringify(body) }),
  updateNavItem: (id: string, body: unknown) =>
    apiFetch<AdminNavItem>(`/nav-items/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteNavItem: (id: string) => apiFetch<void>(`/nav-items/${id}`, { method: "DELETE" }),
  reorderNavItems: (ids: string[]) =>
    apiFetch<{ items: AdminNavItem[] }>("/nav-items/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),
  listSectionMeta: () => apiFetch<{ items: AdminSectionMeta[] }>("/section-meta"),
  updateSectionMeta: (key: string, body: unknown) =>
    apiFetch<AdminSectionMeta>(`/section-meta/${key}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  /* hero stats */

  listStats: () => apiFetch<{ items: AdminStat[] }>("/stats"),
  createStat: (body: unknown) =>
    apiFetch<AdminStat>("/stats", { method: "POST", body: JSON.stringify(body) }),
  updateStat: (id: string, body: unknown) =>
    apiFetch<AdminStat>(`/stats/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteStat: (id: string) => apiFetch<void>(`/stats/${id}`, { method: "DELETE" }),
  reorderStats: (ids: string[]) =>
    apiFetch<{ items: AdminStat[] }>("/stats/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),

  /* about + quick facts */

  getAbout: () => apiFetch<AdminAboutContent>("/about"),
  updateAbout: (body: unknown) =>
    apiFetch<AdminAboutContent>("/about", { method: "PATCH", body: JSON.stringify(body) }),
  createQuickFact: (body: unknown) =>
    apiFetch<AdminQuickFact>("/about/quick-facts", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateQuickFact: (id: string, body: unknown) =>
    apiFetch<AdminQuickFact>(`/about/quick-facts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteQuickFact: (id: string) => apiFetch<void>(`/about/quick-facts/${id}`, { method: "DELETE" }),
  reorderQuickFacts: (ids: string[]) =>
    apiFetch<AdminAboutContent>("/about/quick-facts/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),

  /* skills */

  getSkills: () => apiFetch<SkillsPayload>("/skills"),
  createSkillCategory: (body: unknown) =>
    apiFetch<AdminSkillCategory>("/skill-categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateSkillCategory: (id: string, body: unknown) =>
    apiFetch<AdminSkillCategory>(`/skill-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteSkillCategory: (id: string) =>
    apiFetch<void>(`/skill-categories/${id}`, { method: "DELETE" }),
  reorderSkillCategories: (ids: string[]) =>
    apiFetch<SkillsPayload>("/skill-categories/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),
  createSkill: (categoryId: string, body: unknown) =>
    apiFetch<AdminSkill>(`/skill-categories/${categoryId}/skills`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateSkill: (categoryId: string, id: string, body: unknown) =>
    apiFetch<AdminSkill>(`/skill-categories/${categoryId}/skills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteSkill: (categoryId: string, id: string) =>
    apiFetch<void>(`/skill-categories/${categoryId}/skills/${id}`, { method: "DELETE" }),
  reorderSkills: (categoryId: string, ids: string[]) =>
    apiFetch<AdminSkill[]>(`/skill-categories/${categoryId}/skills/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),
  updateSpotlight: (categoryId: string, body: unknown) =>
    apiFetch<AdminSkillSpotlight>(`/skill-categories/${categoryId}/spotlight`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  updatePhilosophyQuote: (body: unknown) =>
    apiFetch<AdminPhilosophyQuote>("/philosophy-quote", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  createTickerSkill: (body: unknown) =>
    apiFetch<AdminTickerSkill>("/ticker-skills", { method: "POST", body: JSON.stringify(body) }),
  updateTickerSkill: (id: string, body: unknown) =>
    apiFetch<AdminTickerSkill>(`/ticker-skills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteTickerSkill: (id: string) => apiFetch<void>(`/ticker-skills/${id}`, { method: "DELETE" }),
  reorderTickerSkills: (ids: string[]) =>
    apiFetch<{ items: AdminTickerSkill[] }>("/ticker-skills/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),

  /* experience, education, future goals */

  getExperience: () => apiFetch<ExperiencePayload>("/experience"),
  createExperience: (body: unknown) =>
    apiFetch<AdminExperience>("/experiences", { method: "POST", body: JSON.stringify(body) }),
  updateExperience: (id: string, body: unknown) =>
    apiFetch<AdminExperience>(`/experiences/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteExperience: (id: string) => apiFetch<void>(`/experiences/${id}`, { method: "DELETE" }),
  reorderExperiences: (ids: string[]) =>
    apiFetch<ExperiencePayload>("/experiences/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),
  createEducation: (body: unknown) =>
    apiFetch<AdminEducation>("/education", { method: "POST", body: JSON.stringify(body) }),
  updateEducation: (id: string, body: unknown) =>
    apiFetch<AdminEducation>(`/education/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteEducation: (id: string) => apiFetch<void>(`/education/${id}`, { method: "DELETE" }),
  reorderEducation: (ids: string[]) =>
    apiFetch<ExperiencePayload>("/education/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),
  updateFutureGoals: (body: unknown) =>
    apiFetch<AdminFutureGoals>("/future-goals", { method: "PATCH", body: JSON.stringify(body) }),

  /* certificate stats + issuing organizations */

  listCertificateStats: () => apiFetch<{ items: AdminCertificateStat[] }>("/certificates/stats"),
  createCertificateStat: (body: unknown) =>
    apiFetch<AdminCertificateStat>("/certificates/stats", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateCertificateStat: (id: string, body: unknown) =>
    apiFetch<AdminCertificateStat>(`/certificates/stats/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteCertificateStat: (id: string) =>
    apiFetch<void>(`/certificates/stats/${id}`, { method: "DELETE" }),
  reorderCertificateStats: (ids: string[]) =>
    apiFetch<{ items: AdminCertificateStat[] }>("/certificates/stats/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),
  listIssuingOrganizations: () =>
    apiFetch<{ items: AdminIssuingOrganization[] }>("/certificates/issuing-organizations"),
  createIssuingOrganization: (body: unknown) =>
    apiFetch<AdminIssuingOrganization>("/certificates/issuing-organizations", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateIssuingOrganization: (id: string, body: unknown) =>
    apiFetch<AdminIssuingOrganization>(`/certificates/issuing-organizations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteIssuingOrganization: (id: string) =>
    apiFetch<void>(`/certificates/issuing-organizations/${id}`, { method: "DELETE" }),
  reorderIssuingOrganizations: (ids: string[]) =>
    apiFetch<{ items: AdminIssuingOrganization[] }>("/certificates/issuing-organizations/reorder", {
      method: "PATCH",
      body: JSON.stringify({ ids, startOrder: 0 }),
    }),
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