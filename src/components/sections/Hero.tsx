"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ChevronDown } from "lucide-react";
import { siteConfig, stats } from "@/lib/data";
import { Ticker, FloatingBadge, MetricCard } from "@/components/ui/shared";

export default function Hero() {
  const firstName = "AHMED";
  const lastName = "ELGABBAS";

  return (
    <section id="home" className="relative min-h-screen flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.015] rounded-full blur-[100px]" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center section-container relative z-10 pt-24 md:pt-32">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left: Vertical name letters */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center gap-1 py-8">
            {firstName.split("").map((letter, i) => (
              <motion.span
                key={`first-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                className="font-display text-lg font-bold text-white/80 leading-none"
              >
                {letter}
              </motion.span>
            ))}
            <div className="w-px h-3 bg-white/20 my-1" />
            {lastName.split("").map((letter, i) => (
              <motion.span
                key={`last-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.04, duration: 0.4 }}
                className="font-display text-lg font-bold text-white/30 leading-none"
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Center: Main hero content */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <FloatingBadge>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-neutral-400">
                  Available for Work
                </span>
                <span className="font-mono text-[10px] text-neutral-600">
                  · Open to new opportunities · 2026
                </span>
              </FloatingBadge>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.9] tracking-tight"
            >
              <span className="block text-white">Full-Stack</span>
              <span className="block text-white">Developer</span>
              <span className="block text-neutral-500 text-stroke mt-1">&</span>
              <span className="block text-white/90">Mobile Engineer</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-neutral-400 text-base md:text-lg max-w-xl leading-relaxed"
            >
              Engineering production-scale systems — from cross-platform mobile apps to
              full-stack web platforms. Every line crafted with precision and intent.
            </motion.p>

            {/* Social buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              className="flex flex-row gap-3"
            >
              {[
                { icon: Github, label: "GitHub", href: siteConfig.links.github },
                { icon: Linkedin, label: "LinkedIn", href: siteConfig.links.linkedin },
                { icon: Mail, label: "Email", href: `mailto:${siteConfig.links.email}` },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-md border border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-300 group"
                >
                  <Icon size={14} className="group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-[10px] tracking-[0.15em] uppercase hidden sm:inline">
                    {label}
                  </span>
                </a>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group relative inline-flex items-center px-8 py-3 bg-white text-black font-mono text-[10px] tracking-[0.25em] uppercase rounded-md overflow-hidden hover:bg-neutral-200 transition-colors duration-300"
              >
                <span className="relative z-10">Hire Me</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </a>
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center px-8 py-3 border border-white/[0.15] text-white font-mono text-[10px] tracking-[0.25em] uppercase rounded-md hover:bg-white/[0.05] hover:border-white/[0.25] transition-all duration-300"
              >
                View Work
              </a>
            </motion.div>
          </div>

          {/* Right: Social links + Scroll indicator */}
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-8">
            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="hidden lg:flex flex-col items-center gap-3"
            >
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-600 [writing-mode:vertical-lr]">
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ChevronDown size={14} className="text-neutral-600" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="section-container pb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-white/[0.06]">
          {stats.map((stat, i) => (
            <MetricCard key={stat.label} value={stat.value} label={stat.label} delay={1.1 + i * 0.1} />
          ))}
        </div>
      </motion.div>

      {/* Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <Ticker />
      </motion.div>
    </section>
  );
}
