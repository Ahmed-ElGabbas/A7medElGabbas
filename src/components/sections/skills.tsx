"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  Layout,
  Smartphone,
  Server,
  Database,
  Wrench,
  Check,
  Workflow,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Ticker } from "@/components/ui/ticker";
import { cn } from "@/lib/utils";
import { skillCategories, skillSpotlights, philosophyQuote } from "@/data/portfolio";

const categoryIconMap: Record<string, React.ElementType> = {
  code: Code,
  layout: Layout,
  smartphone: Smartphone,
  server: Server,
  database: Database,
  wrench: Wrench,
};

const categoryDescriptions = skillSpotlights;

export default function Skills() {
  const [activeTab, setActiveTab] = useState(0);
  const currentCategory = skillCategories[activeTab] || skillCategories[0];
  const currentMetadata = categoryDescriptions[currentCategory.title] || {
    summary: "Professional technical expertise refined through production and open-source applications.",
    patterns: ["Best Practices", "Clean Architecture", "Modular Design", "Robust Testing"],
    primaryProject: "Production Systems",
  };

  return (
    <section
      id="skills"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Background decoration */}
      <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <SectionHeading
        index="02"
        label="EXPERTISE"
        title="Technical Stack"
        subtitle="Tools, languages, and frameworks I leverage to engineer performant, reliable software."
      />

      {/* Category selector tabs */}
      <div className="mt-12 flex flex-wrap gap-2 sm:gap-3 justify-start sm:justify-center">
        {skillCategories.map((cat, idx) => {
          const Icon = categoryIconMap[cat.icon] || Code;
          const isActive = idx === activeTab;
          return (
            <button
              key={cat.title}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border cursor-pointer select-none",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                  : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card/80"
              )}
            >
              <Icon size={14} className={isActive ? "text-primary-foreground" : "text-primary"} />
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main interactive panel */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left: Skills Grid */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCategory.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 h-full flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                  <div>
                    <h3 className="text-xl font-display font-bold text-foreground">
                      {currentCategory.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {currentCategory.skills.length} core technologies
                    </p>
                  </div>
                  <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 font-mono text-[11px]">
                    Category {activeTab + 1} of {skillCategories.length}
                  </Badge>
                </div>

                {/* Skills tags/cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentCategory.skills.map((skill) => (
                    <div
                      key={skill}
                      className="group flex items-center justify-between p-3 rounded-xl bg-background/60 border border-border/50 hover:border-primary/50 hover:bg-background transition-all duration-200"
                    >
                      <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {skill}
                      </span>
                      <Check
                        size={14}
                        className="text-primary/40 group-hover:text-primary transition-colors shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom detail note */}
              <div className="mt-8 pt-4 border-t border-border/40 text-xs text-muted-foreground font-mono flex items-center gap-2">
                <Terminal size={14} className="text-primary" />
                <span>Production tested with real-world deployments & testing.</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Stack Spotlight Panel */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCategory.title + "-details"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="p-6 sm:p-8 rounded-2xl bg-card border border-border/70 h-full flex flex-col justify-between shadow-sm space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary mb-3">
                  <Workflow size={14} /> Architecture & Methodology
                </div>
                <h4 className="text-base sm:text-lg font-bold text-foreground mb-3">
                  How I apply this layer
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentMetadata.summary}
                </p>

                {/* Key architectural patterns */}
                <div className="mt-6 space-y-2.5">
                  <span className="text-xs font-mono uppercase tracking-wider text-foreground/80 block">
                    Core Design Patterns:
                  </span>
                  {currentMetadata.patterns.map((pattern, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
                    >
                      <ShieldCheck size={14} className="text-primary shrink-0" />
                      <span>{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Application Showcase */}
              <div className="pt-4 border-t border-border/40">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground block mb-1">
                  Representative Artifact
                </span>
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  {currentMetadata.primaryProject}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Scrolling tech marquee */}
      <div className="mt-12">
        <Ticker />
      </div>

      {/* Engineering Philosophy Quote */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-8 p-6 sm:p-8 rounded-2xl border border-primary/20 bg-primary/[0.02] text-center max-w-3xl mx-auto"
      >
        <blockquote className="text-sm sm:text-base italic text-foreground/90 font-serif leading-relaxed">
          &ldquo;{philosophyQuote.quote}&rdquo;
        </blockquote>
        <div className="mt-3 text-xs font-mono uppercase tracking-widest text-primary">
          — {philosophyQuote.author}
        </div>
      </motion.div>
    </section>
  );
}
