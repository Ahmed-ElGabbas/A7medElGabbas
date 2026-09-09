"use client";

import { ArrowUp, Github, Linkedin, Twitter, Facebook, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { siteConfig, navItems } from "@/config/site";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border/70 bg-card/60 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left branding col-span-6 */}
          <div className="md:col-span-6 space-y-4">
            <a href="#home" className="inline-block group">
              <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                Ahmed <span className="text-primary">ElGabbas</span>
              </span>
            </a>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              Full-Stack Software Engineer & Mobile Application Developer specializing in Flutter,
              Next.js, and robotics software architectures. Building performant, user-centric systems.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {[
                { icon: Github, href: siteConfig.links.github, label: "GitHub" },
                { icon: Linkedin, href: siteConfig.links.linkedin, label: "LinkedIn" },
                { icon: Twitter, href: siteConfig.links.twitter, label: "Twitter" },
                { icon: Facebook, href: siteConfig.links.facebook, label: "Facebook" },
                { icon: Mail, href: `mailto:${siteConfig.links.email}`, label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-border/70 bg-background/80 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links col-span-3 */}
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

          {/* Quick contact / Back to top col-span-3 */}
          <div className="md:col-span-3 space-y-4 md:text-right">
            <h4 className="text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
              Get in Touch
            </h4>
            <p className="text-xs text-muted-foreground">
              Cairo, Egypt • Available globally
            </p>
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="text-xs font-mono text-primary hover:underline block"
            >
              {siteConfig.links.email}
            </a>

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
            © {new Date().getFullYear()} Ahmed ElGabbas. All rights reserved.
          </div>
          <div className="text-[11px] text-muted-foreground/70">
            Cairo, Egypt
          </div>
        </div>
      </div>
    </footer>
  );
}
