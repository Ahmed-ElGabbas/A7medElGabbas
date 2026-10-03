"use client";

import { ArrowUp, Github, Linkedin, Twitter, Facebook, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { SiteConfig, SocialLinks } from "@/lib/content";

export interface NavLink {
  label: string;
  href: string;
}

interface FooterProps {
  site: SiteConfig;
  links: SocialLinks;
  navItems: NavLink[];
}

/**
 * Footer content is sourced from the API rather than hardcoded. The previous
 * version repeated the name, tagline, location and links inline, which is
 * exactly what BACKEND_PLAN.md §10 flags as a duplicated source of truth.
 */
export default function Footer({ site, links, navItems }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socials = [
    { icon: Github, href: links.github, label: "GitHub" },
    { icon: Linkedin, href: links.linkedin, label: "LinkedIn" },
    { icon: Twitter, href: links.twitter, label: "Twitter" },
    { icon: Facebook, href: links.facebook, label: "Facebook" },
    { icon: Mail, href: `mailto:${links.email}`, label: "Email" },
  ].filter((s) => Boolean(s.href));

  const firstName = site.firstName ?? site.name;
  const lastName = site.lastName ?? "";

  return (
    <footer className="relative border-t border-border/70 bg-card/60 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left branding col-span-6 */}
          <div className="md:col-span-6 space-y-4">
            <a href="#home" className="inline-block group">
              <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                {firstName} {lastName && <span className="text-primary">{lastName}</span>}
              </span>
            </a>
            {site.headline ? (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
                {site.headline}
              </p>
            ) : null}
            {socials.length > 0 ? (
              <div className="flex items-center gap-2 pt-2">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto") ? undefined : "_blank"}
                    rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    aria-label={label}
                    className="w-9 h-9 rounded-lg border border-border/70 bg-background/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-200"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* Navigation Links col-span-3 */}
          {navItems.length > 0 ? (
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
                Navigation
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="hover:text-primary transition-colors hover:translate-x-0.5 inline-block duration-150"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Quick contact / Back to top col-span-3 */}
          <div className="md:col-span-3 space-y-4 md:text-right">
            <h4 className="text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
              Get in Touch
            </h4>
            {site.location ? (
              <p className="text-xs text-muted-foreground">
                {site.location}
                {site.statusSubtext ? ` • ${site.statusSubtext}` : ""}
              </p>
            ) : null}
            {links.email ? (
              <a
                href={`mailto:${links.email}`}
                className="text-xs font-mono text-primary hover:underline block"
              >
                {links.email}
              </a>
            ) : null}

            <div className="pt-2 md:flex md:justify-end">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/80 bg-background text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200 cursor-pointer shadow-sm"
              >
                Back to top <ArrowUp size={13} className="text-primary" />
              </button>
            </div>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </div>
          {site.location ? (
            <div className="text-[11px] text-muted-foreground/70">{site.location}</div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}