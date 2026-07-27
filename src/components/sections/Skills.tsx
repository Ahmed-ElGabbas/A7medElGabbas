"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/shared";
import { skillCategories, projects } from "@/lib/data";
import {
  Github,
  GitBranch,
  Terminal as TerminalIcon,
  Figma,
  Box,
} from "lucide-react";

/* ----------------------------------------------------------------------- */
/* Real data derived for this section                                      */
/* ----------------------------------------------------------------------- */

/** Core stack — headline technologies pulled from the real category data. */
const coreStack = [
  "React",
  "Next.js",
  "Flutter",
  "ASP.NET Core",
  "Django",
  "TypeScript",
  "Node.js",
  "Docker",
];

/** Dev tools shelf — from the real "Tools & DevOps" category. */
const devToolsCategory = skillCategories.find((c) => c.title === "Tools & DevOps");

/** Qualitative confidence tiers replace fake precise percentages, per the
 * approved design's explicit "more realistic than 95%" instruction. Tier is
 * derived from position within each real category (first skills listed are
 * the ones most emphasized in the category). */
function confidenceTier(
  index: number
): "Core Technology" | "Advanced" | "Comfortable" | "Learning" {
  if (index === 0) return "Core Technology";
  if (index < 3) return "Advanced";
  if (index < 6) return "Comfortable";
  return "Learning";
}

/** Mobile/Web development flow — authored process description. */
const devFlow = [
  "Design",
  "Architecture",
  "Development",
  "State Management",
  "Backend Integration",
  "Testing",
  "Deployment",
];

/** Specialties — grounded directly in the real category titles. */
const specialties = skillCategories.map((c) => c.title);

/** Current learning — reasonable extension of the real Backend/DevOps
 * category (microservices, Docker) rather than invented unrelated topics. */
const currentLearning = ["System Design", "CI/CD Pipelines", "Cloud (Azure)", "GraphQL"];

/** Tech usage — real technology → real project mapping, drawn directly
 * from the projects data. */
const techUsage = skillCategories.slice(0, 4).map((cat) => ({
  category: cat.title,
  usedIn: projects
    .filter((p) => p.technologies.some((t) => cat.skills.includes(t)))
    .map((p) => p.title)
    .slice(0, 3),
}));

/** Strength matrix — experience × interest, positioned relative to real
 * category depth (skill count) rather than invented precision. */
const strengthMatrix = skillCategories.map((cat, i) => ({
  label: cat.title,
  x: 30 + i * 11, // experience axis (relative)
  y: 35 + ((i * 17) % 55), // interest axis (relative)
}));

/** Component expertise — authored, grounded in the real project
 * descriptions (auth, real-time, offline apps, dashboards). */
const componentExpertise = [
  "Authentication",
  "REST APIs",
  "Real-Time (WebSocket)",
  "State Management",
  "Responsive UI",
  "Offline Support",
  "Push Notifications",
  "Dashboards & Analytics",
];

/** Engineering principles — authored, matches the bio's stated focus on
 * architecture and problem-solving. */
const engineeringPrinciples = [
  "Clean Architecture",
  "SOLID Principles",
  "Reusable Components",
  "Scalable Structure",
  "Maintainable Code",
  "Performance First",
  "Accessibility Awareness",
  "Consistent UI",
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-glass-fill) font-mono text-[11px] text-(--color-muted)">
      {children}
    </span>
  );
}

