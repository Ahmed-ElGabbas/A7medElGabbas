/**
 * Server-side content loading for the public site.
 *
 * BACKEND_PLAN.md §6 requires each section to cut over to the API one at a time
 * while keeping a static fallback, so every helper here resolves to live data
 * when the backend answers and falls back to src/data/portfolio.ts when it does
 * not. That means the site still renders during a backend deploy, an API outage,
 * or a fresh clone whose database has not been seeded yet.
 *
 * These run on the server only (imported from the Server Component page), so
 * `cache: "no-store"` gives request-time reads without shipping a client fetch.
 */
import {
  personalInfo,
  socialLinks,
  navItems,
  stats as staticStats,
  aboutData,
  skillCategories as staticSkillCategories,
  skillSpotlights as staticSkillSpotlights,
  philosophyQuote as staticPhilosophyQuote,
  tickerSkills as staticTickerSkills,
  experiences as staticExperiences,
  education as staticEducation,
  futureGoals as staticFutureGoals,
  projects as staticProjectsRaw,
  certificates as staticCertificatesRaw,
  certificateStats,
  issuingOrganizations,
  type Certificate,
} from "@/data/portfolio";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** Logged once per distinct endpoint so a persistent outage does not flood logs. */
const warned = new Set<string>;

/**
 * Next.js signals "this route must be server-rendered on demand" by throwing from
 * inside a `no-store` fetch during static generation. That is not an outage, and
 * swallowing it would both log a false warning and hide the reason the route
 * became dynamic — so it is re-thrown for Next.js to handle.
 */
function isDynamicUsageError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("DYNAMIC_SERVER_USAGE")
  );
}

async function fetchContent<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_ORIGIN}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (error) {
    if (isDynamicUsageError(error)) throw error;

    if (!warned.has(path) && process.env.NODE_ENV !== "test") {
      warned.add(path);
      console.warn(
        `[content] ${path} unavailable, using static fallback (${
          error instanceof Error ? error.message : "unknown error"
        })`,
      );
    }
    return fallback;
  }
}

/* ------------------------------ types ---------------------------------- */

export interface Stat {
  id: string;
  value: string;
  label: string;
}

export interface QuickFact {
  id: string;
  label: string;
  value: string;
  detail: string | null;
  icon: string | null;
}

export interface AboutContent {
  sectionSubtitle: string | null;
  narrativeTitle: string | null;
  paragraphs: string[];
  highlights: string[];
  academicFocusTitle: string | null;
  academicFocusDescription: string | null;
  quickFacts: QuickFact[];
}

export interface Skill {
  id: string;
  name: string;
}

export interface SkillSpotlight {
  id: string;
  summary: string | null;
  patterns: string[];
  primaryProject: string | null;
}

export interface SkillCategory {
  id: string;
  title: string;
  icon: string | null;
  skills: Skill[];
  spotlight: SkillSpotlight | null;
}

export interface PhilosophyQuote {
  id: number;
  quote: string;
  author: string | null;
}

export interface TickerSkill {
  id: string;
  label: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string | null;
  gpa: string | null;
  courses: string[];
}

export interface FutureGoals {
  id: number;
  title: string;
  description: string | null;
  items: string[];
}

export interface SectionMeta {
  id: number;
  key: string;
  index: string | null;
  label: string | null;
  title: string;
  subtitle: string | null;
}

/**
 * A project row as the API returns it. `id`/`createdAt`/`updatedAt`/`order` are
 * added by the backend; the rest mirror src/data/portfolio.ts.
 *
 * `category` stays free text (BACKEND_PLAN.md §10 amendment 3), so the filter
 * tabs are derived from the rows rather than from a hardcoded list.
 */
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  featured: boolean;
}

/**
 * A certificate row plus the `categoryLabel` the API resolves from the enum.
 * `credentialUrl`, `previewImage`, and `file` are optional on the DB row.
 */
