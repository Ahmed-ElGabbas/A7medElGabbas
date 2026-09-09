"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Mail,
  Download,
  ArrowDown,
  MapPin,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { stats } from "@/constants";
import { personalInfo } from "@/data/portfolio";

/* ------------------------------------------------------------------ */
/* Role rotator                                                        */
/* ------------------------------------------------------------------ */
const roles = personalInfo.roles;

function RoleRotator() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % roles.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-9 md:h-11 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[index]}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute font-display text-xl md:text-2xl lg:text-3xl font-bold gold-text tracking-tight"
        >
          {roles[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Social links                                                        */
/* ------------------------------------------------------------------ */
const socials = [
  { icon: Github, href: siteConfig.links.github, label: "GitHub" },
  { icon: Linkedin, href: siteConfig.links.linkedin, label: "LinkedIn" },
  { icon: Twitter, href: siteConfig.links.twitter, label: "Twitter/X" },
  { icon: Facebook, href: siteConfig.links.facebook, label: "Facebook" },
  { icon: Mail, href: `mailto:${siteConfig.links.email}`, label: "Email" },
];

/* ------------------------------------------------------------------ */
/* Main Hero                                                            */
/* ------------------------------------------------------------------ */
export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-24 pb-12"
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-[20%] -left-[15%] w-[70vmax] h-[70vmax] rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-[30%] -right-[10%] w-[60vmax] h-[60vmax] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="section-container relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs tracking-wider text-muted-foreground">
                Available for work
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-3"
            >
              <span className="text-foreground">Ahmed</span>
              <br />
              <span className="gold-text">ElGabbas</span>
            </motion.h1>

            {/* Role rotator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mb-6"
            >
              <RoleRotator />
            </motion.div>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg mb-6"
            >
              Engineering production-grade systems — from cross-platform mobile
              apps to scalable full-stack platforms. Based in Cairo, Egypt
            </motion.p>

            {/* Quick badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-mono text-muted-foreground">
                <Briefcase size={12} className="gold-text" /> 2+ Years
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-mono text-muted-foreground">
                15+ Projects
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-mono text-muted-foreground">
                500+ Problems Solved
              </span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <a
                href="#contact"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "rounded-full px-7 py-3 font-mono text-xs tracking-wider uppercase h-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                )}
              >
                Hire Me
              </a>
              <a
                href="#projects"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full px-7 py-3 border-border font-mono text-xs tracking-wider uppercase h-auto text-muted-foreground hover:text-foreground hover:border-primary/40"
                )}
              >
                View Work
              </a>
              <a
                href="/assets/Ahmed-Mahmoud-Ahmed-Elgabbas-FlowCV-Resume-20241202.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full px-7 py-3 border-primary/40 text-accent font-mono text-xs tracking-wider uppercase h-auto inline-flex items-center hover:bg-primary/10"
                )}
              >
                <Download size={14} className="mr-2" /> Download CV
              </a>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="flex items-center gap-2"
            >
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={s.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  aria-label={s.label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 hover:gold-glow-sm transition-all duration-200"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Profile photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              {/* Gold ring border */}
              <div
                className="absolute -inset-2 rounded-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212,175,55,0.5), rgba(245,215,110,0.15), rgba(212,175,55,0.35))",
                  filter: "blur(1px)",
                }}
              />
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden border-2 border-primary/30 bg-card">
                <Image
                  src="/images/main.jpg"
                  alt="Ahmed ElGabbas — Full-Stack Developer & Mobile Engineer"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                />
              </div>
              {/* Floating accent dot */}
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary/80 animate-float-soft" />
              <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full border-2 border-primary/50 animate-float" />
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="glass-card p-5 text-center"
            >
              <div className="font-display text-3xl md:text-4xl font-bold gold-text">{stat.value}</div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="hidden md:flex flex-col items-center gap-2 mt-16"
        >
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
            Scroll
          </span>
          <ArrowDown size={14} className="text-muted-foreground animate-scroll-dot" />
        </motion.div>
      </div>
    </section>
  );
}
