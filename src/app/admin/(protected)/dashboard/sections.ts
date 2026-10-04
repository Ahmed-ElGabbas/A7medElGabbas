import type { LucideIcon } from "lucide-react";
import {
  Award,
  Briefcase,
  Code2,
  Compass,
  FolderGit2,
  Image,
  Inbox,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

/**
 * The admin's section registry — one entry per manager page.
 *
 * Single source of truth for the sidebar, the dashboard's quick-action tiles,
 * and the `?section=` labels used by search and activity results, so a new
 * section only has to be added here to appear everywhere.
 *
 * `countKey` is the matching field on `AdminDashboardCounts`; sections that map
 * to several tables (Skills) point at the one number worth showing.
 */
export interface AdminSection {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Field on the overview payload this section's counter comes from. */
  countKey?: AdminCountKey;
  /// Short blurb under the label in the sidebar. Skipped on narrow screens.
  hint?: string;
}

export type AdminCountKey =
  | "projects"
  | "certificates"
  | "skills"
  | "skillCategories"
  | "experiences"
  | "education"
  | "navItems"
  | "heroStats"
  | "quickFacts"
  | "tickerSkills"
  | "certificateStats"
  | "issuingOrganizations"
  | "mediaAssets";

export const ADMIN_SECTIONS: readonly AdminSection[] = [
  {
    label: "Site config",
    href: "/admin/site-config",
    icon: Settings,
    hint: "Identity, meta, links",
  },
  {
    label: "Navigation",
    href: "/admin/site-config?tab=nav",
    icon: Compass,
    countKey: "navItems",
    hint: "Header links & section headings",
  },
  {
    label: "Hero & stats",
    href: "/admin/hero",
    icon: Sparkles,
    countKey: "heroStats",
    hint: "Headline and counters",
  },
  {
    label: "About",
    href: "/admin/about",
    icon: User,
    countKey: "quickFacts",
    hint: "Narrative and quick facts",
  },
  {
    label: "Skills",
    href: "/admin/skills",
    icon: Code2,
    countKey: "skills",
    hint: "Categories, spotlights, ticker",
  },
  {
    label: "Experience",
    href: "/admin/experience",
    icon: Briefcase,
    countKey: "experiences",
    hint: "Roles, education, goals",
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderGit2,
    countKey: "projects",
    hint: "Case studies",
  },
  {
    label: "Certificates",
    href: "/admin/certificates",
    icon: Award,
    countKey: "certificates",
    hint: "Credentials and issuers",
  },
  {
    label: "Contact inbox",
    href: "/admin/contact",
    icon: Inbox,
    hint: "Visitor messages",
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: Image,
    countKey: "mediaAssets",
    hint: "Uploaded files",
  },
] as const;

/** True when `href` is the section currently being viewed, query string included. */
export function isActiveSection(href: string, pathname: string, search: string): boolean {
  const [base, query] = href.split("?");
  if (base !== pathname) return false;
  if (!query) return true;

  /// Only the Navigation entry carries a query, so an exact match on it is
  /// enough — no need to diff arbitrary parameter sets.
  return search.includes(query);
}

/** Splits "3 items" style labels without pulling in an i18n layer. */
export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}