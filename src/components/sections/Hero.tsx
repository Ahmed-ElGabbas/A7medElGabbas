"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import {
  ArrowUpRight,
  Code2,
  Github,
  Linkedin,
  Mail,
  Sparkles,
  Target,
  Twitter,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { siteConfig } from "@/lib/data";

/* ============================================================================
 * Hero — fully self-contained implementation.
 *
 * Everything that used to live under `hero-section/` (Background,
 * SpineLabel, LeftContent, Portrait, ScrollIndicator, plus their shared
 * data) is inlined below as local consts / components in this single file.
 * No local component imports — only external packages and the shared
 * `@/lib/data` (siteConfig), which is global site data, not a Hero
 * component.
 *
 * Composition, per the approved design's §6.2:
 *   - Two-column asymmetric split (left ≈ 55%, right ≈ 45%).
 *   - Below the fold (still within Hero): a full-width stats row.
 *   - Responsive: stacks at < lg; portrait scales down; spine label hidden
 *     < xl; stats wrap to 2×2 on small.
 *   - Layer order: background → spine → content → portrait → stats →
 *     scroll indicator.
 * ========================================================================= */

const easeOutExpo = [0.16, 1, 0.3, 1] as const;
const easeStandard = [0.4, 0, 0.2, 1] as const;

/* ----------------------------------------------------------------------- */
/* Data                                                                     */
/* ----------------------------------------------------------------------- */

type Stat = {
  Icon: LucideIcon;
  value: string;
  label: string;
};

const stats: Stat[] = [
  { Icon: Code2, value: "5+", label: "Years Experience" },
  { Icon: Target, value: "30+", label: "Projects Delivered" },
  { Icon: Users, value: "15K+", label: "Users Impacted" },
  { Icon: Zap, value: "99%", label: "Performance Focus" },
];

type SocialLink = {
  label: string;
  href: string;
  Icon: LucideIcon;
};

const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/Elagbbas", Icon: Github },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ahmed-elgabbas-33a186344",
    Icon: Linkedin,
  },
  { label: "Email", href: "mailto:ahmedelgabbas769@gmail.com", Icon: Mail },
  { label: "Twitter", href: "https://x.com/A7med_ElGabbas", Icon: Twitter },
];

/**
 * Code snippet shown in the floating glass "live terminal" card.
 * Hand-tokenized so we can color individual spans instead of relying on a
 * syntax-highlight library. Keep it short (≈ 4 lines visible).
 */
const codeCardHeader = "JAVASCRIPT";

type CodeToken = {
  text: string;
  /** one of: keyword | key | string | punct | default */
  kind?: "keyword" | "key" | "string" | "punct" | "default";
};

const codeCardLines: CodeToken[][] = [
  // line 1
  [
    { text: "const ", kind: "keyword" },
    { text: "developer", kind: "default" },
    { text: " = ", kind: "punct" },
    { text: "{", kind: "punct" },
  ],
  // line 2
  [
    { text: "  ", kind: "default" },
    { text: "name", kind: "key" },
    { text: ": ", kind: "punct" },
    { text: '"Ahmed"', kind: "string" },
    { text: ",", kind: "punct" },
  ],
  // line 3
  [
    { text: "  ", kind: "default" },
    { text: "stack", kind: "key" },
    { text: ": [", kind: "punct" },
    { text: '"Next"', kind: "string" },
    { text: ", ", kind: "punct" },
    { text: '"Flutter"', kind: "string" },
    { text: "],", kind: "punct" },
  ],
  // line 4
  [
    { text: "  ", kind: "default" },
    { text: "focus", kind: "key" },
    { text: ": ", kind: "punct" },
    { text: '"Mobile & Full-Stack"', kind: "string" },
  ],
  // line 5
  [{ text: "};", kind: "punct" }],
];

/**
 * Role rotator — cycles under the name per the approved design's animated
 * role line (typewriter-style). Sourced from the real siteConfig title /
 * experience data, not invented copy.
 */
const roles = [
  "Full-Stack Developer",
  "Mobile Engineer",
  "Software Engineer",
  "Problem Solver",
] as const;

/**
 * Achievement badges — compact inline row beneath the CTAs/socials, per the
 * approved design. Drawn from real recognitions/stats already in the repo.
 */
const achievementBadges = [
  { emoji: "🏆", label: "ICPC Community" },
  { emoji: "💻", label: "500+ Solved" },
  { emoji: "👥", label: "Student Union" },
  { emoji: "🎓", label: "HNU · FCAI" },
] as const;

