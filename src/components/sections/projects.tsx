"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Star,
  Layers,
  Smartphone,
  Globe,
  Database,
  ArrowUpRight,
  Code2,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  Project,
  ResolvedSectionMeta,
  SocialLinks,
} from "@/lib/content";

const categoryIcons: Record<string, React.ElementType> = {
  Mobile: Smartphone,
  "Full-Stack": Globe,
  Backend: Database,
  Frontend: Code2,
};

const ALL = "All";

interface ProjectsProps {
  projects: Project[];
  categories: string[];
  links: SocialLinks;
  heading: ResolvedSectionMeta;
}

export default function Projects({ projects, categories, links, heading }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState(ALL);

  // An admin can rename or delete the category of the currently selected tab,
  // which would otherwise leave the grid empty with no way back to "All".
  const filters = [ALL, ...categories];
  const effectiveFilter = filters.includes(activeFilter) ? activeFilter : ALL;

  const filteredProjects =
    effectiveFilter === ALL
      ? projects
      : projects.filter((p) => p.category === effectiveFilter);

  return (
    <section
      id="projects"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Background glow */}
      <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <SectionHeading
        index={heading.index}
        label={heading.label}
        title={heading.title}
        subtitle={heading.subtitle ?? ""}
      />

      {/* Filter Tabs */}
      <div className="mt-10 flex flex-wrap items-center justify-start sm:justify-center gap-2">
        {filters.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            aria-pressed={effectiveFilter === cat}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-200 border cursor-pointer select-none",
              effectiveFilter === cat
                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30 font-semibold"
                : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <motion.div
        layout
        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch"
      >
        <AnimatePresence>
          {filteredProjects.map((project, index) => {
            const CatIcon = categoryIcons[project.category] || Layers;
            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="group"
              >
                <Card className="h-full border-border/70 bg-card/70 hover:bg-card hover:border-primary/60 transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-sm group-hover:shadow-md group-hover:shadow-primary/5">
                  {/* Subtle hover gradient top bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary transition-all duration-500" />

                  <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary bg-primary/5 font-mono text-[11px] gap-1 py-0.5"
                        >
                          <CatIcon size={12} />
                          {project.category}
                        </Badge>

                        {project.featured && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-500 font-medium">
                            <Star size={12} className="fill-amber-500" /> Featured
                          </span>
                        )}
                      </div>

                      {/* Project Title */}
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                        <span>{project.title}</span>
                        <ArrowUpRight
                          size={18}
                          className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0 ml-2"
                        />
                      </h3>

                      {/* Project Description */}
                      <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Bottom Tech Stack & Action Links */}
                    <div className="pt-4 border-t border-border/50 space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-background/80 text-foreground/80 border border-border/60"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <a
                          href={links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "rounded-full px-4 py-1.5 text-xs font-mono border-border/70 hover:border-primary/50 hover:text-primary gap-1.5 h-auto inline-flex items-center"
                          )}
                        >
                          <Github size={13} /> View Code
                        </a>
                        <a
                          href="#contact"
                          className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                        >
                          Discuss project â†’
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* GitHub Callout Strip */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-14 p-6 sm:p-8 rounded-2xl border border-border/80 bg-card/60 flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Github size={24} />
          </div>
          <div>
            <h4 className="font-display font-bold text-lg text-foreground">
              Explore More Repositories on GitHub
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Source code for competitive programming solutions, experimental robotics, and utilities.
            </p>
          </div>
        </div>

        <a
          href={links.github}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default" }),
            "rounded-full px-6 py-2.5 font-mono text-xs tracking-wider uppercase h-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0 inline-flex items-center gap-2"
          )}
        >
          <Github size={14} /> Visit GitHub Profile
        </a>
      </motion.div>
    </section>
  );
}
