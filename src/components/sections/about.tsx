"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Download,
  Mail,
  Award,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveQuickFactIcon } from "@/lib/content-icons";
import type {
  AboutContent,
  ResolvedSectionMeta,
  SiteConfig,
  Stat,
} from "@/lib/content";

interface AboutProps {
  about: AboutContent;
  stats: Stat[];
  site: SiteConfig;
  heading: ResolvedSectionMeta;
}

export default function About({ about, stats, site, heading }: AboutProps) {
  return (
    <section
      id="about"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/4 blur-3xl pointer-events-none" />

      <SectionHeading
        index={heading.index}
        label={heading.label}
        title={heading.title}
        subtitle={heading.subtitle ?? undefined}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mt-12">
        {/* Left column: Narrative & Bio */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="relative p-6 sm:p-8 rounded-2xl bg-card border border-border/70 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2 rounded-lg bg-primary/10 text-primary">
                <Code2 size={20} />
              </span>
              <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                Software Engineer & Problem Solver
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-display font-bold tracking-tight mb-4 text-foreground">
              {about.narrativeTitle}
            </h3>

            <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
              {about.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* Bullet points */}
            <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {about.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90">
                  <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3 pt-4 border-t border-border/40">
              {site.resumeUrl ? (
                <a
                  href={site.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "rounded-full px-6 py-2.5 font-mono text-xs tracking-wider uppercase h-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                  )}
                >
                  <Download size={14} className="mr-2" /> Download Resume
                </a>
              ) : null}
              <a
                href="#contact"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full px-6 py-2.5 border-border font-mono text-xs tracking-wider uppercase h-auto text-muted-foreground hover:text-foreground hover:border-primary/40"
                )}
              >
                <Mail size={14} className="mr-2" /> Contact Me
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right column: Quick facts & Photo preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-5 space-y-5"
        >
          {/* Visual card */}
          <div className="relative rounded-2xl overflow-hidden bg-card border border-border/70 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-4">
              {site.photoUrl ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-primary/30 shadow-inner">
                  <Image
                    src={site.photoUrl}
                    alt={site.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div>
                <Badge
                  variant="outline"
                  className="mb-1.5 border-primary/40 text-primary bg-primary/10 text-[10px] font-mono uppercase tracking-wider"
                >
                  Software Engineer
                </Badge>
                <h4 className="font-display font-bold text-lg sm:text-xl text-foreground">
                  {site.name}
                </h4>
                {site.location ? (
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {site.location}
                  </p>
                ) : null}
                {site.statusSubtext ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono text-emerald-500 font-medium">
                      {site.statusSubtext}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Quick facts 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {about.quickFacts.map((fact) => {
              // Keyed on the row's own icon key rather than its position: the old
              // positional array gave the wrong glyph as soon as a fact was
              // reordered or removed in the admin.
              const Icon = resolveQuickFactIcon(fact.icon);
              return (
                <Card
                  key={fact.id}
                  className="p-4 border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 transition-all duration-300"
                >
                  <CardContent className="p-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                        {fact.label}
                      </span>
                      <Icon size={14} className="text-primary shrink-0" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">
                      {fact.value}
                    </p>
                    {fact.detail ? (
                      <p className="text-xs text-muted-foreground">
                        {fact.detail}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Education Highlight Card */}
          {about.academicFocusTitle || about.academicFocusDescription ? (
            <div className="p-5 rounded-xl border border-primary/20 bg-primary/[0.03] space-y-2">
              <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
                <Award size={14} /> Academic Focus
              </div>
              {about.academicFocusTitle ? (
                <p className="text-sm text-foreground font-medium">
                  {about.academicFocusTitle}
                </p>
              ) : null}
              {about.academicFocusDescription ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {about.academicFocusDescription}
                </p>
              ) : null}
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* Bottom stats horizontal bar */}
      {stats.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="p-4 sm:p-6 rounded-xl bg-card/40 border border-border/50 text-center hover:border-primary/30 transition-all duration-300"
            >
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                <span className="text-primary">{stat.value}</span>
              </div>
              <div className="text-xs sm:text-sm font-mono text-muted-foreground mt-1 tracking-wider uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      ) : null}
    </section>
  );
}