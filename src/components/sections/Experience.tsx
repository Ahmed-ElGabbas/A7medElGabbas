"use client";

import { motion } from "framer-motion";
import { SectionHeading, GradientDivider } from "@/components/ui/shared";
import { experiences, education, recognitions } from "@/lib/data";

/* ----------------------------------------------------------------------- */
/* Real data derived for this section                                      */
/* ----------------------------------------------------------------------- */

/** Roadmap spine — real chronology built from education + experiences +
 * recognitions, not invented milestones. */
const journeyChapters = [
  { icon: "🎓", title: "University", note: "Helwan National University · FCAI" },
  { icon: "🖥️", title: "Backend Developer", note: "ASP.NET Core & Django" },
  { icon: "📱", title: "Mobile Developer", note: "Flutter & Dart" },
  { icon: "🌐", title: "Full-Stack Developer", note: "React & Next.js" },
  { icon: "👥", title: "Leadership", note: "ICPC HR · Student Union" },
  { icon: "🏆", title: "Competitive Programming", note: "500+ Problems Solved" },
];

/** Milestone counter — a real count of concrete, verifiable milestones
 * (no fabricated target denominator). */
const milestoneCount = 1 /* university */ + experiences.length + recognitions.length;

/** Learning timeline — authored technology-evolution narrative, matching
 * the real experience descriptions (backend → mobile → full-stack). */
const learningTimeline = [
  "C / C++",
  "Python",
  "Backend Systems",
  "Mobile (Flutter)",
  "Full-Stack Web",
  "AI & Robotics",
];

/** Timeline highlights — quick-read bullets grounded in real data. */
const timelineHighlights = [
  "🎓 Helwan National University",
  "💻 3 Active Development Roles",
  "👥 ICPC & Student Union Leadership",
  "🏆 500+ Problems Solved",
];

/** Learning tree — branches from real skill categories. */
const learningBranches = ["Frontend", "Mobile", "Backend", "Databases", "DevOps"];

/** Experience map — how the real pieces connect. */
const experienceMap = ["Education", "Experience", "Leadership", "Skills", "Projects"];

/** Current roadmap / what's next — extension of Skills' real "Current
 * Learning" set, framed forward-looking here. */
const whatsNext = ["System Design", "Cloud (Azure)", "CI/CD Pipelines", "Open Source"];

const progressToGoals: {
  label: string;
  status: "In Progress" | "Learning" | "Planned";
}[] = [
    { label: "System Design", status: "In Progress" },
    { label: "Cloud & Azure", status: "Learning" },
    { label: "Open Source Contributions", status: "Planned" },
    { label: "Senior-Level Systems", status: "Planned" },
  ];

/* ----------------------------------------------------------------------- */
/* Small building blocks                                                   */
/* ----------------------------------------------------------------------- */

function RowTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] font-semibold text-(--color-muted-foreground) uppercase tracking-[0.12em] mb-5">
      {children}
    </div>
  );
}

