import { Code2, Target, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Hero data — values and content specific to the Hero section.
 * These are the spec-measured values from Section 1.6 / 1.7 / 1.8.
 * Kept separate from src/lib/data.ts to avoid touching the global data file.
 */

export type Stat = {
  Icon: LucideIcon;
  value: string;
  label: string;
};

export const stats: Stat[] = [
  { Icon: Code2, value: "5+", label: "Years Experience" },
  { Icon: Target, value: "30+", label: "Projects Delivered" },
  { Icon: Users, value: "15K+", label: "Users Impacted" },
  { Icon: Zap, value: "99%", label: "Performance Focus" },
];

export type SocialLink = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

import { Github, Linkedin, Mail, Twitter } from "lucide-react";

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/Elagbbas", Icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ahmed-elgabbas-33a186344", Icon: Linkedin },
  { label: "Email", href: "mailto:ahmedelgabbas769@gmail.com", Icon: Mail },
  { label: "Twitter", href: "https://x.com/A7med_ElGabbas", Icon: Twitter },
];

/**
 * Code snippet shown in the floating glass card.
 * Hand-tokenized so we can color individual spans instead of relying on a
 * syntax-highlight library. Keep it short (≈ 4 lines visible).
 */
export const codeCardHeader = "JAVASCRIPT";

export type CodeToken = {
  text: string;
  /** one of: keyword | key | string | punct | default */
  kind?: "keyword" | "key" | "string" | "punct" | "default";
};

export const codeCardLines: CodeToken[][] = [
  // line 1
  [{ text: "const ", kind: "keyword" }, { text: "developer", kind: "default" }, { text: " = ", kind: "punct" }, { text: "{", kind: "punct" }],
  // line 2
  [{ text: "  ", kind: "default" }, { text: "name", kind: "key" }, { text: ": ", kind: "punct" }, { text: '"Ahmed"', kind: "string" }, { text: ",", kind: "punct" }],
  // line 3
  [{ text: "  ", kind: "default" }, { text: "stack", kind: "key" }, { text: ": [", kind: "punct" }, { text: '"Next"', kind: "string" }, { text: ", ", kind: "punct" }, { text: '"Flutter"', kind: "string" }, { text: "],", kind: "punct" }],
  // line 4
  [{ text: "  ", kind: "default" }, { text: "focus", kind: "key" }, { text: ": ", kind: "punct" }, { text: '"Mobile & Full-Stack"', kind: "string" }],
  // line 5
  [{ text: "};", kind: "punct" }],
];

/**
 * Headline lines (Section 4 of the spec) — authored per-line for the tight
 * line-break control the design needs.
 */
export const headlineLines = [
  "Full-",
  "Stack",
  "Developer",
] as const;

export const headlineSubLines = ["Mobile", "Engineer"] as const;

/** Spine label letters — split so we can stagger-animate them. */
export const spineLetters = ["A", "H", "M", "E", "D"];
