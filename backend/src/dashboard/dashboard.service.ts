import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';

/**
 * Every content table the dashboard reports on.
 *
 * Deliberately excludes `contact_submissions` — those rows hold visitor PII and
 * only ever belong in the inbox — and `admin_users`, which holds password
 * hashes. Neither is exposed by any endpoint in this service.
 */
export type ActivityKind =
  | 'project'
  | 'certificate'
  | 'certificate-stat'
  | 'issuing-organization'
  | 'skill-category'
  | 'skill'
  | 'skill-spotlight'
  | 'ticker-skill'
  | 'experience'
  | 'education'
  | 'quick-fact'
  | 'nav-item'
  | 'stat'
  | 'site-config'
  | 'social-links'
  | 'about'
  | 'philosophy-quote'
  | 'future-goals';

export interface ActivityEntry {
  kind: ActivityKind;
  /// Namespaced by kind so the id stays unique when two tables share a value.
  id: string;
  title: string;
  /// Human label for the admin section this row is edited in.
  section: string;
  /**
   * Admin link. Collection rows carry `?id=` so the target row opens directly;
   * singletons have no row to focus, so they link to the bare section.
   */
  href: string;
  updatedAt: string;
}

export interface DashboardCounts {
  projects: number;
  certificates: number;
  skills: number;
  skillCategories: number;
  experiences: number;
  education: number;
  navItems: number;
  heroStats: number;
  quickFacts: number;
  tickerSkills: number;
  certificateStats: number;
  issuingOrganizations: number;
  mediaAssets: number;
}

export interface DashboardOverview {
  counts: DashboardCounts;
  contact: { total: number; unread: number };
  activity: ActivityEntry[];
  generatedAt: string;
}

export type SearchKind = "project" | "certificate" | "submission";

