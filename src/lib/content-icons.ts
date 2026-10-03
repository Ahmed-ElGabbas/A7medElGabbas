/**
 * Icon keys stored on DB rows, resolved to components here.
 *
 * These are deliberately NOT a lucide dynamic lookup: the key set is closed and
 * validated by the backend (QUICK_FACT_ICON_KEYS in about/dto/about.dto.ts,
 * SKILL_CATEGORY_ICON_KEYS in skills/dto/skills.dto.ts), so an explicit map keeps
 * the icon set auditable and bundle-safe instead of pulling lucide in whole.
 *
 * The Stage 3 bug this replaces: about.tsx used a positional array
 * (factIcons[0], factIcons[1], ...) so reordering or deleting a quick fact gave
 * the remaining rows the wrong glyph. Keying off the row's own `icon` field makes
 * reordering safe.
 */
import {
  Award,
  Briefcase,
  Code2,
  Database,
  Globe,
  GraduationCap,
  Heart,
  Layout,
  MapPin,
  Palette,
  Server,
  Smartphone,
  Sparkles,
  Terminal,
  Wrench,
  Brain,
  Cloud,
  type LucideIcon,
} from "lucide-react";

export const QUICK_FACT_ICONS: Record<string, LucideIcon> = {
  graduation: GraduationCap,
  location: MapPin,
  sparkles: Sparkles,
  terminal: Terminal,
  code: Code2,
  briefcase: Briefcase,
  award: Award,
  user: GraduationCap,
  globe: Globe,
  heart: Heart,
};

export const SKILL_CATEGORY_ICONS: Record<string, LucideIcon> = {
  code: Code2,
  layout: Layout,
  smartphone: Smartphone,
  server: Server,
  database: Database,
  wrench: Wrench,
  palette: Palette,
  cloud: Cloud,
  brain: Brain,
  terminal: Terminal,
};

/**
 * Resolves an icon key, falling back to a sensible default so a row saved before
 * this map existed (or with a cleared icon) still renders instead of crashing
 * the whole section.
 */
export function resolveQuickFactIcon(icon?: string | null): LucideIcon {
  return (icon && QUICK_FACT_ICONS[icon]) || Sparkles;
}

export function resolveSkillCategoryIcon(icon?: string | null): LucideIcon {
  return (icon && SKILL_CATEGORY_ICONS[icon]) || Code2;
}

export const QUICK_FACT_ICON_KEYS = Object.keys(QUICK_FACT_ICONS);
export const SKILL_CATEGORY_ICON_KEYS = Object.keys(SKILL_CATEGORY_ICONS);