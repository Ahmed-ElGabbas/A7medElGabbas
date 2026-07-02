"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Twitter, Facebook } from "lucide-react";
import { siteConfig, navItems } from "@/lib/data";
import { GradientDivider } from "@/components/ui/shared";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16">
          {/* Col 1: Philosophy + Socials */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 border border-white/[0.15] rounded-md flex items-center justify-center bg-white/[0.03]">
                <span className="font-display font-bold text-sm leading-none">
                  A<br />
                  <span className="text-neutral-400">E</span>
                </span>
              </div>
              <div>
                <div className="font-display font-semibold text-sm text-white">
                  Ahmed ElGabbas
                </div>
                <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-neutral-500">
                  Full-Stack Engineer
                </div>
              </div>
            </div>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
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
                  className="w-9 h-9 rounded-md border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-neutral-500 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.04] transition-all duration-300"
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
            <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500 mb-6">
              Navigation
            </h4>
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="font-mono text-[11px] tracking-[0.15em] uppercase text-neutral-600 hover:text-white transition-colors duration-300"
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
            <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-neutral-500 mb-6">
              Built With
            </h4>
            <div className="flex flex-col gap-3">
              {[
                "Next.js",
                "TypeScript",
                "Tailwind CSS",
                "Framer Motion",
                "Lucide Icons",
                "Vercel",
              ].map((tech) => (
                <div
                  key={tech}
                  className="flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-neutral-600"
                >
                  <span className="w-1 h-1 rounded-full bg-neutral-700" />
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
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-700">
            © 2026 Ahmed ElGabbas. All rights reserved.
          </span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-neutral-700">
            Engineered with precision & intent
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
