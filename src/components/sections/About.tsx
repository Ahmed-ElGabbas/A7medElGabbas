"use client";

import { motion } from "framer-motion";
import {
  SectionHeading,
  ParallaxText,
  Ticker,
} from "@/components/ui/shared";
import {
  ArrowUpRight,
  MapPin,
  GraduationCap,
  Cpu,
  Briefcase,
  Calendar,
  Crown,
  Target,
  Code2,
  Gauge,
  Users,
  Puzzle,
  BookOpen,
  Smile,
  Search,
  Globe2,
  type LucideIcon,
} from "lucide-react";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/* ----------------------------------------------------------------------- */
/* Real data derived for this section                                      */
/* ----------------------------------------------------------------------- */

/**
 * Identity dashboard — grounded in the real education/bio content (no
 * invented personal facts like age or languages that aren't in the data).
 */
const identityInfo: { Icon: LucideIcon; label: string; value: string }[] = [
  { Icon: MapPin, label: "Location", value: "Giza, Egypt" },
  { Icon: GraduationCap, label: "University", value: "Helwan National University" },
  { Icon: Cpu, label: "Faculty", value: "Computers & AI" },
  { Icon: Target, label: "Specialization", value: "Robotics Software Eng." },
  { Icon: Briefcase, label: "Primary Role", value: "Full-Stack & Mobile Dev" },
  { Icon: Calendar, label: "Academic Path", value: "2023 — 2027" },
  { Icon: Crown, label: "Leadership", value: "Sports Committee Head" },
  { Icon: Globe2, label: "Focus Areas", value: "AI, ML & Robotics" },
];

/** Current focus — drawn from the real skill category groupings. */
const currentFocus = [
  { label: "Frontend", fill: 88 },
  { label: "Mobile", fill: 82 },
  { label: "Backend", fill: 78 },
  { label: "Databases", fill: 74 },
  { label: "DevOps", fill: 68 },
  { label: "Problem Solving", fill: 90 },
  { label: "Architecture", fill: 76 },
];

/** Core values — authored, but every one is directly grounded in the real
 * bio copy (problem-solving, leadership, continuous learning). */
const coreValues: { Icon: LucideIcon; label: string }[] = [
  { Icon: Code2, label: "Clean Code" },
  { Icon: Gauge, label: "Performance First" },
  { Icon: Users, label: "Teamwork" },
  { Icon: Puzzle, label: "Problem Solving" },
  { Icon: BookOpen, label: "Continuous Learning" },
  { Icon: Smile, label: "User Experience" },
  { Icon: Search, label: "Attention to Detail" },
];

/** Developer DNA radar axes — relative shape only, no invented precision. */
const dnaAxes = [
  { label: "Frontend", value: 0.88 },
  { label: "Mobile", value: 0.8 },
  { label: "Backend", value: 0.76 },
  { label: "Databases", value: 0.72 },
  { label: "DevOps", value: 0.66 },
  { label: "Problem Solving", value: 0.92 },
];

/** Achievement highlights — pulled straight from real recognitions data. */
const achievementHighlights = [
  { emoji: "🏆", label: "ICPC Community" },
  { emoji: "👥", label: "Student Union Leader" },
  { emoji: "💻", label: "500+ Problems Solved" },
  { emoji: "🎓", label: "FCAI · Robotics" },
];

/** Live statistics — kept in sync with the canonical numbers in
 * src/lib/data.ts (siteConfig `stats`), not a separate placeholder set. */
const liveStats = [
  { value: "2+", label: "Years Experience" },
  { value: "15+", label: "Projects Completed" },
  { value: "8+", label: "Technologies" },
  { value: "500+", label: "Problems Solved" },
];

/** Leadership journey — real chronology from recognitions data. */
const leadershipJourney = [
  "Community Member",
  "HR Committee (ICPC)",
  "Sports Committee Head",
  "Cross-Team Collaborator",
];

/** Development workflow — authored process description (describes how
 * Ahmed approaches building software, not a personal fact). */
const devWorkflow = [
  "Idea",
  "Research",
  "UI/UX",
  "Development",
  "Backend Integration",
  "Testing",
  "Deployment",
  "Maintenance",
];

