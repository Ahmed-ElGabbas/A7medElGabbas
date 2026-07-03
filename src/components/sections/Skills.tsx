"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/shared";
import { skillCategories } from "@/lib/data";

const levelMap: Record<number, string> = {
  0: "SYS_MASTER",
  1: "SYS_ADVANCED",
  2: "SYS_PROFICIENT",
};

function getSkillLevel(index: number): string {
  if (index < 3) return levelMap[0];
  if (index < 6) return levelMap[1];
  return levelMap[2];
}

function getSkillPercent(index: number): number {
  const base = 95 - index * 3;
  return Math.max(65, Math.min(95, base));
}

export default function Skills() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="skills" className="relative section-padding">
      <div className="section-container">
        <SectionHeading
          index="02"
          label="Core Arsenal"
          title="System Topology."
          subtitle="A mapped index of core technical competencies, calibrated against production-grade deployment standards."
        />

        {/* Tab buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {skillCategories.map((cat, i) => (
            <button
              key={cat.title}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 rounded-lg font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-300 border ${
                activeTab === i
                  ? "border-white/25 bg-white/[0.04] text-white"
                  : "border-white/[0.05] bg-transparent text-neutral-500 hover:border-white/[0.12] hover:text-neutral-300"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </motion.div>

        {/* Active nodes count */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-600">
            {skillCategories[activeTab].skills.length} nodes active
          </span>
        </motion.div>

        {/* Skills grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
          >
            {skillCategories[activeTab].skills.map((skill, i) => {
              const percent = getSkillPercent(i);
              const level = getSkillLevel(i);
              const nodeId = String(i + 1).padStart(3, "0");

              return (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="group p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-300 cursor-default"
                >
                  {/* Top row: node ID + percent */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[9px] tracking-[0.15em] text-neutral-600">
                      NODE_{nodeId}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.1em] text-neutral-500 group-hover:text-neutral-300 transition-colors">
                      {percent}%
                    </span>
                  </div>

                  {/* Skill name */}
                  <div className="font-display font-semibold text-sm text-white mb-3 group-hover:text-white transition-colors">
                    {skill}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-px bg-white/[0.06] mb-3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percent}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-white/20 group-hover:bg-white/40 transition-colors"
                    />
                  </div>

                  {/* Level */}
                  <div className="flex justify-end">
                    <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-neutral-600 group-hover:text-neutral-400 transition-colors">
                      {level}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
