"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Github, Linkedin, Mail, Rocket } from "lucide-react";
import Image from "next/image";
import { navItems } from "@/lib/data";
import { useScrollspy, useScrollProgress } from "@/hooks/use-scroll";
import logoImage from "@/assets/images/logo.png";

type Theme = "dark" | "light";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const sectionIds = navItems.map((item) => item.href.replace("#", ""));
  const activeId = useScrollspy(sectionIds, 150);
  const scrollProgress = useScrollProgress();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Theme bootstrap — runs once after mount, reads localStorage set by
  // the inline script in layout.tsx, syncs local state without causing
  // hydration mismatches (the inline script ensures <html> classes match
  // before React paints).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      }
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage unavailable */
    }
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.classList.toggle("light", next === "light");
  };

  // Esc closes the mobile menu and returns focus to the toggle.
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isMobileOpen]);

  const scrollToSection = (href: string) => {
    setIsMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Scroll progress bar — gold gradient, pinned to the very top edge */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[110] bg-transparent">
        <div
          className="h-full bg-linear-to-r from-(--color-accent) to-(--color-accent-soft) shadow-[0_0_12px_rgba(212,175,55,0.5)] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Section dot rail — desktop only, right edge */}
      <div className="hidden xl:flex fixed right-7 top-1/2 -translate-y-1/2 z-90 flex-col gap-3.5">
        {navItems.map((item) => {
          const id = item.href.replace("#", "");
          const isActive = activeId === id;
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => scrollToSection(item.href)}
              aria-label={`Go to ${item.label}`}
              className="group relative w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: isActive
                  ? "var(--color-accent)"
                  : "var(--color-border-hover)",
                boxShadow: isActive
                  ? "0 0 0 4px rgba(212,175,55,0.15)"
                  : "none",
              }}
            >
              <span className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] text-(--color-muted-foreground) opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 md:px-12"
      >
        <div
          className={`w-full flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isScrolled
            ? "max-w-[1100px] px-8 h-[76px] rounded-full bg-(--color-glass-fill-strong) backdrop-blur-xl border border-(--color-border-hover) shadow-(--shadow-2)"
            : "max-w-[1200px] px-10 h-[76px] rounded-full bg-transparent border border-transparent"
            }`}
        >
          {/* Logo + Wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#home");
            }}
            className="flex items-center gap-5 group"
          >
            <div className="w-15 h-15 rounded-md flex items-center justify-center bg-(--color-glass-fill) border border-(--color-border) group-hover:border-(--color-border-hover) transition-all duration-300 overflow-hidden">
              <Image
                src={logoImage.src}
                alt="Ahmed ElGabbas logo"
                width={46}
                height={46}
                className="w-full h-full object-contain"
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className="font-display font-bold text-[20px] md:text-[34px] leading-none text-white">
              Ahmed<span className="text-(--color-accent)">ElGabbas</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeId === item.href.replace("#", "");
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className={`relative px-6 py-2.5 rounded-full font-sans text-[17px] transition-colors duration-200 ${isActive
                    ? "text-(--color-accent)"
                    : "text-(--color-muted) hover:text-white"
                    }`}
                  style={{ marginLeft: 6, marginRight: 6 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "rgba(212,175,55,0.08)",
                        border: "1px solid rgba(212,175,55,0.25)",
                      }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Theme toggle + Resume + Mobile toggle */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                mounted
                  ? `Switch to ${theme === "dark" ? "light" : "dark"} mode`
                  : "Toggle theme"
              }
              aria-pressed={mounted ? theme === "dark" : undefined}
              className="w-11 h-11 rounded-full flex items-center justify-center border border-(--color-border) bg-(--color-glass-fill) text-(--color-muted) hover:text-(--color-accent) hover:border-(--color-border-hover) hover:-translate-y-0.5 transition-all duration-200"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mounted && theme === "dark" ? (
                  <motion.span
                    key="sun"
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-flex"
                  >
                    <Sun size={15} />
                  </motion.span>
                ) : mounted && theme === "light" ? (
                  <motion.span
                    key="moon"
                    initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="inline-flex"
                  >
                    <Moon size={15} />
                  </motion.span>
                ) : (
                  <Moon size={15} />
                )}
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("#contact")}
              className="hidden md:inline-flex items-center px-6 py-3 rounded-full border border-(--color-accent) font-sans text-[15px] font-semibold text-(--color-accent) hover:bg-[rgba(212,175,55,0.08)] hover:text-(--color-accent-hover) hover:border-(--color-accent-hover) transition-all duration-200"
              style={{ marginLeft: 8 }}
            >
              Resume
            </button>

            <button
              ref={toggleRef}
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center border border-(--color-border) bg-(--color-glass-fill) text-white hover:border-(--color-border-hover) transition-all duration-200"
              aria-label="Toggle menu"
              aria-expanded={isMobileOpen}
              aria-controls="mobile-nav"
            >
              {isMobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div >
      </motion.header >

      {/* Mobile — fullscreen glass overlay menu */}
      <AnimatePresence>
        {
          isMobileOpen && (
            <motion.nav
              id="mobile-nav"
              aria-modal="true"
              role="dialog"
              aria-label="Mobile navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-100 bg-(--color-background)/85 backdrop-blur-2xl lg:hidden flex flex-col justify-center px-10 gap-6"
            >
              {navItems.map((item, i) => {
                const isActive = activeId === item.href.replace("#", "");
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.href);
                    }}
                    className={`font-display text-3xl font-semibold transition-colors duration-200 ${isActive ? "text-(--color-accent)" : "text-(--color-muted) hover:text-white"
                      }`}
                  >
                    {item.label}
                  </motion.a>
                );
              })}

              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                <div className="flex items-center gap-3.5">

                  <a
                    href="https://github.com/Elagbbas"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className="text-(--color-muted) hover:text-(--color-accent) transition-colors"
                  >
                    <Github size={18} />
                  </a>

                  <a
                    href="https://www.linkedin.com/in/ahmed-elgabbas-33a186344"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-(--color-muted) hover:text-(--color-accent) transition-colors"
                  >
                    <Linkedin size={18} />
                  </a>

                  <a
                    href="mailto:ahmedelgabbas769@gmail.com"
                    aria-label="Email"
                    className="text-(--color-muted) hover:text-(--color-accent) transition-colors"
                  >
                    <Mail size={18} />
                  </a>
                </div >
                <button
                  type="button"
                  onClick={() => scrollToSection("#contact")}
                  className="px-5 py-5 rounded-full border border-(--color-accent) font-sans text-[12px] font-semibold text-(--color-accent)"
                >
                  Resume
                </button>
              </div >
            </motion.nav >
          )
        }
      </AnimatePresence >
    </>
  );
}

/**
 * Back-to-top control (rocket icon per the approved design).
 * Exported alongside Header so page.tsx / Footer can mount it once,
 * globally, without duplicating the fixed-position button per section.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 z-90 w-13 h-13 rounded-full flex items-center justify-center bg-(--color-surface) border border-(--color-accent) text-(--color-accent) hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all duration-200"
        >
          <Rocket size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}