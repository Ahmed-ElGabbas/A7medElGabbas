"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Users,
  Code2,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/shared";
import { recognitions } from "@/lib/data";
import { useMediaQuery } from "@/hooks/use-scroll";

/* ----------------------------------------------------------------------- */
/* Real data derived for this section                                      */
/* ----------------------------------------------------------------------- */

/**
 * Skills badges per recognition — each one is a direct paraphrase of the
 * real `description` already in lib/data.ts, not an invented claim.
 */
const skillsByTitle: Record<string, string[]> = {
  "ICPC Community Member": ["Event Organization", "Team Recruitment", "Community Building"],
  "Student Union Leader": ["Team Management", "Event Leadership", "Collaboration"],
  "Problem Solver": ["Algorithmic Thinking", "Analytical Rigor", "Competitive Programming"],
};

const iconByTitle: Record<string, LucideIcon> = {
  "ICPC Community Member": Users,
  "Student Union Leader": Trophy,
  "Problem Solver": Code2,
};

/** Achievement plaque stats — real, verifiable counts only. */
const plaqueStats = [
  { value: String(recognitions.length), label: "Recognitions" },
  { value: "500+", label: "Problems Solved" },
  { value: "3", label: "Platforms" },
  { value: "2023", label: "Since" },
];

const organizations = [
  "HNU-FCSIT ICPC Community",
  "HNU-FCSIT Student Union",
  "Codeforces",
  "LeetCode",
  "HackerRank",
];

const featuredIndex = Math.max(
  recognitions.findIndex((r) => r.title === "Student Union Leader"),
  0
);
const secondaryRecognitions = recognitions.filter((_, i) => i !== featuredIndex);
const featured = recognitions[featuredIndex];

/* ----------------------------------------------------------------------- */
/* Interactive spotlight + tilt hook                                       */
/* ----------------------------------------------------------------------- */

