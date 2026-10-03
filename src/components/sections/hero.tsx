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
  Briefcase,
} from "lucide-react";
import ProfileFrame from "@/components/ui/profile-frame";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SiteConfig, SocialLinks, Stat } from "@/lib/content";

interface HeroProps {
  site: SiteConfig;
  links: SocialLinks;
  stats: Stat[];
}

/* ------------------------------------------------------------------ */
/* Role rotator                                                        */
/* ------------------------------------------------------------------ */
function RoleRotator({ roles }: { roles: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Guard the interval: with zero roles (a cleared admin field) a naive
    // modulo would set state to NaN and render nothing.
    if (roles.length === 0) return;
    const interval = setInterval(() => setIndex((i) => (i + 1) % roles.length), 3000);
    return () => clearInterval(interval);
  }, [roles.length]);

  if (roles.length === 0) return null;

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
/* Main Hero                                                            */
/* ------------------------------------------------------------------ */
export default function Hero({ site, links, stats }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);

  // Built inside the component so the links come from props rather than a
  // module-level snapshot of the static config.
  const socials = [
    { icon: Github, href: links.github, label: "GitHub" },
    { icon: Linkedin, href: links.linkedin, label: "LinkedIn" },
    { icon: Twitter, href: links.twitter, label: "Twitter/X" },
    { icon: Facebook, href: links.facebook, label: "Facebook" },
    { icon: Mail, href: `mailto:${links.email}`, label: "Email" },
  ].filter((s) => Boolean(s.href));

  // The first three stats double as the quick badges. Previously these were
  // hardcoded ("2+ Years", "15+ Projects", "500+ Problems Solved"), which meant
  // editing a stat in the admin left a stale duplicate claim in the Hero.
  const badges = stats.slice(0, 3);

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
                {site.status ?? "Available for work"}
              </span>
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-3"
            >
              {site.firstName ? (
                <span className="text-foreground">{site.firstName}</span>
              ) : (
                <span className="text-foreground">{site.name}</span>
              )}
              {site.firstName && site.lastName ? <br /> : null}
              {site.lastName ? (
                <span className="gold-text">{site.lastName}</span>
              ) : null}
            </motion.h1>

            {/* Role rotator */}
            {site.roles.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mb-6"
              >
                <RoleRotator roles={site.roles} />
              </motion.div>
            ) : null}

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg mb-6"
            >
              {site.headline}
            </motion.p>

            {/* Quick badges, sourced from the stats rows */}
            {badges.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap items-center gap-3 mb-8"
              >
                {badges.map((stat, i) => (
                  <span
                    key={stat.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-mono text-muted-foreground"
                  >
                    {i === 0 ? (
                      <Briefcase size={12} className="gold-text shrink-0" />
                    ) : null}
                    {stat.value} {stat.label}
                  </span>
                ))}
              </motion.div>
            ) : null}

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
              {site.resumeUrl ? (
                <a
                  href={site.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-full px-7 py-3 border-primary/40 text-accent font-mono text-xs tracking-wider uppercase h-auto inline-flex items-center hover:bg-primary/10"
                  )}
                >
                  <Download size={14} className="mr-2" /> Download CV
                </a>
              ) : null}
            </motion.div>

            {/* Social links */}
            {socials.length > 0 ? (
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
            ) : null}
          </motion.div>

          {/* Right — Profile photo */}
          {site.photoUrl ? (
            <div className="relative flex items-center justify-center">
              <ProfileFrame
                imageSrc={site.photoUrl}
                imageAlt={`${site.name} — ${site.title}`}
                name=""
                label=""
              />
            </div>
          ) : null}
        </div>

        {/* Stats strip */}
        {stats.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <div key={stat.id} className="glass-card p-5 text-center">
                <div className="font-display text-3xl md:text-4xl font-bold gold-text">{stat.value}</div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        ) : null}

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