/**
 * Tech orbit chips — small ring of core technologies around the portrait
 * frame, per the approved design's "tech orbit" component. Pulled from the
 * real skill categories rather than invented.
 */
const orbitChips = ["React", "Next.js", "Flutter", "Node.js"] as const;

/** Spine label letters — split so we can stagger-animate them. */
const spineLetters = ["A", "H", "M", "E", "D"];

/* ----------------------------------------------------------------------- */
/* Background — base fill, grid overlay, gold ambient glow                 */
/* ----------------------------------------------------------------------- */

function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1 — base fill */}
      <div className="absolute inset-0 bg-(--color-background)" />

      {/* Layer 2 — shared grid overlay, low opacity */}
      <div className="grid-overlay" style={{ position: "absolute" }} />

      {/* Layer 3 — ambient gold glow, centered behind the portrait column */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 700px 700px at 78% 45%, rgba(212, 175, 55, 0.07) 0%, rgba(212, 175, 55, 0.02) 55%, transparent 100%)",
        }}
      />

      {/* Subtle secondary glow lower-left, balancing composition */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 500px 400px at 12% 85%, rgba(212, 175, 55, 0.04) 0%, transparent 65%)",
        }}
      />

      {/* Layer 4 — frame edge-glow. Tighter, brighter gold blob hugging the
          portrait frame, mimicking a light source behind-right. */}
      <div
        className="absolute"
        style={{
          right: "8%",
          top: "14%",
          width: "520px",
          height: "660px",
          background:
            "radial-gradient(ellipse at center, rgba(212, 175, 55, 0.14) 0%, rgba(212, 175, 55, 0.05) 40%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* SpineLabel — vertical "AHMED" glyph stack in the outer margin            */
/* ----------------------------------------------------------------------- */

function SpineLabel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: easeOutExpo }}
      className="hidden xl:flex absolute left-5 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-1 select-none"
      aria-hidden
    >
      {spineLetters.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: 0.7 + i * 0.04,
            ease: easeOutExpo,
          }}
          className="font-mono text-[10px] font-medium tracking-[0.18em] uppercase text-(--color-muted-foreground) leading-[1.4]"
        >
          {letter}
        </motion.span>
      ))}
      <div className="w-px h-3 bg-(--color-border-hover) my-1" />
      <div className="w-1.5 h-1.5 rounded-full bg-(--color-accent) shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
    </motion.div>
  );
}

/* ----------------------------------------------------------------------- */
/* ScrollIndicator — bottom-center mouse icon + label                      */
/* ----------------------------------------------------------------------- */

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2, ease: easeOutExpo }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
    >
      {/* Mouse-outline icon */}
      <div className="relative w-[18px] h-[28px] rounded-[10px] border border-(--color-border-hover) flex items-start justify-center pt-1.5">
        {/* Animated internal dot */}
        <span className="block w-[3px] h-[6px] rounded-full bg-(--color-accent) animate-scroll-dot" />
      </div>
      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-(--color-muted-foreground)">
        Scroll Down
      </span>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------- */
/* LeftContent — badge, greeting, name, role rotator, CTAs, socials, badges */
/* ----------------------------------------------------------------------- */

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

function makeDelayedItem(delay: number): Variants {
  return {
    hidden: { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOutExpo, delay },
    },
  };
}

/** Time-aware greeting. Renders a neutral default on the server/first paint,
 * then swaps to the time-of-day variant on mount — avoids hydration
 * mismatches (same pattern used for Header's theme toggle). */
function useGreeting() {
  const [greeting, setGreeting] = useState("Hello, I'm");

  useEffect(() => {
    queueMicrotask(() => {
      const hour = new Date().getHours();
      if (hour < 5) setGreeting("Still up, I'm");
      else if (hour < 12) setGreeting("Good Morning, I'm ☀️");
      else if (hour < 18) setGreeting("Good Afternoon, I'm");
      else setGreeting("Good Evening, I'm 🌙");
    });
  }, []);

  return greeting;
}