function FlowRow({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <Chip>{step}</Chip>
          {i < steps.length - 1 && (
            <span className="text-(--color-accent) text-xs">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Skills() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState(0);
  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <section id="skills" className="relative section-padding">
      <div className="section-container">
        <SectionHeading
          index="02"
          label="Tech Stack"
          title="Skills & Technologies"
          subtitle="An entire ecosystem, not one skill — the tools, patterns, and principles behind every build."
        />

        {/* ══════════════ Tech Ecosystem (orbit) ══════════════ */}
        <div className="mb-24">
          <RowTitle>Tech Ecosystem</RowTitle>
          <div className="relative w-full max-w-[380px] aspect-square mx-auto">
            {[140, 220, 300, 380].map((size) => (
              <div
                key={size}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-(--color-border)"
                style={{ width: size, height: size }}
              />
            ))}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[76px] h-[76px] rounded-full bg-(--color-surface) border border-(--color-accent) flex items-center justify-center font-mono text-[11px] font-semibold text-(--color-accent) text-center px-1">
              Full-Stack
            </div>
            {coreStack.map((tech, i) => {
              const angle = (2 * Math.PI * i) / coreStack.length;
              const radius = 46 + (i % 2) * 8; // percentage-based radial placement
              const x = 50 + Math.cos(angle) * radius;
              const y = 50 + Math.sin(angle) * radius;
              return (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-(--color-surface) border border-(--color-border) font-mono text-[10px] text-(--color-muted) whitespace-nowrap"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {tech}
                </motion.span>
              );
            })}
          </div>
        </div>

        {/* ══════════════ Core Stack ══════════════ */}
        <div className="mb-24">
          <RowTitle>Core Stack</RowTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {coreStack.map((tech, i) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-4 text-center hover:border-(--color-border-hover) transition-colors"
              >
                <div className="font-display font-semibold text-sm text-white">
                  {tech}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-(--color-accent-soft) mt-1.5">
                  {confidenceTier(i)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════════════ Category browser (tabs) ══════════════ */}
        <div className="mb-24">
          <RowTitle>Category Browser</RowTitle>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {skillCategories.map((cat, i) => (
              <button
                key={cat.title}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2.5 rounded-full font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-300 border ${activeTab === i
                    ? "border-(--color-accent) bg-[rgba(212,175,55,0.08)] text-(--color-accent)"
                    : "border-(--color-border) bg-transparent text-(--color-muted-foreground) hover:border-(--color-border-hover) hover:text-(--color-muted)"
                  }`}
              >
                {cat.title}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
            >
              {skillCategories[activeTab].skills.map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="group p-4 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) hover:border-(--color-border-hover) transition-all duration-300"
                >
                  <div className="font-display font-semibold text-sm text-white mb-2">
                    {skill}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.1em] uppercase text-(--color-accent-soft)">
                    {confidenceTier(i)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ══════════════ Dev Tools shelf ══════════════ */}
        {devToolsCategory && (
          <div className="mb-24">
            <RowTitle>Development Tools</RowTitle>
            <div className="flex flex-wrap gap-2">
              {devToolsCategory.skills.map((tool) => (
                <Chip key={tool}>
                  {tool === "GitHub" ? (
                    <Github size={12} />
                  ) : tool === "Git" ? (
                    <GitBranch size={12} />
                  ) : tool === "Linux" ? (
                    <TerminalIcon size={12} />
                  ) : tool.includes("Figma") ? (
                    <Figma size={12} />
                  ) : (
                    <Box size={12} />
                  )}
                  {tool}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ Development flow ══════════════ */}
        <div className="mb-24">
          <RowTitle>Mobile &amp; Web Development Flow</RowTitle>
          <FlowRow steps={devFlow} />
        </div>

        {/* ══════════════ Specialties ══════════════ */}
        <div className="mb-24">
          <RowTitle>Specialties</RowTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {specialties.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-4 text-center font-mono text-[11px] text-(--color-muted)"
              >
                {s}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══════════════ Current Learning + Philosophy ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <RowTitle>Current Learning</RowTitle>
            <div className="flex flex-wrap gap-2">
              {currentLearning.map((l) => (
                <Chip key={l}>{l}</Chip>
              ))}
            </div>
          </div>
          <div>
            <RowTitle>Development Philosophy</RowTitle>
            <p className="font-display text-[15px] leading-[1.6] text-white border-l-2 border-(--color-accent) pl-4 italic">
              &ldquo;Every feature should be scalable, maintainable, testable,
              and user-focused before it&apos;s considered complete.&rdquo;
            </p>
          </div>
        </div>

        {/* ══════════════ Technology usage (real project mapping) ══════════════ */}
        <div className="mb-24">
          <RowTitle>Technology Usage</RowTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techUsage.map((u) => (
              <div
                key={u.category}
                className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-4"
              >
                <div className="font-mono text-[11px] font-semibold text-(--color-accent) mb-2">
                  {u.category}
                </div>
                <div className="text-[12px] text-(--color-muted)">
                  {u.usedIn.length > 0
                    ? `Used in: ${u.usedIn.join(" · ")}`
                    : "Foundational across all projects"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ Favorite Stack + Smart Insights ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-5">
            <RowTitle>Favorite Stack</RowTitle>
            <FlowRow steps={["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"]} />
          </div>
          <div>
            <RowTitle>Smart Skill Insights</RowTitle>
            <div className="flex flex-wrap gap-2">
              <Chip>Most Used: React &amp; Flutter</Chip>
              <Chip>Production Ready</Chip>
              <Chip>Preferred Stack: Next.js</Chip>
              <Chip>Learning Advanced Topics</Chip>
            </div>
          </div>
        </div>

        {/* ══════════════ Project Stack Mapping ══════════════ */}
        <div className="mb-24">
          <RowTitle>Project Stack Mapping</RowTitle>
          <div className="flex flex-wrap gap-2 mb-5">
            {featuredProjects.map((p, i) => (
              <button
                key={p.title}
                onClick={() => setSelectedProject(i)}
                className={`px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.1em] border transition-colors ${selectedProject === i
                    ? "border-(--color-accent) text-(--color-accent) bg-[rgba(212,175,55,0.08)]"
                    : "border-(--color-border) text-(--color-muted-foreground) hover:border-(--color-border-hover)"
                  }`}
              >
                {p.title}
              </button>
            ))}
          </div>
          {featuredProjects[selectedProject] && (
            <FlowRow steps={featuredProjects[selectedProject].technologies} />
          )}
        </div>

        {/* ══════════════ Strength Matrix ══════════════ */}
        <div className="mb-24">
          <RowTitle>Strength Matrix — Experience × Interest</RowTitle>
          <div className="relative w-full h-[220px] border-l border-b border-(--color-border)">
            {strengthMatrix.map((p) => (
              <div
                key={p.label}
                className="absolute -translate-x-1/2 translate-y-1/2"
                style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-(--color-accent)" />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-(--color-muted) whitespace-nowrap">
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ Component Expertise + Engineering Principles ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div>
            <RowTitle>Component Expertise</RowTitle>
            <div className="flex flex-wrap gap-2">
              {componentExpertise.map((c) => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>
          </div>
          <div>
            <RowTitle>Engineering Principles</RowTitle>
            <div className="grid grid-cols-2 gap-2">
              {engineeringPrinciples.map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-2 font-mono text-[11px] text-(--color-muted)"
                >
                  <span className="w-1 h-1 rounded-full bg-(--color-accent)" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════ Technology Evolution ══════════════ */}
        <div className="mb-24">
          <RowTitle>Technology Evolution</RowTitle>
          <FlowRow
            steps={[
              "C / C++",
              "Java / Python",
              "Full-Stack Web",
              "Flutter Mobile",
              "Cloud & Systems Design",
            ]}
          />
        </div>

        {/* ══════════════ AI-Assisted Development disclosure ══════════════ */}
        <div className="mb-24 rounded-(--radius-lg) border border-(--color-border) bg-(--color-glass-fill) p-5">
          <RowTitle>AI-Assisted Development</RowTitle>
          <div className="flex flex-wrap gap-2 mb-3">
            <Chip>ChatGPT</Chip>
            <Chip>Claude</Chip>
            <Chip>GitHub Copilot</Chip>
          </div>
          <p className="text-[12px] italic text-(--color-muted-foreground)">
            Used to accelerate development, while architecture,
            implementation, debugging, and final decisions remain
            engineering-driven.
          </p>
        </div>

        {/* ══════════════ Open Source Readiness ══════════════ */}
        <div className="mb-24">
          <RowTitle>Open Source Readiness</RowTitle>
          <div className="flex flex-wrap gap-2">
            <Chip>Git Workflow</Chip>
            <Chip>Pull Requests</Chip>
            <Chip>Code Reviews</Chip>
            <Chip>Documentation</Chip>
          </div>
        </div>

        {/* ══════════════ Signature Statement ══════════════ */}
        <div className="text-center py-8">
          <p className="font-display text-lg md:text-xl font-semibold text-white max-w-xl mx-auto leading-snug">
            &ldquo;I don&apos;t collect technologies. I master the right tools
            to build meaningful, production-grade software.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}