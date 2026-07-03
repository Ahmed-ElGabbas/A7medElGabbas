"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  stats,
  socialLinks,
  headlineLines,
  headlineSubLines,
} from "./data";

/**
 * LeftContent — composes the entire left column of the Hero (≈ 54% of section
 * width at desktop). Top-to-bottom: availability badge → eyebrow → headline
 * (5 lines + decorative ampersand) → paragraph → stat row → CTA group →
 * social row.
 *
 * Load-in animations use the spec's stagger pattern (Section 13):
 *   badge 0ms → eyebrow 80ms → headline 140–260ms → paragraph 350ms →
 *   stats 420–470ms → CTAs 500ms → socials 560ms.
 */

const easeOutExpo = [0.16, 1, 0.3, 1] as const;
const easeStandard = [0.4, 0, 0.2, 1] as const;

// Per-element load-in variant. Applied via custom delay prop.
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

function StatItem({
  Icon,
  value,
  label,
  delay,
}: {
  Icon: typeof stats[number]["Icon"];
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={makeDelayedItem(delay)}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-2 text-faint">
        <Icon size={14} strokeWidth={1.6} />
        <span className="font-display text-[22px] md:text-[24px] font-bold text-heading leading-none">
          {value}
        </span>
      </div>
      <span className="font-mono text-[9px] md:text-[10px] tracking-[0.1em] uppercase text-muted-stat leading-[1.4]">
        {label}
      </span>
    </motion.div>
  );
}

export default function LeftContent() {
  return (
    <div className="flex flex-col gap-7 md:gap-8">
      {/* === Availability badge === */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0 }}
        className="flex"
      >
        <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border border-border-hero/40 bg-surface-1 backdrop-blur-sm">
          <span className="relative flex items-center justify-center w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-primary animate-badge-pulse" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-primary" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase font-semibold text-heading">
            Available for Work
          </span>
          <span className="text-faintest">·</span>
          <span className="font-mono text-[10px] tracking-[0.05em] text-muted-stat">
            Open to new opportunities · 2025
          </span>
        </div>
      </motion.div>

      {/* === Eyebrow === */}
      <motion.div
        variants={makeDelayedItem(0.08)}
        initial="hidden"
        animate="show"
      >
        <span className="font-mono text-[12px] md:text-[13px] font-semibold tracking-[0.3em] uppercase text-primary-eyebrow">
          Software Engineer
        </span>
      </motion.div>

      {/* === Headline (5 lines + decorative ampersand) === */}
      <h1 className="flex flex-col font-display font-black tracking-[-0.015em] text-heading leading-[0.93] text-[44px] sm:text-[56px] md:text-[64px] lg:text-[72px] xl:text-[76px]">
        {headlineLines.map((line, i) => (
          <motion.span
            key={`top-${line}-${i}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.14 + i * 0.06,
              ease: easeOutExpo,
            }}
            className="block"
          >
            {line}
          </motion.span>
        ))}
        {/* Oversized decorative ampersand */}
        <motion.span
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.32,
            ease: easeOutExpo,
          }}
          className="block text-stroke text-[#a3a4a8] my-1 text-[64px] sm:text-[76px] md:text-[86px] lg:text-[92px] xl:text-[96px] leading-[0.9] font-black select-none"
          aria-hidden
        >
          &amp;
        </motion.span>
        {headlineSubLines.map((line, i) => (
          <motion.span
            key={`bot-${line}-${i}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.44 + i * 0.07,
              ease: easeOutExpo,
            }}
            className={i === 1 ? "block text-white/90" : "block"}
          >
            {line}
          </motion.span>
        ))}
      </h1>

      {/* === Supporting paragraph === */}
      <motion.p
        variants={makeDelayedItem(0.35)}
        initial="hidden"
        animate="show"
        className="text-body text-[14px] md:text-[15px] leading-[1.55] max-w-[490px]"
      >
        Engineering production-scale systems — from cross-platform mobile apps to
        full-stack web platforms. Every line crafted with precision, intent, and
        an obsession with the details users actually feel.
      </motion.p>

      {/* === Stat row === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6 max-w-[540px] pt-2">
        {stats.map((s, i) => (
          <StatItem
            key={s.label}
            Icon={s.Icon}
            value={s.value}
            label={s.label}
            delay={0.42 + i * 0.04}
          />
        ))}
      </div>

      {/* === CTA group === */}
      <motion.div
        variants={makeDelayedItem(0.5)}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-center gap-3 pt-1"
      >
        {/* Primary button */}
        <motion.a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
          }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: easeStandard }}
          className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-bg-base font-mono text-[12px] font-bold tracking-[0.1em] uppercase shadow-btn-teal hover:shadow-btn-teal-hover transition-shadow duration-200"
        >
          <span>Hire Me</span>
          <span className="inline-flex w-6 h-6 rounded-md bg-primary-deep/30 items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <ArrowUpRight size={13} strokeWidth={2.5} className="text-bg-base" />
          </span>
        </motion.a>

        {/* Secondary button */}
        <motion.a
          href="#projects"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
          }}
          whileHover={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: "rgba(255,255,255,0.04)" }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: easeStandard }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border-hero-2/50 text-heading font-mono text-[12px] font-bold tracking-[0.1em] uppercase"
        >
          <span>View Work</span>
          <ArrowUpRight size={13} strokeWidth={2.2} />
        </motion.a>
      </motion.div>

      {/* === Social row === */}
      <motion.div
        variants={makeDelayedItem(0.56)}
        initial="hidden"
        animate="show"
        className="flex flex-wrap items-center gap-5 md:gap-6 pt-2"
      >
        {socialLinks.map(({ label, href, Icon }) => (
          <motion.a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ color: "#ffffff" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="group inline-flex items-center gap-2 text-muted hover:text-heading"
            aria-label={label}
          >
            <Icon size={14} strokeWidth={1.6} className="group-hover:scale-110 transition-transform" />
            <span className="font-mono text-[11px] tracking-[0.08em] uppercase hidden sm:inline">
              {label}
            </span>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}
