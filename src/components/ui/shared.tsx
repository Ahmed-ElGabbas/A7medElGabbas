"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function SectionHeading({
  index,
  label,
  title,
  subtitle,
}: {
  index: string;
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-16 md:mb-20">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-mono text-[11px] tracking-[0.25em] uppercase text-(--color-accent) mb-6"
      >
        {index} {"//"} {label}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-neutral-400 text-base md:text-lg max-w-2xl leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export function GradientDivider() {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="gradient-line w-full origin-left"
    />
  );
}

export function ParallaxText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <motion.div ref={ref} style={{ x }} className={className}>
      <span className="text-stroke font-display text-[8rem] md:text-[12rem] lg:text-[16rem] font-extrabold uppercase whitespace-nowrap select-none opacity-[0.04]">
        {children}
      </span>
    </motion.div>
  );
}

export function Ticker() {
  const skills = [
    "React.js",
    "Next.js",
    "Flutter",
    "ASP.NET Core",
    "TypeScript",
    "Node.js",
    "Clean Architecture",
    "Full-Stack Developer",
    "Mobile Engineer",
    "Python",
    "Django",
    "MongoDB",
    "PostgreSQL",
    "Docker",
  ];

  return (
    <div className="w-full overflow-hidden border-t border-b border-white/[0.06] py-4">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" },
        }}
      >
        {[...skills, ...skills].map((skill, i) => (
          <span
            key={i}
            className="font-mono text-[11px] tracking-[0.15em] uppercase text-neutral-500"
          >
            {skill}
            <span className="mx-4 text-neutral-700">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function FloatingBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-(--color-border) bg-(--color-glass-fill) backdrop-blur-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function TechBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-md text-[10px] font-mono tracking-[0.1em] uppercase border border-(--color-border) bg-(--color-glass-fill) text-(--color-muted) hover:border-(--color-border-hover) hover:text-(--color-accent) transition-all duration-300">
      {label}
    </span>
  );
}

export function MetricCard({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center md:text-left"
    >
      <div className="text-3xl md:text-4xl font-display font-bold text-(--color-accent) mb-1">
        {value}
      </div>
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-(--color-muted-foreground)">
        {label}
      </div>
    </motion.div>
  );
}