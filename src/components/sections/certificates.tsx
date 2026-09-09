"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  ShieldCheck,
  ExternalLink,
  Smartphone,
  Globe,
  Database,
  Terminal,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  FileCheck2,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  certificates,
  certificateStats,
  issuingOrganizations,
  Certificate,
} from "@/data/portfolio";

const categories = [
  "All",
  "Mobile & Flutter",
  "Web & Frontend",
  "Backend & APIs",
  "Algorithms & AI",
] as const;

const categoryIcons: Record<string, React.ElementType> = {
  All: Sparkles,
  "Mobile & Flutter": Smartphone,
  "Web & Frontend": Globe,
  "Backend & APIs": Database,
  "Algorithms & AI": Terminal,
};

const issuerIcons: Record<string, React.ElementType> = {
  "Mobile & Flutter": Smartphone,
  "Web & Frontend": Globe,
  "Backend & APIs": Database,
  "Algorithms & AI": Terminal,
};

export default function Certificates() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredCertificates =
    activeCategory === "All"
      ? certificates
      : certificates.filter((c) => c.category === activeCategory);

  return (
    <section
      id="certificates"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <SectionHeading
        index="05"
        label="CREDENTIALS"
        title="Licenses & Certifications"
        subtitle="Verified technical credentials, specialized engineering tracks, and algorithmic problem-solving qualifications."
      />

      {/* Category Filter Tabs */}
      <div className="mt-10 flex flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-3">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat] || Sparkles;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border cursor-pointer select-none",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/30"
                  : "bg-card/80 border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card"
              )}
            >
              <Icon
                size={14}
                className={isActive ? "text-primary-foreground" : "text-primary"}
              />
              <span>{cat}</span>
              {cat === "All" && (
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {certificates.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Certificates Grid */}
      <motion.div
        layout
        className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch"
      >
        <AnimatePresence mode="popLayout">
          {filteredCertificates.map((cert: Certificate, index: number) => {
            const Icon = issuerIcons[cert.category] || Award;
            const isFeatured = cert.featured;

            return (
              <motion.div
                key={cert.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.96 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="h-full flex"
              >
                <Card
                  className={cn(
                    "h-full w-full border-border/70 bg-card/70 hover:bg-card transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 shadow-sm group hover:-translate-y-1",
                    isFeatured
                      ? "border-primary/50 shadow-primary/5 ring-1 ring-primary/20 hover:border-primary/70"
                      : "hover:border-primary/40"
                  )}
                >
                  <CardContent className="p-0 flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Top Row: Icon + Badge */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300",
                            isFeatured
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                          )}
                        >
                          <Icon size={22} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="border-primary/30 text-primary bg-primary/5 font-mono text-[11px] px-2.5 py-0.5"
                          >
                            {cert.badgeText}
                          </Badge>
                        </div>
                      </div>

                      {/* Title & Issuer */}
                      <h3 className="text-lg sm:text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors mb-1.5 leading-snug">
                        {cert.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-primary font-medium mb-3">
                        <span className="flex items-center gap-1">
                          <FileCheck2 size={13} className="shrink-0" />
                          {cert.issuer}
                        </span>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar size={12} className="shrink-0" />
                          {cert.issueDate}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                        {cert.description}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {cert.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-0.5 rounded-md bg-secondary/80 border border-border/50 text-foreground/80 font-mono text-[10px] tracking-wide"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer: Credential ID & Verification Link */}
                    <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] truncate">
                        <CheckCircle2
                          size={13}
                          className="text-primary shrink-0"
                        />
                        <span className="truncate">ID: {cert.credentialId}</span>
                      </div>

                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline hover:opacity-80 transition-opacity shrink-0 group/link"
                        >
                          Verify
                          <ExternalLink
                            size={12}
                            className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                          />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Metrics Plaque */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-14 p-6 sm:p-8 rounded-2xl bg-card border border-border/70 shadow-sm"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border/40">
          {certificateStats.map((stat, sIdx) => (
            <div
              key={sIdx}
              className={cn("space-y-1", sIdx > 0 ? "pt-4 md:pt-0" : "")}
            >
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                <span className="text-primary">{stat.value}</span>
              </div>
              <div className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground/90">
                {stat.label}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Issuing Authorities Row */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono text-muted-foreground">
        <span className="uppercase tracking-widest text-[10px] text-primary mr-2 flex items-center gap-1">
          <ShieldCheck size={13} /> Accredited Issuers:
        </span>
        {issuingOrganizations.map((org) => (
          <span
            key={org}
            className="px-3 py-1 rounded-full bg-background border border-border/60 text-foreground/80 text-[11px] hover:border-primary/40 transition-colors"
          >
            {org}
          </span>
        ))}
      </div>
    </section>
  );
}
