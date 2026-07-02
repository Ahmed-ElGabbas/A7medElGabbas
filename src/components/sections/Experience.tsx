"use client";

import { motion } from "framer-motion";
import { SectionHeading, GradientDivider } from "@/components/ui/shared";
import { experiences, education } from "@/lib/data";

export default function Experience() {
  return (
    <section id="experience" className="relative section-padding">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left column */}
          <div className="lg:col-span-4">
            <SectionHeading
              index="03"
              label="Background"
              title="Education & Experience"
            />
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-neutral-400 text-sm leading-relaxed"
            >
              Academic foundation and engineering work that defines my
              professional trajectory as a full-stack developer and mobile
              engineer.
            </motion.p>
          </div>

          {/* Right column */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            {/* Education */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-8"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
                  Education / {education.length} Institution
                </span>
              </motion.div>

              {education.map((edu, i) => (
                <motion.div
                  key={edu.degree}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-neutral-500">
                      {edu.period}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-neutral-600 px-2 py-1 rounded border border-white/[0.06] bg-white/[0.02] w-fit">
                      {edu.gpa}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-white text-lg mb-1">
                    {edu.degree}
                  </h3>
                  <p className="font-mono text-[11px] tracking-[0.1em] text-neutral-500 mb-4">
                    {edu.institution}
                  </p>
                  <div className="space-y-2">
                    {[
                      "Specializing in Robotics Software Engineering with focus on Data Structures, Algorithms, OOP, and Database Systems.",
                      "Active member of HR Committee at HNU-FCSIT ICPC Community, organizing events and competitive programming activities.",
                      "Head of Sports Committee at HNU-FCSIT Student Union, managing sports events and building team spirit.",
                      "Solved 500+ algorithmic problems across platforms like Codeforces, LeetCode, and HackerRank.",
                      "Continuously applying academic knowledge through real-world full-stack and mobile development projects.",
                    ].map((point, j) => (
                      <div key={j} className="flex gap-3 text-sm">
                        <span className="font-mono text-[9px] text-neutral-600 mt-1 shrink-0">
                          {String(j + 1).padStart(2, "0")}
                        </span>
                        <span className="text-neutral-400 leading-relaxed">
                          {point}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <GradientDivider />

            {/* Experience */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-8"
              >
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500">
                  Experience / {experiences.length} Roles
                </span>
              </motion.div>

              <div className="space-y-6">
                {experiences.map((exp, i) => (
                  <motion.div
                    key={exp.role}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="p-6 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-300 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-neutral-500">
                        {exp.period}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-emerald-500/60 px-2 py-1 rounded border border-emerald-500/20 bg-emerald-500/5 w-fit">
                        Currently Active
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-white text-lg mb-1">
                      {exp.role}
                    </h3>
                    <p className="font-mono text-[11px] tracking-[0.1em] text-neutral-500 mb-4">
                      {exp.company}
                    </p>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                      {exp.description}
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-md text-[9px] font-mono tracking-[0.1em] uppercase border border-white/[0.06] bg-white/[0.02] text-neutral-500 group-hover:border-white/[0.1] transition-all"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
