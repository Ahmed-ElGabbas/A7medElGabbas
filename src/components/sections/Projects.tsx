"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { SectionHeading, GradientDivider } from "@/components/ui/shared";
import { projects } from "@/lib/data";

export default function Projects() {
  return (
    <section id="projects" className="relative section-padding">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Left column */}
          <div className="lg:col-span-4">
            <SectionHeading
              index="04"
              label="Selected Work"
              title={`${projects.length} Projects / Architectural Deployments.`}
            />
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-neutral-400 text-sm leading-relaxed"
            >
              Full-stack deployments, mobile applications & high-performance
              interfaces — each system built to production scale with precision
              engineering.
            </motion.p>
          </div>
          <div className="lg:col-span-8" />
        </div>

        {/* Project cards */}
        <div className="space-y-6">
          {projects.map((project, i) => {
            const num = String(i + 1).padStart(2, "0");
            const abbr = project.title
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="group p-6 md:p-8 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03] transition-all duration-500"
              >
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                  {/* Number + Abbreviation */}
                  <div className="flex items-start gap-4 shrink-0">
                    <span className="font-display text-4xl md:text-5xl font-bold text-white/10 group-hover:text-white/20 transition-colors leading-none">
                      {num}
                    </span>
                    <div className="w-12 h-12 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
                      <span className="font-mono text-xs font-semibold text-neutral-400">
                        {abbr}
                      </span>
                    </div>
                  </div>

                  {/* Title + badges */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-display text-xl md:text-2xl font-bold text-white">
                        {project.title}
                      </h3>
                      {project.featured && (
                        <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-[0.15em] uppercase border border-white/[0.1] bg-white/[0.04] text-neutral-400">
                          featured
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-[0.15em] uppercase border border-white/[0.06] text-neutral-500">
                        {project.category.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System overview */}
                <div className="mb-6">
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-600 mb-3 block">
                    System_Overview
                  </span>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-3xl">
                    {project.description}
                  </p>
                </div>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-md text-[9px] font-mono tracking-[0.1em] uppercase border border-white/[0.06] bg-white/[0.02] text-neutral-500 hover:border-white/[0.12] hover:text-neutral-400 transition-all duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <GradientDivider />

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <a
                    href="#"
                    className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white text-black font-mono text-[9px] tracking-[0.2em] uppercase overflow-hidden hover:bg-neutral-200 transition-colors duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <ExternalLink size={12} />
                      Initialize Live System
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-white/[0.08] text-neutral-500 font-mono text-[9px] tracking-[0.2em] uppercase hover:border-white/[0.15] hover:text-neutral-300 hover:bg-white/[0.03] transition-all duration-300"
                  >
                    <Github size={12} />
                    Access Source Code
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
