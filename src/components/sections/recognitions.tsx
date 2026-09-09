"use client";

import { motion } from "framer-motion";
import {
  Users,
  Award,
  Flame,
  CheckCircle2,
  Medal,
  HeartHandshake,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { recognitions, achievementStats, affiliations } from "@/data/portfolio";

const recognitionIcons: Record<string, React.ElementType> = {
  "ICPC Community Member": Users,
  "Student Union Leader": Award,
  "Problem Solver": Flame,
};

export default function Recognitions() {
  return (
    <section
      id="recognitions"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Background glow */}
      <div className="absolute bottom-1/3 left-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <SectionHeading
        index="05"
        label="ACHIEVEMENTS"
        title="Recognitions & Community"
        subtitle="Competitive programming milestones, leadership responsibilities, and peer mentoring."
      />

      {/* Main Recognitions Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {recognitions.map((item, index) => {
          const Icon = recognitionIcons[item.title] || Medal;
          const badgeText = item.badgeText || "Honors";
          const isFeatured = item.title === "Problem Solver";

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <Card
                className={`h-full border-border/70 bg-card/70 hover:bg-card transition-all duration-300 flex flex-col justify-between p-6 sm:p-7 shadow-sm ${
                  isFeatured
                    ? "border-primary/50 shadow-primary/5 ring-1 ring-primary/20"
                    : "hover:border-primary/40"
                }`}
              >
                <CardContent className="p-0 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isFeatured
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Icon size={22} />
                      </div>
                      <Badge
                        variant="outline"
                        className="border-primary/30 text-primary bg-primary/5 font-mono text-[11px]"
                      >
                        {badgeText}
                      </Badge>
                    </div>

                    <h3 className="text-lg sm:text-xl font-display font-bold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono text-primary font-medium mb-3">
                      {item.organization}
                    </p>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/40 flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <CheckCircle2 size={13} className="text-primary shrink-0" />
                    <span>Active engagement & contribution</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Metric Plaque */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12 p-6 sm:p-8 rounded-2xl bg-card border border-border/70 shadow-sm"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {achievementStats.map((stat, sIdx) => (
            <div key={sIdx} className="space-y-1">
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

      {/* Communities Row */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono text-muted-foreground">
        <span className="uppercase tracking-widest text-[10px] text-primary mr-2 flex items-center gap-1">
          <HeartHandshake size={13} /> Affiliations:
        </span>
        {affiliations.map((affil) => (
          <span
            key={affil}
            className="px-3 py-1 rounded-full bg-background border border-border/60 text-foreground/80 text-[11px]"
          >
            {affil}
          </span>
        ))}
      </div>
    </section>
  );
}