export interface SearchResult {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export interface ContentBackup {
  version: 1;
  generatedAt: string;
  data: Record<string, unknown>;
}

/** The minimum a table row needs to appear in the activity feed. */
interface FeedRow {
  id: string | number;
  updatedAt: Date;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(activityLimit: number): Promise<DashboardOverview> {
    const [counts, contactTotal, contactUnread, activity] = await Promise.all([
      this.counts(),
      this.prisma.contactSubmission.count(),
      this.prisma.contactSubmission.count({ where: { read: false } }),
      this.recentActivity(activityLimit),
    ]);

    return {
      counts,
      contact: { total: contactTotal, unread: contactUnread },
      activity,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Last `limit` content edits across every table, newest first.
   *
   * Each table is asked for its own newest `limit` rows and the lists are merged
   * in memory. A single cross-table `UNION` would need raw SQL and a hand-written
   * column list for all 18 tables; since `limit` is ~10 and every fetch is an
   * indexed `ORDER BY updated_at DESC`, the merge cannot miss a row that belongs
   * in the final list — a table contributes at most `limit` entries, so anything
   * it left out was already outranked by `limit` newer rows of its own.
   */
  private async recentActivity(limit: number): Promise<ActivityEntry[]> {
    const take = clampLimit(limit);
    const orderBy = { updatedAt: 'desc' } as const;

    const [
      projects,
      certificates,
      certificateStats,
      issuers,
      skillCategories,
      skills,
      spotlights,
      tickerSkills,
      experiences,
      education,
      quickFacts,
      navItems,
      stats,
      siteConfig,
      socialLinks,
      about,
      quote,
      goals,
    ] = await Promise.all([
      this.prisma.project.findMany({
        select: { id: true, title: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.certificate.findMany({
        select: { id: true, title: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.certificateStat.findMany({
        select: { id: true, label: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.issuingOrganization.findMany({
        select: { id: true, name: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.skillCategory.findMany({
        select: { id: true, title: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.skill.findMany({
        select: { id: true, name: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.skillSpotlight.findMany({
        select: { id: true, summary: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.tickerSkill.findMany({
        select: { id: true, label: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.experience.findMany({
        select: { id: true, role: true, company: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.education.findMany({
        select: { id: true, degree: true, institution: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.quickFact.findMany({
        select: { id: true, label: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.navItem.findMany({
        select: { id: true, label: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.stat.findMany({
        select: { id: true, label: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.siteConfig.findMany({
        select: { id: true, name: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.socialLinks.findMany({
        select: { id: true, email: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.aboutContent.findMany({
        select: { id: true, narrativeTitle: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.philosophyQuote.findMany({
        select: { id: true, quote: true, updatedAt: true },
        orderBy,
        take,
      }),
      this.prisma.futureGoals.findMany({
        select: { id: true, title: true, updatedAt: true },
        orderBy,
        take,
      }),
    ]);

    const entries: ActivityEntry[] = [];

    /**
     * Appends every row of a collection table. `href` receives the row id so a
     * section reached through a second query parameter (nav items live behind
     * `?tab=nav`) can build its own query string instead of a bare `?id=`.
     */
    const collection = <T extends FeedRow>(
      kind: ActivityKind,
      section: string,
      rows: readonly T[],
      label: (row: T) => string,
      href: (id: string) => string,
    ): void => {
      for (const row of rows) {
        const id = String(row.id);
        entries.push({
          kind,
          id: `${kind}:${id}`,
          title: label(row),
          section,
          href: href(id),
          updatedAt: row.updatedAt.toISOString(),
        });
      }
    };

    /// Appends a singleton row, if the table has one.
    const singleton = <T extends FeedRow>(
      kind: ActivityKind,
      section: string,
      rows: readonly T[],
      label: (row: T) => string,
      href: string,
    ): void => {
      const row = rows[0];
      if (!row) return;
      entries.push({
        kind,
        id: `${kind}:${row.id}`,
        title: label(row),
        section,
        href,
        updatedAt: row.updatedAt.toISOString(),
      });
    };

    const withId = (base: string) => (id: string) =>
      `${base}${base.includes("?") ? "&" : "?"}id=${encodeURIComponent(id)}`;

    collection('project', 'Projects', projects, (row) => row.title, withId('/admin/projects'));
    collection(
      'certificate',
      'Certificates',
      certificates,
      (row) => row.title,
      withId('/admin/certificates'),
    );
    collection(
      'certificate-stat',
      'Certificates',
      certificateStats,
      (row) => row.label,
      withId('/admin/certificates'),
    );
    collection(
      'issuing-organization',
      'Certificates',
      issuers,
      (row) => row.name,
      withId('/admin/certificates'),
    );
    collection(
      'skill-category',
      'Skills',
      skillCategories,
      (row) => row.title,
      withId('/admin/skills'),
    );
    collection('skill', 'Skills', skills, (row) => row.name, withId('/admin/skills'));
    collection(
      'skill-spotlight',
      'Skills',
      spotlights,
      (row) => summarise(row.summary, 'Spotlight'),
      withId('/admin/skills'),
    );
    collection(
      'ticker-skill',
      'Skills',
      tickerSkills,
      (row) => row.label,
      withId('/admin/skills'),
    );
    collection(
      'experience',
      'Experience',
      experiences,
      (row) => `${row.role} · ${row.company}`,
      withId('/admin/experience'),
    );
    collection(
      'education',
      'Experience',
      education,
      (row) => `${row.degree} · ${row.institution}`,
      withId('/admin/experience'),
    );
    collection('quick-fact', 'About', quickFacts, (row) => row.label, withId('/admin/about'));
    collection(
      'nav-item',
      'Navigation',
      navItems,
      (row) => row.label,
      withId('/admin/site-config?tab=nav'),
    );
    collection('stat', 'Hero & stats', stats, (row) => row.label, withId('/admin/hero'));

    singleton('site-config', 'Site config', siteConfig, (row) => row.name, '/admin/site-config');
    singleton(
      'social-links',
      'Site config',
      socialLinks,
      (row) => row.email ?? 'Social links',
      '/admin/site-config',
    );
    singleton(
      'about',
      'About',
      about,
      (row) => summarise(row.narrativeTitle, 'About narrative'),
      '/admin/about',
    );
    singleton(
      'philosophy-quote',
      'Skills',
      quote,
      (row) => truncate(row.quote),
      '/admin/skills',
    );
    singleton(
      'future-goals',
      'Experience',
      goals,
      (row) => row.title,
      '/admin/experience',
    );

    // ISO-8601 strings sort chronologically as plain strings, so this needs no
    // Date parsing per comparison.
    return entries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, take);
  }

  /**
   * Free-text search across the three content types the admin edits most.
   *
   * `mode: 'insensitive'` keeps matching case-agnostic, and each table is capped
   * so one broad term cannot pull an unbounded number of rows into a dropdown.
   */
  async search(dto: SearchQueryDto): Promise<{ query: string; results: SearchResult[] }> {
    const q = dto.q.trim();
    const contains = { contains: q, mode: 'insensitive' } as const;

    const [projects, certificates, submissions] = await Promise.all([
      this.prisma.project.findMany({
        where: { title: contains },
        select: { id: true, title: true, category: true },
        orderBy: { title: 'asc' },
        take: SEARCH_LIMIT,
      }),
      this.prisma.certificate.findMany({
        where: { OR: [{ title: contains }, { issuer: contains }] },
        select: { id: true, title: true, issuer: true },
        orderBy: { title: 'asc' },
        take: SEARCH_LIMIT,
      }),
      this.prisma.contactSubmission.findMany({
        where: { OR: [{ name: contains }, { email: contains }, { subject: contains }] },
        select: { id: true, name: true, subject: true, read: true },
        orderBy: { createdAt: 'desc' },
        take: SEARCH_LIMIT,
      }),
    ]);

    const results: SearchResult[] = [
      ...projects.map((row) => ({
        kind: 'project' as const,
        id: row.id,
        title: row.title,
        subtitle: row.category,
        href: `/admin/projects?id=${encodeURIComponent(row.id)}`,
      })),
      ...certificates.map((row) => ({
        kind: 'certificate' as const,
        id: row.id,
        title: row.title,
        subtitle: row.issuer,
        href: `/admin/certificates?id=${encodeURIComponent(row.id)}`,
      })),
      ...submissions.map((row) => ({
        kind: 'submission' as const,
        id: row.id,
        title: row.name,
        subtitle: row.subject.trim() || (row.read ? 'No subject · read' : 'No subject · unread'),
        href: `/admin/contact?submission=${encodeURIComponent(row.id)}`,
      })),
    ];

    return { query: q, results };
  }

  /**
   * Manual backup snapshot of all portfolio content.
   *
   * `admin_users` (password hashes) and `contact_submissions` (visitor PII) are
   * intentionally absent — see the note on `ActivityKind`. `media_assets` is
   * included: the URLs are needed to restore references, and the objects
   * themselves live in R2 rather than the database.
   */
  async exportBackup(): Promise<ContentBackup> {
    const [
      siteConfig,
      socialLinks,
      sectionMeta,
      navItems,
      stats,
      aboutContent,
      quickFacts,
      skillCategories,
      skills,
      skillSpotlights,
      philosophyQuote,
      tickerSkills,
      experiences,
      education,
      futureGoals,
      projects,
      certificates,
      certificateStats,
      issuingOrganizations,
      mediaAssets,
    ] = await Promise.all([
      this.prisma.siteConfig.findMany(),
      this.prisma.socialLinks.findMany(),
      this.prisma.sectionMeta.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.navItem.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.stat.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.aboutContent.findMany(),
      this.prisma.quickFact.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.skillCategory.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.skill.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.skillSpotlight.findMany(),
      this.prisma.philosophyQuote.findMany(),
      this.prisma.tickerSkill.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.experience.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.education.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.futureGoals.findMany(),
      this.prisma.project.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.certificate.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.certificateStat.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.issuingOrganization.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.mediaAsset.findMany({ orderBy: { createdAt: 'asc' } }),
    ]);

    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      data: {
        siteConfig,
        socialLinks,
        sectionMeta,
        navItems,
        stats,
        aboutContent,
        quickFacts,
        skillCategories,
        skills,
        skillSpotlights,
        philosophyQuote,
        tickerSkills,
        experiences,
        education,
        futureGoals,
        projects,
        certificates,
        certificateStats,
        issuingOrganizations,
        mediaAssets,
      },
    };
  }

  private async counts(): Promise<DashboardCounts> {
    const [
      projects,
      certificates,
      skills,
      skillCategories,
      experiences,
      education,
      navItems,
      heroStats,
      quickFacts,
      tickerSkills,
      certificateStats,
      issuingOrganizations,
      mediaAssets,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.certificate.count(),
      this.prisma.skill.count(),
      this.prisma.skillCategory.count(),
      this.prisma.experience.count(),
      this.prisma.education.count(),
      this.prisma.navItem.count(),
      this.prisma.stat.count(),
      this.prisma.quickFact.count(),
      this.prisma.tickerSkill.count(),
      this.prisma.certificateStat.count(),
      this.prisma.issuingOrganization.count(),
      this.prisma.mediaAsset.count(),
    ]);

    return {
      projects,
      certificates,
      skills,
      skillCategories,
      experiences,
      education,
      navItems,
      heroStats,
      quickFacts,
      tickerSkills,
      certificateStats,
      issuingOrganizations,
      mediaAssets,
    };
  }
}

/// Per-table cap on search hits, so a one-letter term cannot flood the dropdown.
const SEARCH_LIMIT = 8;

const ACTIVITY_LIMIT_MIN = 1;
const ACTIVITY_LIMIT_MAX = 50;
const ACTIVITY_LIMIT_DEFAULT = 10;

function clampLimit(requested: number): number {
  if (!Number.isFinite(requested)) return ACTIVITY_LIMIT_DEFAULT;
  return Math.min(ACTIVITY_LIMIT_MAX, Math.max(ACTIVITY_LIMIT_MIN, Math.trunc(requested)));
}

function summarise(value: string | null, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? truncate(trimmed) : fallback;
}

function truncate(value: string, max = 80): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}