export interface CertificateItem extends Omit<Certificate, "categoryLabel"> {
  categoryLabel: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface CertificateStat {
  id: string;
  value: string;
  label: string;
  desc: string | null;
}

export interface IssuingOrganization {
  id: string;
  name: string;
}

/**
 * A SectionHeading with every field guaranteed present.
 *
 * `index` and `label` are nullable in the DB because the admin can clear them,
 * but the heading component is typed as required. Defaults live here rather than
 * at each call site so an admin who blanks a field degrades to a plain heading
 * instead of crashing the section.
 */
export interface ResolvedSectionMeta extends SectionMeta {
  index: string;
  label: string;
}

/**
 * SiteConfig as the frontend sees it. Note `photoUrl`/`resumeUrl` on the DB row
 * map to `photo`/`resumePath` in src/data/portfolio.ts, so the DB shape is kept
 * and translated rather than silently renaming what the admin edits.
 */
export interface SiteConfig {
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

export interface SocialLinks {
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  twitter: string;
  facebook: string;
}

/* --------------------------- static fallbacks --------------------------- */

/** personalInfo translated into the DB column names the API returns. */
function toStaticSite(): SiteConfig {
  return {
    name: personalInfo.name,
    firstName: personalInfo.firstName,
    lastName: personalInfo.lastName,
    title: personalInfo.title,
    metaDescription: personalInfo.metaDescription,
    url: personalInfo.url,
    headline: personalInfo.headline,
    photoUrl: personalInfo.photo,
    resumeUrl: personalInfo.resumePath,
    location: personalInfo.location,
    status: personalInfo.status,
    statusSubtext: personalInfo.statusSubtext,
    roles: personalInfo.roles,
  };
}

const staticQuickFacts: QuickFact[] = aboutData.quickFacts.map((fact, index) => ({
  id: `static-quick-fact-${index}`,
  label: fact.label,
  value: fact.value,
  detail: fact.detail ?? null,
  // Matches the icons the old positional array produced, in the same order.
  icon: ["graduation", "location", "sparkles", "terminal"][index] ?? null,
}));

const staticAbout: AboutContent = {
  sectionSubtitle: aboutData.sectionSubtitle,
  narrativeTitle: aboutData.narrativeTitle,
  paragraphs: aboutData.paragraphs,
  highlights: aboutData.highlights,
  academicFocusTitle: aboutData.academicFocus.title,
  academicFocusDescription: aboutData.academicFocus.description,
  quickFacts: staticQuickFacts,
};

const staticSkills: SkillCategory[] = staticSkillCategories.map(
  (category, categoryIndex) => {
    const spotlight = staticSkillSpotlights[category.title];
    return {
      id: `static-category-${categoryIndex}`,
      title: category.title,
      icon: category.icon ?? null,
      skills: category.skills.map((name, skillIndex) => ({
        id: `static-skill-${categoryIndex}-${skillIndex}`,
        name,
      })),
      spotlight: spotlight
        ? {
            id: `static-spotlight-${categoryIndex}`,
            summary: spotlight.summary,
            patterns: spotlight.patterns,
            primaryProject: spotlight.primaryProject,
          }
        : null,
    };
  },
);

/**
 * Static project rows, given the synthetic ids the API would have assigned.
 * `category` is free text, so the fallback tab list is derived from these rows
 * exactly as the live one is derived from the API response.
 */
const staticProjects: Project[] = staticProjectsRaw.map((project, index) => ({
  id: `static-project-${index}`,
  ...project,
}));

const staticCertificates: CertificateItem[] = staticCertificatesRaw.map((cert) => ({
  ...cert,
  categoryLabel: cert.category,
}));

const staticCertificateStats: CertificateStat[] = certificateStats.map((stat, index) => ({
  id: `static-cert-stat-${index}`,
  ...stat,
}));

const staticIssuingOrganizations: IssuingOrganization[] = issuingOrganizations.map(
  (name, index) => ({ id: `static-issuer-${index}`, name }),
);

/** The six headings currently hardcoded in the section components. */
const STATIC_SECTION_META: ResolvedSectionMeta[] = [
  {
    id: 1,
    key: "about",
    index: "01",
    label: "PROFILE",
    title: "About Me",
    subtitle: aboutData.sectionSubtitle,
  },
  {
    id: 2,
    key: "skills",
    index: "02",
    label: "EXPERTISE",
    title: "Technical Stack",
    subtitle:
      "Tools, languages, and frameworks I leverage to engineer performant, reliable software.",
  },
  {
    id: 3,
    key: "experience",
    index: "03",
    label: "CAREER",
    title: "Experience & Education",
    subtitle:
      "Chronological track of engineering projects, specialized development tracks, and academic foundations.",
  },
  {
    id: 4,
    key: "projects",
    index: "04",
    label: "PORTFOLIO",
    title: "Featured Projects",
    subtitle:
      "A curated showcase of cross-platform mobile apps, reactive web platforms, and robust APIs.",
  },
  {
    id: 5,
    key: "certificates",
    index: "05",
    label: "CREDENTIALS",
    title: "Licenses & Certifications",
    subtitle:
      "Verified technical credentials, specialized engineering tracks, and algorithmic problem-solving qualifications.",
  },
  {
    id: 6,
    key: "contact",
    index: "06",
    label: "CONNECT",
    title: "Let's Build Together",
    subtitle:
      "Have a project in mind, an opportunity to discuss, or just want to say hello? My inbox is always open.",
  },
];

/* ------------------------------- loaders -------------------------------- */

export async function loadSite(): Promise<SiteConfig> {
  // /site-config returns { config, links }; split here so each loader hands the
  // section just the shape it expects.
  const body = await fetchContent<{ config: SiteConfig | null; links: SocialLinks | null }>(
    "/site-config",
    { config: null, links: null },
  );
  return body.config ?? toStaticSite();
}

export async function loadLinks(): Promise<SocialLinks> {
  const body = await fetchContent<{ links: SocialLinks | null }>("/site-config", {
    links: null,
  });
  return body.links ?? socialLinks;
}

export async function loadNav(): Promise<Array<{ label: string; href: string }>> {
  const body = await fetchContent<{ items?: Array<{ label: string; href: string }> }>(
    "/nav-items",
    { items: navItems },
  );
  return body.items ?? navItems;
}

export async function loadStats(): Promise<Stat[]> {
  const body = await fetchContent<{ items?: Stat[] }>("/stats", {
    items: staticStats.map((s, index) => ({ id: `static-stat-${index}`, ...s })),
  });
  return body.items ?? [];
}

export async function loadAbout(): Promise<AboutContent> {
  return fetchContent<AboutContent>("/about", staticAbout);
}

export async function loadSkills(): Promise<SkillCategory[]> {
  const body = await fetchContent<{ categories?: SkillCategory[] }>("/skills", {
    categories: staticSkills,
  });
  return body.categories ?? [];
}

export async function loadPhilosophyQuote(): Promise<PhilosophyQuote | null> {
  const body = await fetchContent<{ philosophyQuote: PhilosophyQuote | null }>("/skills", {
    philosophyQuote: { id: 1, ...staticPhilosophyQuote },
  });
  return body.philosophyQuote;
}

export async function loadTickerSkills(): Promise<TickerSkill[]> {
  const body = await fetchContent<{ tickerSkills?: TickerSkill[] }>("/skills", {
    tickerSkills: staticTickerSkills.map((label, index) => ({
      id: `static-ticker-${index}`,
      label,
    })),
  });
  return body.tickerSkills ?? [];
}

export async function loadExperience(): Promise<{
  experiences: Experience[];
  education: Education[];
  futureGoals: FutureGoals | null;
}> {
  return fetchContent("/experience", {
    experiences: staticExperiences.map((e, index) => ({ id: `static-exp-${index}`, ...e })),
    education: staticEducation.map((e, index) => ({ id: `static-edu-${index}`, ...e })),
    futureGoals: { id: 1, ...staticFutureGoals },
  });
}

export async function loadProjects(): Promise<Project[]> {
  const body = await fetchContent<{ items?: Project[] }>("/projects", {
    items: staticProjects,
  });
  return body.items ?? [];
}

/**
 * Categories come from the rows themselves rather than a literal list, so a
 * category added in the admin (project.category is free text) gets a working
 * filter tab without a code change. Sorted alphabetically with "All" first.
 */
export async function loadProjectCategories(): Promise<string[]> {
  const body = await fetchContent<{ categories?: string[] }>("/projects/categories", {
    categories: Array.from(new Set(staticProjects.map((p) => p.category))).sort(),
  });
  return body.categories ?? [];
}

export async function loadCertificates(): Promise<CertificateItem[]> {
  const body = await fetchContent<{ items?: CertificateItem[] }>("/certificates", {
    items: staticCertificates,
  });
  return body.items ?? [];
}

/** The four-metric plaque under the certificates grid. */
export async function loadCertificateStats(): Promise<CertificateStat[]> {
  const body = await fetchContent<{ items?: CertificateStat[] }>(
    "/certificates/stats",
    { items: staticCertificateStats },
  );
  return body.items ?? [];
}

/** The "Accredited Issuers" row under the plaque. */
export async function loadIssuingOrganizations(): Promise<IssuingOrganization[]> {
  const body = await fetchContent<{ items?: IssuingOrganization[] }>(
    "/certificates/issuing-organizations",
    { items: staticIssuingOrganizations },
  );
  return body.items ?? [];
}

/**
 * The certificate category is a fixed enum (BACKEND_PLAN.md §10 amendment 3),
 * so the server sends both the value and a display label and the tabs are built
 * from that instead of being hardcoded in the component.
 */
export async function loadCertificateCategories(): Promise<CategoryOption[]> {
  return fetchContent<{ categories?: CategoryOption[] }>(
    "/certificates/categories",
    {
      categories: Array.from(new Set(staticCertificates.map((c) => c.category))).map(
        (value) => ({ value, label: value }),
      ),
    },
  ).then((body) => body.categories ?? []);
}

export async function loadSectionMeta(): Promise<Record<string, ResolvedSectionMeta>> {
  const body = await fetchContent<{ items?: SectionMeta[] }>("/section-meta", {
    items: STATIC_SECTION_META,
  });

  const rows = body.items ?? [];
  const map: Record<string, ResolvedSectionMeta> = {};

  for (const meta of rows) {
    map[meta.key] = {
      ...meta,
      index: meta.index ?? "",
      label: meta.label ?? "",
    };
  }

  // Fill any heading the API did not return so a partially seeded database still
  // renders every section.
  for (const fallback of STATIC_SECTION_META) {
    if (!map[fallback.key]) map[fallback.key] = fallback;
  }

  return map;
}

export { API_ORIGIN };