/** Role rotator — cross-fades through `roles` every 2.5s. */
function RoleRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % roles.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-[22px] md:h-[26px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[index]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: easeOutExpo }}
          className="block font-mono text-[15px] md:text-[17px] font-medium text-(--color-accent-soft)"
        >
          {roles[index]}
          <span className="inline-block w-[2px] h-[15px] md:h-[17px] ml-1 -mb-0.5 bg-(--color-accent-soft) animate-pulse" />
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function LeftContent() {
  const greeting = useGreeting();

  return (
    <div className="flex flex-col gap-6 md:gap-7">
      {/* === Availability badge === */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0 }}
        className="flex"
      >
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) backdrop-blur-sm">
          <span className="relative flex items-center justify-center w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-(--color-accent) animate-badge-pulse" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-(--color-accent)" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase font-semibold text-white">
            Available for Work
          </span>
          <span className="text-(--color-muted-foreground)">·</span>
          <span className="font-mono text-[10px] tracking-[0.05em] text-(--color-muted-foreground)">
            Open to new opportunities
          </span>
        </div>
      </motion.div>

      {/* === Greeting === */}
      <motion.div variants={makeDelayedItem(0.08)} initial="hidden" animate="show">
        <span className="font-display text-[18px] md:text-[20px] font-semibold text-(--color-muted)">
          {greeting}
        </span>
      </motion.div>

      {/* === Name === */}
      <motion.h1
        variants={makeDelayedItem(0.16)}
        initial="hidden"
        animate="show"
        className="font-display font-bold tracking-[-0.02em] leading-[1.05] text-[40px] sm:text-[52px] md:text-[58px] lg:text-[62px]"
      >
        Ahmed{" "}
        <span className="text-(--color-accent)">
          {siteConfig.name.split(" ")[1]}
        </span>
      </motion.h1>

      {/* === Role rotator === */}
      <motion.div variants={makeDelayedItem(0.26)} initial="hidden" animate="show">
        <RoleRotator />
      </motion.div>

      {/* === Supporting paragraph === */}
      <motion.p
        variants={makeDelayedItem(0.35)}
        initial="hidden"
        animate="show"
        className="text-(--color-muted) text-[14px] md:text-[15px] leading-[1.6] max-w-[490px]"
      >
        Engineering production-scale systems — from cross-platform mobile apps
        to full-stack web platforms. Every line crafted with precision,
        intent, and an obsession with the details users actually feel.
      </motion.p>

      {/* === CTA group === */}
      <motion.div
        variants={makeDelayedItem(0.46)}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-center gap-3 pt-1"
      >
        {/* Primary button — gold outline, never a solid gold fill */}
        <motion.a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document
              .querySelector("#contact")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: easeStandard }}
          className="group inline-flex items-center gap-2 px-5 py-3 rounded-full border border-(--color-accent) text-(--color-accent) font-sans text-[13px] font-semibold hover:bg-[rgba(212,175,55,0.08)] hover:text-(--color-accent-hover) hover:border-(--color-accent-hover) transition-colors duration-200"
        >
          <span>Hire Me</span>
          <ArrowUpRight
            size={15}
            strokeWidth={2.5}
            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          />
        </motion.a>

        {/* Secondary button — glass */}
        <motion.a
          href="#projects"
          onClick={(e) => {
            e.preventDefault();
            document
              .querySelector("#projects")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: easeStandard }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-(--color-border) bg-(--color-glass-fill) text-white font-sans text-[13px] font-semibold hover:border-(--color-border-hover) transition-colors duration-200"
        >
          <span>View Work</span>
          <ArrowUpRight size={15} strokeWidth={2.2} />
        </motion.a>
      </motion.div>

      {/* === Social row === */}
      <motion.div
        variants={makeDelayedItem(0.54)}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-center gap-5 md:gap-6"
      >
        {socialLinks.map(({ label, href, Icon }) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="group inline-flex items-center gap-2 text-(--color-muted-foreground) hover:text-(--color-accent) transition-colors duration-200"
            aria-label={label}
          >
            <Icon
              size={14}
              strokeWidth={1.6}
              className="group-hover:scale-110 transition-transform"
            />
            <span className="font-mono text-[11px] tracking-[0.08em] uppercase hidden sm:inline">
              {label}
            </span>
          </motion.a>
        ))}
      </motion.div>

      {/* === Achievement badges === */}
      <motion.div
        variants={makeDelayedItem(0.6)}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-2"
      >
        {achievementBadges.map(({ emoji, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[11px] text-(--color-muted) backdrop-blur-sm"
          >
            <span aria-hidden>{emoji}</span>
            {label}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Portrait — identity frame, tech orbit, live terminal, device showcase    */
/* ----------------------------------------------------------------------- */

function CodeLine({
  tokens,
  lineIndex,
}: {
  tokens: CodeToken[];
  lineIndex: number;
}) {
  const colorFor = (kind: CodeToken["kind"]) => {
    switch (kind) {
      case "keyword":
        return "text-[#7da9d8]";
      case "key":
        return "text-[#d19a6a]";
      case "string":
        return "text-[#8fd19e]";
      case "punct":
        return "text-[#c7c8ca]";
      default:
        return "text-[#dcddde]";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.85 + lineIndex * 0.08,
        ease: easeOutExpo,
      }}
      className="font-mono text-[11px] md:text-[12px] leading-[1.7] whitespace-pre"
    >
      {tokens.map((tok, i) => (
        <span key={i} className={colorFor(tok.kind)}>
          {tok.text}
        </span>
      ))}
    </motion.div>
  );
}

function LiveTerminalCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.75, ease: easeOutExpo }}
      className="absolute -bottom-6 -left-6 lg:-left-10 z-20 w-[300px] md:w-[330px] lg:w-[350px] rounded-[14px] border border-(--color-border-hover) shadow-(--shadow-2) overflow-hidden"
      style={{
        background: "rgba(20, 22, 24, 0.88)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <span className="block w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
          <span className="block w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
          <span className="block w-[10px] h-[10px] rounded-full bg-[#28c840]" />
        </div>
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-(--color-muted-foreground)">
          {codeCardHeader}
        </span>
      </div>
      {/* Code block */}
      <div className="px-5 py-4 flex flex-col gap-0">
        {codeCardLines.map((tokens, i) => (
          <CodeLine key={i} tokens={tokens} lineIndex={i} />
        ))}
      </div>
    </motion.div>
  );
}

function DecorativeSparkle() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay: 1.0, ease: easeOutExpo }}
      className="absolute -bottom-3 -right-3 lg:-right-5 z-30 text-(--color-accent-soft)"
      style={{ filter: "drop-shadow(0 0 10px rgba(212, 175, 55, 0.4))" }}
      aria-hidden
    >
      <Sparkles size={20} strokeWidth={1.5} />
    </motion.div>
  );
}

