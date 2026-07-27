"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/shared";
import { recognitions } from "@/lib/data";

/* ----------------------------------------------------------------------- */
/* Real data derived for this section                                      */
/* ----------------------------------------------------------------------- */

/** Achievement counter — real, verifiable counts only. */
const achievementCounts = [
  { value: String(recognitions.length), label: "Recognitions" },
  { value: "500+", label: "Problems Solved" },
  { value: "3", label: "Platforms" },
  { value: "2023—Now", label: "Active Since" },
];

/** Organization / platform showcase — real names pulled from the real bio
 * and education copy, not invented issuing bodies. */
const organizations = [
  "HNU-FCSIT ICPC Community",
  "HNU-FCSIT Student Union",
  "Codeforces",
  "LeetCode",
  "HackerRank",
];

export default function Recognitions() {
  return (
    <section id="certificates" className="relative section-padding">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Left column */}
          <div className="lg:col-span-4">
            <SectionHeading
              index="05"
              label="Achievements"
              title="Certificates & Recognitions"
            />
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-(--color-muted) text-sm leading-relaxed"
            >
              A verified record of leadership roles, competitive milestones,
              and community recognition — every entry here is real, not a
              placeholder.
            </motion.p>
          </div>
          <div className="lg:col-span-8" />
        </div>

        {/* ══════════════ Recognition wall ══════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {recognitions.map((rec, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-6 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) hover:border-(--color-border-hover) transition-all duration-300"
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-bold text-white/10 group-hover:text-(--color-accent)/20 transition-colors">
                    {num}
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-(--color-muted-foreground)">
                    Ongoing
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-semibold text-white text-base mb-2">
                  {rec.title}
                </h3>

                {/* Organization */}
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-(--color-accent-soft) mb-4">
                  {rec.organization}
                </p>

                {/* Description */}
                <p className="text-(--color-muted) text-sm leading-relaxed mb-5">
                  {rec.description}
                </p>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded text-[8px] font-mono tracking-[0.15em] uppercase border border-(--color-border) bg-(--color-glass-fill) text-(--color-muted-foreground)">
                    Verified
                  </span>
                  <span className="px-2 py-1 rounded text-[8px] font-mono tracking-[0.15em] uppercase border border-(--color-border) bg-(--color-glass-fill) text-(--color-muted-foreground)">
                    Active Role
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ══════════════ Achievement counter ══════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
          {achievementCounts.map((s, i) => (
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

        {/* ══════════════ Organization / platform showcase ══════════════ */}
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
        <div className="mb-16 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-6">
          <div className="font-mono text-[11px] font-semibold text-(--color-muted-foreground) uppercase tracking-[0.12em] mb-3">
            Next Target
          </div>
          <p className="text-(--color-muted) text-sm leading-relaxed">
            Formal certifications in Cloud (Azure) and advanced Flutter
            development are a planned next step — this space will list real,
            verifiable credentials as they&apos;re earned.
          </p>
        </div>

        {/* ══════════════ Philosophy quote ══════════════ */}
        <div className="text-center py-6 mb-4">
          <p className="font-display text-lg md:text-xl font-semibold text-white max-w-xl mx-auto leading-snug italic">
            &ldquo;Recognition follows consistency — showing up, contributing,
            and solving one problem at a time.&rdquo;
          </p>
        </div>

        {/* Ledger end */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-(--color-muted-foreground)">
            Ledger_End // End of Records / 2023 — Present
          </span>
        </motion.div>
      </div>
    </section>
  );
}