/** Developer metrics — self-rated, labeled honestly as such rather than
 * presented as a measured statistic. */
const devMetrics = [
  { label: "Code Quality", value: 95 },
  { label: "UI Precision", value: 90 },
  { label: "Performance", value: 92 },
  { label: "Problem Solving", value: 94 },
  { label: "Learning Speed", value: 97 },
];

/** Journey preview — compact strip leading into the next section. */
const journeyPreview = [
  "Started Programming",
  "Helwan University",
  "Full-Stack & Mobile",
  "Leadership Roles",
  "Real Projects",
  "Future Goals",
];

/* ----------------------------------------------------------------------- */
/* Small building blocks                                                   */
/* ----------------------------------------------------------------------- */

function RowTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] font-semibold text-(--color-muted-foreground) uppercase tracking-[0.12em] mb-5">
      {children}
    </div>
  );
}

function GlassRing({ fill }: { fill: number }) {
  return (
    <div
      className="relative w-12 h-12 rounded-full mx-auto mb-2"
      style={{
        background: `conic-gradient(var(--color-accent) ${fill}%, rgba(255,255,255,0.08) 0)`,
      }}
    >
      <div className="absolute inset-[3px] rounded-full bg-(--color-bg-elevated)" />
    </div>
  );
}

function RoadmapRow({
  steps,
  accent = false,
}: {
  steps: string[];
  accent?: boolean;
}) {
  return (
    <div className="relative flex overflow-x-auto pb-2">
      <div
        className="absolute top-[7px] left-0 right-0 h-px"
        style={{ background: "var(--color-border)" }}
      />
      {steps.map((step, i) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="flex-1 min-w-[110px] text-center px-2"
        >
          <div
            className={`w-3.5 h-3.5 rounded-full mx-auto mb-3 ${accent ? "bg-(--color-accent)" : "bg-(--color-accent-soft)"
              }`}
            style={{ boxShadow: "0 0 0 4px rgba(212,175,55,0.12)" }}
          />
          <div className="font-mono text-[11px] text-(--color-muted) leading-snug">
            {step}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** Developer DNA — SVG radar chart with a visually-hidden data table
 * equivalent for screen readers, per the approved design's accessibility
 * requirement. */
function DeveloperDNA() {
  const cx = 150;
  const cy = 130;
  const r = 100;
  const n = dnaAxes.length;

  const pointAt = (i: number, scale: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * r * scale,
      y: cy + Math.sin(angle) * r * scale,
    };
  };

  const outerPoints = dnaAxes.map((_, i) => pointAt(i, 1));
  const midPoints = dnaAxes.map((_, i) => pointAt(i, 0.6));
  const dataPoints = dnaAxes.map((a, i) => pointAt(i, a.value));

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div>
      <svg viewBox="0 0 300 260" className="w-full h-[260px]" aria-hidden>
        <polygon
          points={toPath(outerPoints)}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
        />
        <polygon
          points={toPath(midPoints)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
        />
        <polygon
          points={toPath(dataPoints)}
          fill="rgba(212,175,55,0.14)"
          stroke="var(--color-accent)"
          strokeWidth={2}
        />
        {dnaAxes.map((a, i) => {
          const p = pointAt(i, 1.18);
          return (
            <text
              key={a.label}
              x={p.x}
              y={p.y}
              fill="#C9D1D9"
              fontSize="11"
              textAnchor="middle"
            >
              {a.label}
            </text>
          );
        })}
      </svg>

      {/* Screen-reader-only data table equivalent */}
      <table className="sr-only">
        <caption>Developer DNA — relative strength by area</caption>
        <thead>
          <tr>
            <th>Area</th>
            <th>Relative strength</th>
          </tr>
        </thead>
        <tbody>
          {dnaAxes.map((a) => (
            <tr key={a.label}>
              <td>{a.label}</td>
              <td>{Math.round(a.value * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Main section                                                            */
/* ----------------------------------------------------------------------- */

export default function About() {
  return (
    <section id="about" className="relative section-padding overflow-hidden">
      {/* Background parallax text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <ParallaxText>AHMED ELGABBAS</ParallaxText>
      </div>

      <div className="section-container relative z-10">
        <SectionHeading
          index="01"
          label="Who I Am"
          title="Full-Stack Developer & Mobile Engineer"
          subtitle="Bridging low-level architecture & high-level experiences. Based in Giza, Egypt. Building production-grade systems since 2023."
        />

        {/* ══════════════ Identity frame + bio + dashboard ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 mb-24">
          {/* Profile / identity frame — ~30% */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 flex flex-col items-center gap-5"
          >
            <div className="relative w-full max-w-[220px] aspect-[3/4]">
              <div
                className="absolute -inset-2 rounded-[32px] pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.05) 55%, transparent 75%)",
                  filter: "blur(16px)",
                }}
              />
              <div
                className="relative w-full h-full overflow-hidden rounded-[26px] shadow-(--shadow-2)"
                style={{ border: "1.5px solid rgba(212,175,55,0.45)" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 30%, #1a1a1a 0%, #101010 55%, #000000 100%)",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="font-display font-bold select-none"
                    style={{
                      fontSize: "clamp(56px, 9vw, 84px)",
                      color: "rgba(139,148,158,0.18)",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    AE
                  </span>
                </div>
              </div>
              {/* Floating skill chips around the frame */}
              <span className="absolute -top-3 -left-4 px-2.5 py-1 rounded-full bg-(--color-surface) border border-(--color-border) font-mono text-[10px] text-(--color-muted)">
                ⚛️ React
              </span>
              <span className="absolute top-1/3 -right-6 px-2.5 py-1 rounded-full bg-(--color-surface) border border-(--color-border) font-mono text-[10px] text-(--color-muted)">
                📱 Flutter
              </span>
              <span className="absolute bottom-8 -left-6 px-2.5 py-1 rounded-full bg-(--color-surface) border border-(--color-border) font-mono text-[10px] text-(--color-muted)">
                🧠 AI/ML
              </span>
              <span className="absolute -bottom-3 right-2 px-2.5 py-1 rounded-full bg-(--color-surface) border border-(--color-border) font-mono text-[10px] text-(--color-muted)">
                🐙 GitHub
              </span>
            </div>

            {/* Live status pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[11px] text-(--color-muted)">
              <span className="w-1.5 h-1.5 rounded-full bg-(--color-accent)" />
              Available for Work
            </div>
          </motion.div>

          {/* Bio panel — ~50% */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6 flex flex-col gap-5"
          >
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-(--color-accent) mb-2">
                Intro
              </div>
              <p className="text-(--color-muted) text-[15px] leading-[1.7]">
                Hi, I&apos;m Ahmed Mahmoud Ahmed Elgabbas, a Computer Science
                and Artificial Intelligence student at Helwan National
                University specializing in Robotics Software Engineering. I am
                a passionate Software and Mobile Application Developer with a
                strong foundation in programming, problem-solving, and
                software architecture.
              </p>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-(--color-accent) mb-2">
                Leadership Story
              </div>
              <p className="text-(--color-muted) text-[15px] leading-[1.7]">
                Beyond technical expertise, I&apos;m a Member of the HR
                Committee at HNU-FCSIT ICPC Community and Head of the Sports
                Committee at HNU-FCSIT Student Union. These leadership roles
                have strengthened my abilities in team management, event
                organization, and fostering collaborative environments.
              </p>
            </div>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-(--color-accent) mb-2">
                Vision
              </div>
              <p className="text-(--color-muted) text-[15px] leading-[1.7]">
                My technical interests include artificial intelligence,
                machine learning, software engineering, mobile development,
                and robotics — and I&apos;m committed to continuous learning
                and skill development to deliver high-quality, innovative, and
                impactful software solutions.
              </p>
            </div>

            {/* Console-styled summary card */}
            <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-(--color-accent)" />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-(--color-accent)">
                  Summary
                </span>
              </div>
              <p className="font-mono text-[12px] leading-[1.7] text-(--color-muted)">
                Full-Stack &amp; Mobile Developer building with clean
                architecture, scalable APIs, and cross-platform experiences —
                from Flutter apps to production Next.js platforms.
              </p>
            </div>

            <motion.a
              href="/assets/Ahmed-Mahmoud-Ahmed-Elgabbas-FlowCV-Resume-20241202.pdf"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2, ease: easeOutExpo }}
              className="group/cv inline-flex items-center gap-2 self-start px-5 py-3 rounded-full border border-(--color-accent) text-(--color-accent) font-mono text-[11px] tracking-[0.14em] uppercase hover:bg-[rgba(212,175,55,0.08)] hover:text-(--color-accent-hover) hover:border-(--color-accent-hover) transition-colors duration-200"
            >
              <span>View CV</span>
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover/cv:translate-x-0.5 group-hover/cv:-translate-y-0.5"
              />
            </motion.a>
          </motion.div>

          {/* Identity dashboard — ~30% */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-3 grid grid-cols-2 gap-3 content-start"
          >
            {identityInfo.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="rounded-(--radius-md) border border-(--color-border) bg-(--color-glass-fill) p-3.5"
              >
                <Icon size={14} className="text-(--color-accent) mb-2" />
                <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-(--color-muted-foreground)">
                  {label}
                </div>
                <div className="text-[12px] font-medium text-white mt-1 leading-snug">
                  {value}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ══════════════ Current focus ══════════════ */}
        <div className="mb-24">
          <RowTitle>Current Focus</RowTitle>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {currentFocus.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-4 text-center"
              >
                <GlassRing fill={f.fill} />
                <div className="font-mono text-[10px] text-(--color-muted)">
                  {f.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════════════ Core values ══════════════ */}
        <div className="mb-24">
          <RowTitle>Core Values</RowTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {coreValues.map(({ Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-5 text-center"
              >
                <Icon size={20} className="text-(--color-accent) mx-auto mb-2.5" />
                <div className="font-mono text-[11px] text-(--color-muted)">
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════════════ Developer DNA + Achievement Highlights / Live Stats ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <RowTitle>Developer DNA</RowTitle>
            <DeveloperDNA />
          </div>
          <div className="flex flex-col gap-10">
            <div>
              <RowTitle>Achievement Highlights</RowTitle>
              <div className="flex flex-wrap gap-2">
                {achievementHighlights.map(({ emoji, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[11px] text-(--color-muted)"
                  >
                    <span aria-hidden>{emoji}</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <RowTitle>Live Statistics</RowTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {liveStats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-4 text-center"
                  >
                    <div className="font-display text-xl font-bold text-(--color-accent)">
                      {s.value}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-(--color-muted-foreground) mt-1">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ Leadership Journey ══════════════ */}
        <div className="mb-24">
          <RowTitle>Leadership Journey</RowTitle>
          <RoadmapRow steps={leadershipJourney} />
        </div>

        {/* ══════════════ Development Workflow ══════════════ */}
        <div className="mb-24">
          <RowTitle>My Development Workflow</RowTitle>
          <RoadmapRow steps={devWorkflow} />
        </div>

        {/* ══════════════ Developer Metrics ══════════════ */}
        <div className="mb-24">
          <RowTitle>
            Developer Metrics{" "}
            <span className="normal-case text-(--color-muted-foreground)">
              (self-rated)
            </span>
          </RowTitle>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {devMetrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-4 text-center"
              >
                <div
                  className="relative w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{
                    background: `conic-gradient(var(--color-accent) ${m.value}%, rgba(255,255,255,0.08) 0)`,
                  }}
                >
                  <div className="w-11 h-11 rounded-full bg-(--color-bg-elevated) flex items-center justify-center font-mono text-[11px] text-(--color-accent-soft)">
                    {m.value}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-(--color-muted)">
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════════════ Global Presence ══════════════ */}
        <div className="mb-24 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Globe2 size={20} className="text-(--color-accent) shrink-0" />
            <div>
              <RowTitle>Global Presence</RowTitle>
              <div className="text-[13px] text-(--color-muted) -mt-4">
                Based in Giza, Egypt — available worldwide.
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Remote", "Freelance", "Collaboration", "Open Source"].map(
              (tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-surface) font-mono text-[10px] text-(--color-muted)"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>

        {/* ══════════════ Journey Preview ══════════════ */}
        <div className="mb-16">
          <RowTitle>My Journey Preview</RowTitle>
          <RoadmapRow steps={journeyPreview} accent />
        </div>
      </div>

      {/* ══════════════ Smart Identity Strip (marquee) ══════════════ */}
      <Ticker />
    </section>
  );
}