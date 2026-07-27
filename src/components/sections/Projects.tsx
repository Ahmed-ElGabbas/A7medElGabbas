"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import { SectionHeading, GradientDivider } from "@/components/ui/shared";
import { projects, siteConfig } from "@/lib/data";

/* ----------------------------------------------------------------------- */
/* Real data derived for this section                                      */
/* ----------------------------------------------------------------------- */

/**
 * Category filter — built from the real `category` values already present
 * on every project in lib/data.ts (Mobile, Full-Stack, Backend, Frontend).
 */
const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category)))];

/* ----------------------------------------------------------------------- */
/* Small building blocks                                                   */
/* ----------------------------------------------------------------------- */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-md text-[9px] font-mono tracking-[0.1em] uppercase border border-(--color-border) bg-(--color-glass-fill) text-(--color-muted) hover:border-(--color-border-hover) hover:text-(--color-accent-soft) transition-all duration-300">
      {children}
    </span>
  );
}

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects =
    activeCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="projects" className="relative section-padding">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-12">
          {/* Left column */}
          <div className="lg:col-span-4">
            <SectionHeading
              index="04"
              label="My Work"
              title={`${projects.length} Featured Projects`}
            />
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-(--color-muted) text-sm leading-relaxed"
            >
              Full-stack platforms, mobile applications & backend systems —
              each built to production scale with precision engineering.
            </motion.p>
          </div>
          <div className="lg:col-span-8" />
        </div>

        {/* ══════════════ Project filter ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-300 border ${activeCategory === cat
                ? "border-(--color-accent) bg-[rgba(212,175,55,0.08)] text-(--color-accent)"
                : "border-(--color-border) bg-transparent text-(--color-muted-foreground) hover:border-(--color-border-hover) hover:text-(--color-muted)"
                }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* ══════════════ Project cards ══════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {filteredProjects.map((project, i) => {
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
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group p-6 md:p-8 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) hover:border-(--color-border-hover) transition-all duration-500"
                >
                  {/* Header row */}
                  <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                    {/* Number + Abbreviation */}
                    <div className="flex items-start gap-4 shrink-0">
                      <span className="font-display text-4xl md:text-5xl font-bold text-white/10 group-hover:text-(--color-accent)/20 transition-colors leading-none">
                        {num}
                      </span>
                      <div className="w-12 h-12 rounded-(--radius-md) border border-(--color-border) bg-(--color-surface) flex items-center justify-center">
                        <span className="font-mono text-xs font-semibold text-(--color-accent-soft)">
                          {abbr}
                        </span>
                      </div>
                    </div>

                    {/* Title + badges + status */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-display text-xl md:text-2xl font-bold text-white">
                          {project.title}
                        </h3>
                        {project.featured && (
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-[0.15em] uppercase border border-(--color-accent) text-(--color-accent) bg-[rgba(212,175,55,0.08)]">
                            featured
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[8px] font-mono tracking-[0.15em] uppercase border border-(--color-border) text-(--color-muted-foreground)">
                          {project.category.toLowerCase()}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-(--color-muted-foreground)">
                        <span className="w-1.5 h-1.5 rounded-full bg-(--color-accent)" />
                        Completed
                      </div>
                    </div>
                  </div>

                  {/* Project story / overview */}
                  <div className="mb-6">
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-(--color-muted-foreground) mb-3 block">
                      Overview
                    </span>
                    <p className="text-(--color-muted) text-sm leading-relaxed max-w-3xl">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech stack */}
                  <div className="mb-6">
                    <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-(--color-muted-foreground) mb-3 block">
                      Tech Stack
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <Chip key={tech}>{tech}</Chip>
                      ))}
                    </div>
                  </div>

                  <GradientDivider />

                  {/* Action buttons — only the profile GitHub is a real,
                      verifiable link; no per-project demo/repo URLs exist
                      yet in the data, so none are fabricated here. */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <a
                      href={siteConfig.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-(--color-accent) text-(--color-accent) font-mono text-[9px] tracking-[0.2em] uppercase hover:bg-[rgba(212,175,55,0.08)] hover:text-(--color-accent-hover) hover:border-(--color-accent-hover) transition-all duration-300"
                    >
                      <Github size={12} />
                      View Source Code
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* ══════════════ GitHub CTA banner ══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-8 md:p-10 text-center"
        >
          <div className="font-display text-xl md:text-2xl font-bold text-white mb-5">
            Want to Explore More? Visit My GitHub.
          </div>

          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-(--color-accent) text-(--color-accent) font-mono text-[11px] tracking-[0.14em] uppercase hover:bg-[rgba(212,175,55,0.08)] hover:text-(--color-accent-hover) hover:border-(--color-accent-hover) transition-all duration-300"
          >
            <ExternalLink size={14} />
            Visit GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}