/** Tech orbit — a slow-rotating dashed ring with a few real-stack chips. */
function TechOrbit() {
  const positions = [
    { top: "-4%", left: "50%", translate: "-translate-x-1/2" },
    { top: "50%", left: "104%", translate: "-translate-y-1/2" },
    { top: "104%", left: "50%", translate: "-translate-x-1/2" },
    { top: "50%", left: "-4%", translate: "-translate-y-1/2" },
  ];

  return (
    <div
      className="hidden lg:block absolute pointer-events-none"
      style={{ inset: "-56px" }}
      aria-hidden
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-(--color-border)"
      />
      {orbitChips.map((chip, i) => (
        <motion.span
          key={chip}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.9 + i * 0.06,
            ease: easeOutExpo,
          }}
          className={`absolute ${positions[i].translate} px-2.5 py-1 rounded-full bg-(--color-surface) border border-(--color-border) font-mono text-[10px] text-(--color-muted)`}
          style={{ top: positions[i].top, left: positions[i].left }}
        >
          {chip}
        </motion.span>
      ))}
    </div>
  );
}

/** Compact device-showcase phone mockup — placeholder UI bars, no real
 * project screenshots shipped yet, so this stays honest rather than faking
 * a screen. Idles with a slow wobble. */
function DeviceShowcase() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 4 }}
      animate={{ opacity: 1, y: 0, rotate: 3 }}
      transition={{ duration: 0.6, delay: 0.95, ease: easeOutExpo }}
      className="hidden md:block absolute -top-8 -right-6 lg:-right-10 z-20 w-[92px] h-[186px] rounded-[20px] border-4 border-(--color-surface) bg-(--color-bg-elevated) shadow-(--shadow-2) animate-float-soft"
      style={{ transform: "rotate(3deg)" }}
    >
      <div className="absolute inset-[6px] rounded-[14px] bg-(--color-surface) flex flex-col gap-1.5 p-2.5">
        <div className="h-1.5 rounded-full bg-(--color-accent)/60 w-3/5" />
        <div className="h-1.5 rounded-full bg-white/10 w-2/5" />
        <div className="h-1.5 rounded-full bg-white/10 w-4/5" />
        <div className="h-1.5 rounded-full bg-(--color-accent)/60 w-3/5 mt-1" />
      </div>
    </motion.div>
  );
}