function FlowRow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[11px] text-(--color-muted)">
            {step}
          </span>
          {i < steps.length - 1 && (
            <span className="text-(--color-accent) text-xs">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Experience() {
  return (
    <section id="journey" className="relative section-padding">
      <div className="section-container">
        <SectionHeading
          index="03"
          label="My Journey"
          title="Education & Professional Journey"
          subtitle="A story of growth — from first lines of code to production systems, leadership, and continuous learning."
        />

        {/* ══════════════ Roadmap spine ══════════════ */}
        <div className="mb-24">
          <div className="relative flex overflow-x-auto pb-2">
            <div
              className="absolute top-[27px] left-0 right-0 h-px"
              style={{ background: "var(--color-border)" }}
            />
            {journeyChapters.map((chapter, i) => (
              <motion.div
                key={chapter.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex-1 min-w-[140px] text-center px-2"
              >
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center bg-(--color-surface) border border-(--color-accent) text-xl"
                  style={{ boxShadow: "0 0 0 4px rgba(212,175,55,0.1)" }}
                >
                  {chapter.icon}
                </div>
                <div className="font-display text-sm font-semibold text-white">
                  {chapter.title}
                </div>
                <div className="font-mono text-[10px] text-(--color-muted-foreground) mt-1">
                  {chapter.note}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left column — supporting panels */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            <div>
              <RowTitle>Milestone Counter</RowTitle>
              <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-6 text-center">
                <div className="font-display text-4xl font-bold text-(--color-accent)">
                  {milestoneCount}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-(--color-muted-foreground) mt-2">
                  Milestones Reached
                </div>
              </div>
            </div>

            <div>
              <RowTitle>Timeline Highlights</RowTitle>
              <ul className="space-y-2.5">
                {timelineHighlights.map((h) => (
                  <li key={h} className="font-mono text-[12px] text-(--color-muted)">
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <RowTitle>Achievement Wall</RowTitle>
              <div className="grid grid-cols-1 gap-3">
                {recognitions.map((r) => (
                  <div
                    key={r.title}
                    className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-4"
                  >
                    <div className="font-display font-semibold text-sm text-white">
                      {r.title}
                    </div>
                    <div className="font-mono text-[10px] text-(--color-accent-soft) mt-0.5 mb-2">
                      {r.organization}
                    </div>
                    <div className="text-[12px] text-(--color-muted) leading-relaxed">
                      {r.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — education + experience */}
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
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-(--color-muted-foreground)">
                  Education / {education.length} Institution
                </span>
              </motion.div>

              {education.map((edu) => (
                <motion.div
                  key={edu.degree}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="p-6 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) hover:border-(--color-border-hover) transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-(--color-muted-foreground)">
                      {edu.period}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-(--color-accent-soft) px-2 py-1 rounded border border-(--color-border) bg-(--color-surface) w-fit">
                      {edu.gpa}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-white text-lg mb-1">
                    {edu.degree}
                  </h3>
                  <p className="font-mono text-[11px] tracking-[0.1em] text-(--color-muted-foreground) mb-4">
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
                        <span className="font-mono text-[9px] text-(--color-muted-foreground) mt-1 shrink-0">
                          {String(j + 1).padStart(2, "0")}
                        </span>
                        <span className="text-(--color-muted) leading-relaxed">
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
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-(--color-muted-foreground)">
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
                    className="p-6 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) hover:border-(--color-border-hover) transition-all duration-300 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-(--color-muted-foreground)">
                        {exp.period}
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-(--color-accent) px-2 py-1 rounded border border-(--color-accent) bg-[rgba(212,175,55,0.06)] w-fit">
                        Currently Active
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-white text-lg mb-1">
                      {exp.role}
                    </h3>
                    <p className="font-mono text-[11px] tracking-[0.1em] text-(--color-muted-foreground) mb-4">
                      {exp.company}
                    </p>
                    <p className="text-(--color-muted) text-sm leading-relaxed mb-4">
                      {exp.description}
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-md text-[9px] font-mono tracking-[0.1em] uppercase border border-(--color-border) bg-(--color-glass-fill) text-(--color-muted) group-hover:border-(--color-border-hover) transition-all"
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

        {/* ══════════════ Learning Timeline ══════════════ */}
        <div className="mt-24 mb-24">
          <RowTitle>Learning Timeline</RowTitle>
          <FlowRow steps={learningTimeline} />
        </div>

        {/* ══════════════ Learning Tree + Experience Map ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-5">
            <RowTitle>Learning Tree</RowTitle>
            <div className="font-mono text-[12px] text-(--color-accent) mb-3">
              → Programming Fundamentals
            </div>
            <div className="flex flex-wrap gap-2 pl-4 border-l border-(--color-border)">
              {learningBranches.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-surface) font-mono text-[11px] text-(--color-muted)"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
          <div>
            <RowTitle>Experience Map</RowTitle>
            <FlowRow steps={experienceMap} />
          </div>
        </div>

        {/* ══════════════ Current Roadmap + Progress to Goals ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <RowTitle>What&apos;s Next</RowTitle>
            <div className="flex flex-wrap gap-2">
              {whatsNext.map((n) => (
                <span
                  key={n}
                  className="px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[11px] text-(--color-muted)"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
          <div>
            <RowTitle>Progress to Goals</RowTitle>
            <div className="flex flex-wrap gap-2">
              {progressToGoals.map((g) => (
                <span
                  key={g.label}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[11px] text-(--color-muted)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-(--color-accent)" />
                  {g.label} — {g.status}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════ Future Goals Board ══════════════ */}
        <div className="mb-24 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-6 text-center">
          <RowTitle>Future Goals</RowTitle>
          <p className="font-mono text-[13px] md:text-[14px] text-(--color-accent-soft)">
            2027: Graduate FCAI → Advance Cloud &amp; System Design → Senior
            Full-Stack / Mobile Engineer
          </p>
        </div>

        {/* ══════════════ Philosophy ══════════════ */}
        <div className="text-center py-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-(--color-accent) mb-4">
            Learning Never Stops
          </div>
          <p className="font-display text-lg md:text-xl font-semibold text-white max-w-xl mx-auto leading-snug italic">
            &ldquo;Every project, every challenge, and every mistake is an
            opportunity to become a better engineer.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}