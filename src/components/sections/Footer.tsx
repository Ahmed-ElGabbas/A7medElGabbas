"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Facebook } from "lucide-react";
import { siteConfig, navItems } from "@/lib/data";
import { GradientDivider } from "@/components/ui/shared";

const builtWith = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "Lucide Icons",
  "Vercel",
];

export default function Footer() {
  return (
    <footer className="relative border-t border-(--color-border)">
      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16">
          {/* Col 1: Brand + Socials */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 border border-(--color-accent) rounded-(--radius-md) flex items-center justify-center bg-(--color-glass-fill)">
                <span className="font-display font-bold text-sm leading-none text-white">
                  A<br />
                  <span className="text-(--color-accent)">E</span>
                </span>
              </div>
              <div>
                <div className="font-display font-semibold text-sm text-white">
                  {siteConfig.name}
                </div>
                <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-(--color-muted-foreground)">
                  Full-Stack &amp; Mobile Engineer
                </div>
              </div>
            </div>
            <p className="text-(--color-muted-foreground) text-sm leading-relaxed mb-6">
              Crafting production-grade systems with precision. Every line of
              code is intentional, every architecture decision deliberate.
            </p>
            <div className="flex gap-2">
              {[
                { icon: Github, href: siteConfig.links.github, label: "GitHub" },
                { icon: Linkedin, href: siteConfig.links.linkedin, label: "LinkedIn" },
                { icon: Twitter, href: siteConfig.links.twitter, label: "Twitter" },
                { icon: Facebook, href: siteConfig.links.facebook, label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-(--radius-md) border border-(--color-border) bg-(--color-glass-fill) flex items-center justify-center text-(--color-muted-foreground) hover:text-(--color-accent) hover:border-(--color-border-hover) transition-all duration-300"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Col 2: Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-(--color-accent) mb-6">
              Navigation
            </h4>
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="font-mono text-[11px] tracking-[0.15em] uppercase text-(--color-muted-foreground) hover:text-white transition-colors duration-300"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </motion.div>

          {/* Col 3: Built With */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-(--color-accent) mb-6">
              Built With
            </h4>
            <div className="flex flex-col gap-3">
              {builtWith.map((tech) => (
                <div
                  key={tech}
                  className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-(--color-muted-foreground)"
                >
                  <span className="w-1 h-1 rounded-full bg-(--color-accent)" />
                  {tech}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <GradientDivider />

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
        >
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-(--color-muted-foreground)">
            © 2026 {siteConfig.name}. All rights reserved.
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-(--color-muted-foreground)">
            Engineered with precision &amp; intent
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