function PortraitPlaceholder() {
  // Stylized placeholder since no actual portrait photo is shipped.
  // Uses gradient + subject initials to suggest "photo here" honestly.
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] lg:rounded-[32px]">
      {/* Dark studio background with subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, #1a1a1a 0%, #101010 55%, #0d1117 100%)",
        }}
      />
      {/* Soft rim-light cue (matches external frame edge-glow direction) */}
      <div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.05) 70%, rgba(212, 175, 55, 0.12) 100%)",
        }}
      />
      {/* Subject silhouette cue: large soft oval suggesting head/shoulders */}
      <div
        className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[58%] aspect-square rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(212, 175, 55, 0.08) 0%, rgba(30, 30, 30, 0.4) 50%, transparent 70%)",
        }}
      />
      {/* Subject initials — large, low-opacity monogram */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display font-bold leading-none select-none"
          style={{
            fontSize: "clamp(120px, 16vw, 220px)",
            color: "rgba(139, 148, 158, 0.18)",
            letterSpacing: "-0.04em",
          }}
        >
          AE
        </span>
      </div>
      {/* Subtle bottom darkening for grounding */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(13, 17, 23, 0.7) 100%)",
        }}
      />
    </div>
  );
}

function Portrait() {
  return (
    <div className="flex flex-col items-center lg:items-end gap-5">
      <div className="relative w-full max-w-[420px]">
        {/* === Tech orbit (behind the frame) === */}
        <TechOrbit />

        {/* === Portrait frame === */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.25, ease: easeOutExpo }}
          className="relative aspect-[3/4] w-full animate-float-soft"
          style={{ borderRadius: "30px" }}
        >
          {/* Outer glow */}
          <div
            className="absolute -inset-2 lg:-inset-3 rounded-[36px] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(212, 175, 55, 0.18) 0%, rgba(212, 175, 55, 0.06) 50%, transparent 75%)",
              filter: "blur(20px)",
            }}
            aria-hidden
          />
          {/* Border + frame */}
          <div
            className="relative w-full h-full overflow-hidden shadow-(--shadow-2)"
            style={{
              borderRadius: "30px",
              border: "1.5px solid rgba(212, 175, 55, 0.5)",
              boxShadow:
                "0 0 0 1px rgba(212, 175, 55, 0.1), 0 0 50px rgba(212, 175, 55, 0.14)",
            }}
          >
            <PortraitPlaceholder />
          </div>

          {/* === Device showcase (top-right) === */}
          <DeviceShowcase />
        </motion.div>

        {/* === Floating live terminal (overlaps bottom-left) === */}
        <LiveTerminalCard />

        {/* === Decorative sparkle (outside bottom-right corner) === */}
        <DecorativeSparkle />
      </div>

      {/* === Live status pill beneath the frame === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1, ease: easeOutExpo }}
        className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[11px] text-(--color-muted)"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-(--color-accent)" />
        Available for Freelance
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Hero — top-level composition                                            */
/* ----------------------------------------------------------------------- */

export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden bg-(--color-background)"
      style={{ minHeight: "100vh" }}
    >
      {/* Background layers */}
      <Background />

      {/* Spine label — outer decorative margin, hidden on small screens */}
      <SpineLabel />

      {/* Main two-column composition */}
      <div className="section-container-hero relative z-10 pt-32 md:pt-36 lg:pt-40 pb-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[560px] lg:min-h-[600px]">
          {/* Left content column — col-span-7 at lg+ */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <LeftContent />
          </div>

          {/* Right portrait column — col-span-5 at lg+, sits above on mobile */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end">
            <Portrait />
          </div>
        </div>

        {/* === Stats row — full section width, below the fold === */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 lg:mt-20">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.7 + i * 0.05,
                ease: easeOutExpo,
              }}
              className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) backdrop-blur-md p-5 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 text-(--color-muted-foreground) mb-1">
                <s.Icon size={13} strokeWidth={1.6} />
              </div>
              <div className="font-display text-[26px] md:text-[30px] font-bold text-(--color-accent) leading-none">
                {s.value}
              </div>
              <div className="font-mono text-[9px] md:text-[10px] tracking-[0.1em] uppercase text-(--color-muted-foreground) mt-2">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator — independent, bottom-center */}
      <ScrollIndicator />
    </section>
  );
}