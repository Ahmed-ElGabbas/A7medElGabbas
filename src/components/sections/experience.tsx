"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  Calendar,
  Rocket,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { experiences, education, futureGoals } from "@/data/portfolio";

export default function Experience() {
  return (
    <section
      id="experience"
      className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <SectionHeading
        index="03"
        label="CAREER"
        title="Experience & Education"
        subtitle="Chronological track of engineering projects, specialized development tracks, and academic foundations."
      />

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Practical Experience Timeline (col-span-7) */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Briefcase size={18} />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground">
              Development Experience
            </h3>
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-primary/20 space-y-10 ml-3 sm:ml-4">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.role + index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Timeline node dot */}
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-card border-2 border-primary group-hover:bg-primary group-hover:scale-125 transition-all duration-300 shadow-sm shadow-primary/40" />

                <Card className="border-border/70 bg-card shadow-sm hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-5 sm:p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="border-primary/40 text-primary bg-primary/5 font-mono text-[11px]"
                      >
                        <Calendar size={12} className="mr-1" />
                        {exp.period}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                        <Building2 size={13} className="text-primary/70" />
                        {exp.company}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {exp.role}
                    </h4>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-background/80 text-foreground/80 border border-border/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Education & Next Frontiers (col-span-5) */}
        <div className="lg:col-span-5 space-y-10">
          {/* Education Block */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <GraduationCap size={18} />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">
                Academic Background
              </h3>
            </div>

            {education.map((edu, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-border/70 bg-card p-6 shadow-sm hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="border-primary/40 text-primary bg-primary/5 font-mono text-[11px]"
                      >
                        {edu.period}
                      </Badge>
                      <span className="text-xs font-mono text-emerald-500 font-medium">
                        {edu.gpa}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-foreground">
                      {edu.degree}
                    </h4>

                    <p className="text-xs sm:text-sm font-medium text-primary">
                      {edu.institution}
                    </p>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {edu.description}
                    </p>

                    <div className="pt-3 border-t border-border/40 space-y-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                        Key Studies
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Robotics Software",
                          "Algorithms & Data Structures",
                          "Distributed Systems",
                          "Computer Vision",
                          "Object-Oriented Design",
                          "Database Architectures",
                        ].map((course) => (
                          <span
                            key={course}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted/60 text-muted-foreground border border-border/40"
                          >
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Separator className="bg-border/60" />

          {/* Future Aspirations Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-primary/30 bg-primary/[0.02] p-6 shadow-sm">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center gap-2 text-primary text-xs font-mono uppercase tracking-wider">
                  <Rocket size={15} /> Next Frontiers & Focus
                </div>
                <h4 className="text-base font-bold text-foreground">
                  {futureGoals.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {futureGoals.description}
                </p>

                <div className="pt-2 space-y-1.5">
                  {futureGoals.items.map((goal, gIdx) => (
                    <div
                      key={gIdx}
                      className="flex items-center gap-2 text-xs text-foreground/80 font-medium"
                    >
                      <CheckCircle2 size={13} className="text-primary shrink-0" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