function useCardInteraction() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [active, setActive] = useState(false);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x: px, y: py });
    setTilt({
      ry: (px - 50) / 10, // rotateY
      rx: -(py - 50) / 10, // rotateX
    });
  };

  const onMouseEnter = () => setActive(true);
  const onMouseLeave = () => {
    setActive(false);
    setTilt({ rx: 0, ry: 0 });
  };

  return {
    ref,
    active,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
    spotlightStyle: {
      background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, rgba(212,175,55,0.16), transparent 65%)`,
    },
    tiltStyle: reduceMotion
      ? undefined
      : {
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      },
  };
}

/* ----------------------------------------------------------------------- */
/* Decorative floating particles                                           */
/* ----------------------------------------------------------------------- */

function ParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: (i * 137) % 100,
        top: (i * 71) % 100,
        size: 2 + (i % 3),
        delay: (i % 5) * 0.6,
        duration: 5 + (i % 4),
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-(--color-accent)"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            opacity: 0.15,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Featured recognition — gold-foil hero showcase                          */
/* ----------------------------------------------------------------------- */

function FeaturedShowcase() {
  const { ref, onMouseMove, onMouseEnter, onMouseLeave, spotlightStyle, tiltStyle } =
    useCardInteraction();
  const Icon = iconByTitle[featured.title] ?? Trophy;
  const skills = skillsByTitle[featured.title] ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-16"
    >
      {/* Ambient glow behind the frame */}
      <div
        className="absolute -inset-8 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px 300px at 30% 30%, rgba(212,175,55,0.12), transparent 70%)",
          filter: "blur(20px)",
        }}
        aria-hidden
      />

      {/* Gold-foil border frame (gradient padding trick) */}
      <div
        className="relative rounded-(--radius-xl) p-[1.5px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(212,175,55,0.9), rgba(245,215,110,0.25), rgba(212,175,55,0.6))",
        }}
      >
        <div
          ref={ref}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={tiltStyle}
          className="relative overflow-hidden rounded-(--radius-xl) bg-(--color-glass-fill-strong) backdrop-blur-2xl p-8 md:p-12 transition-transform duration-200 ease-out"
        >
          {/* Cursor spotlight */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={spotlightStyle}
            aria-hidden="true"
          />

          {/* Corner accents */}
          <span className="absolute top-4 left-4 w-6 h-6 border-t border-l border-(--color-accent)/40 rounded-tl-md" />
          <span className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-(--color-accent)/40 rounded-br-md" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-8">
            {/* Medallion */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div
                className="relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "conic-gradient(from 180deg, #D4AF37, #F5D76E, #D4AF37, #FFD54F, #D4AF37)",
                }}
              >
                <div className="absolute inset-[3px] rounded-full bg-(--color-bg-elevated) flex items-center justify-center">
                  <Icon size={34} className="text-(--color-accent)" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Sparkles size={12} className="text-(--color-accent)" />
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-(--color-accent)">
                  Featured Recognition
                </span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                {featured.title}
              </h3>
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-(--color-accent-soft) mb-4">
                {featured.organization}
              </p>
              <p className="text-(--color-muted) text-sm md:text-[15px] leading-relaxed max-w-xl mx-auto md:mx-0 mb-5">
                {featured.description}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-full border border-(--color-accent)/40 bg-[rgba(212,175,55,0.06)] font-mono text-[10px] uppercase tracking-[0.08em] text-(--color-accent-soft)"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------- */
/* Secondary recognition card                                              */
/* ----------------------------------------------------------------------- */

function SecondaryCard({
  rec,
  index,
}: {
  rec: (typeof recognitions)[number];
  index: number;
}) {
  const { ref, onMouseMove, onMouseEnter, onMouseLeave, spotlightStyle, tiltStyle } =
    useCardInteraction();
  const [expanded, setExpanded] = useState(false);
  const Icon = iconByTitle[rec.title] ?? ShieldCheck;
  const skills = skillsByTitle[rec.title] ?? [];
  const refNumber = `REF-0${index + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={tiltStyle}
        className="group relative overflow-hidden rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) hover:border-(--color-accent)/50 transition-[border-color] duration-300 p-6"
      >
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={spotlightStyle}
          aria-hidden="true"
        />

        <div className="relative flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-(--radius-md) border border-(--color-accent)/40 bg-(--color-surface) flex items-center justify-center">
            <Icon size={18} className="text-(--color-accent)" strokeWidth={1.6} />
          </div>
          <span className="font-mono text-[9px] tracking-[0.15em] text-(--color-muted-foreground)">
            {refNumber}
          </span>
        </div>

        <h4 className="relative font-display font-semibold text-white text-lg mb-1.5">
          {rec.title}
        </h4>
        <p className="relative font-mono text-[10px] tracking-[0.1em] uppercase text-(--color-accent-soft) mb-4">
          {rec.organization}
        </p>

        <div className="relative flex flex-wrap gap-1.5 mb-4">
          {skills.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 rounded-full border border-(--color-border) bg-(--color-surface) font-mono text-[9px] uppercase tracking-[0.06em] text-(--color-muted)"
            >
              {s}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="relative flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-(--color-muted-foreground) hover:text-(--color-accent) transition-colors"
        >
          Details
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative overflow-hidden"
            >
              <p className="pt-3 text-(--color-muted) text-[13px] leading-relaxed">
                {rec.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------- */
/* Main section                                                            */
/* ----------------------------------------------------------------------- */

export default function Recognitions() {
  return (
    <section id="certificates" className="relative section-padding overflow-hidden">
      <ParticleField />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-14">
          <div className="lg:col-span-5">
            <SectionHeading
              index="05"
              label="Hall of Recognition"
              title="Certificates & Recognitions"
            />
          </div>
          <div className="lg:col-span-7 flex items-end">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-(--color-muted) text-sm md:text-base leading-relaxed"
            >
              Every entry here is real — a verified record of leadership,
              community contribution, and competitive milestones. Formal
              issued certifications will be showcased here, with full
              verification details, as they&apos;re earned.
            </motion.p>
          </div>
        </div>

        {/* ══════════════ Featured showcase ══════════════ */}
        <FeaturedShowcase />

        {/* ══════════════ Secondary showcase grid ══════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {secondaryRecognitions.map((rec, i) => (
            <SecondaryCard key={rec.title} rec={rec} index={i} />
          ))}
        </div>

        {/* ══════════════ Achievement plaque ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) mb-16 py-8 px-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-(--color-border)">
            {plaqueStats.map((s) => (
              <div key={s.label} className="text-center px-2">
                <div className="font-display text-2xl md:text-3xl font-bold text-(--color-accent)">
                  {s.value}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-(--color-muted-foreground) mt-2">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════ Communities & platforms ══════════════ */}
        <div className="mb-16">
          <div className="font-mono text-[11px] font-semibold text-(--color-muted-foreground) uppercase tracking-[0.12em] mb-5">
            Communities &amp; Platforms
          </div>
          <div className="flex flex-wrap gap-2">
            {organizations.map((org) => (
              <span
                key={org}
                className="px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[11px] text-(--color-muted)"
              >
                {org}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════════ Next target ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 rounded-(--radius-lg) border border-dashed border-(--color-accent)/40 bg-[rgba(212,175,55,0.03)] p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={14} className="text-(--color-accent)" />
            <span className="font-mono text-[10px] font-semibold text-(--color-accent) uppercase tracking-[0.15em]">
              Coming Soon — Verified Credentials
            </span>
          </div>
          <p className="text-(--color-muted) text-sm leading-relaxed">
            Formal certifications in Cloud (Azure) and advanced Flutter
            development are the next planned milestones — this space will
            display real, verifiable credentials with issuer, date, and
            credential ID as they&apos;re earned.
          </p>
        </motion.div>

        {/* ══════════════ Signature quote ══════════════ */}
        <div className="text-center py-6">
          <p className="font-display text-lg md:text-xl font-semibold text-white max-w-xl mx-auto leading-snug italic">
            &ldquo;Recognition follows consistency — showing up,
            contributing, and solving one problem at a time.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}