"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/shared";
import { recognitions } from "@/lib/data";

export default function Recognitions() {
  return (
    <section id="recognitions" className="relative section-padding">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Left column */}
          <div className="lg:col-span-4">
            <SectionHeading
              index="05"
              label="Milestone Ledger"
              title="Recognitions & System Merit."
            />
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-neutral-400 text-sm leading-relaxed"
            >
              A verified chronological record of leadership roles, competitive
              standings, and community contributions.
            </motion.p>
          </div>
          <div className="lg:col-span-8" />
        </div>

        {/* Recognition cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recognitions.map((rec, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-300"
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-3xl font-bold text-white/10 group-hover:text-white/20 transition-colors">
                    {num}
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-neutral-600">
                    2024
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display font-semibold text-white text-base mb-2">
                  {rec.title}
                </h3>

                {/* Category */}
                <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-neutral-500 mb-4">
                  {rec.organization}
                </p>

                {/* Description */}
                <p className="text-neutral-500 text-sm leading-relaxed mb-5">
                  {rec.description}
                </p>

                {/* Status badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded text-[8px] font-mono tracking-[0.15em] uppercase border border-white/[0.06] bg-white/[0.02] text-neutral-600">
                    System_Status: Verified
                  </span>
                  <span className="px-2 py-1 rounded text-[8px] font-mono tracking-[0.15em] uppercase border border-white/[0.06] bg-white/[0.02] text-neutral-600">
                    Active_Role
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Ledger end */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-neutral-700">
            Ledger_End // End of Records / 2023 — 2026
          </span>
        </motion.div>
      </div>
    </section>
  );
}
