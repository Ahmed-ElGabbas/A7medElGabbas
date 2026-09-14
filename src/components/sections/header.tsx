"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, Github, Linkedin, Mail, Rocket } from "lucide-react";
import Image from "next/image";
import { navItems } from "@/config/site";
import { useScrollspy } from "@/hooks/use-scrollspy";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { Button } from "@/components/ui/button";

type Theme = "dark" | "light";

const THEME_KEY = "theme";
const DEFAULT_THEME: Theme = "dark";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, () => DEFAULT_THEME);

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
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    try { window.localStorage.setItem(THEME_KEY, next); } catch { /* noop */ }
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.classList.toggle("light", next === "light");
    window.dispatchEvent(new Event("storage"));
  };

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
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[110] bg-transparent">
        <div
          className="h-full transition-[width] duration-150 ease-out"
          style={{
            width: `${scrollProgress}%`,
            background: `linear-gradient(90deg, var(--color-accent-gold), var(--color-accent-gold-soft))`,
            boxShadow: "0 0 12px rgba(212,175,55,0.5)",
          }}
        />
      </div>

      {/* Section dot rail — desktop only */}
      <div className="hidden xl:flex fixed right-7 top-1/2 -translate-y-1/2 z-50 flex-col gap-3.5">
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
                background: isActive ? "var(--color-accent-gold)" : "hsl(var(--muted-foreground) / 0.3)",
                boxShadow: isActive ? "0 0 0 4px rgba(212,175,55,0.15)" : "none",
              }}
            >
              <span className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 md:px-8">
        <motion.div
          initial={false}
          animate={isScrolled ? {
            backdropFilter: "blur(20px)",
            backgroundColor: "hsl(var(--card) / 0.85)",
            borderColor: "var(--color-accent)",
            boxShadow: "var(--shadow-lg)",
          } : {
            backdropFilter: "blur(0px)",
            backgroundColor: "transparent",
            borderColor: "transparent",
            boxShadow: "none",
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4 py-3 px-4 md:px-6 mt-2 rounded-2xl border border-transparent"
        >
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); scrollToSection("#home"); }}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border group-hover:border-primary/30 transition-all duration-300 overflow-hidden">
              <Image
                src="/images/logo.png"
                alt="Ahmed ElGabbas logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display font-bold text-lg md:text-xl leading-none text-foreground">
              Ahmed<span className="gold-text">ElGabbas</span>
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
                  onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                  className={`relative px-3.5 py-2 rounded-lg font-sans text-sm transition-colors duration-200 ${
                    isActive ? "gold-text" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-lg bg-primary/8 border border-primary/20"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              className="rounded-full w-9 h-9"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                  <motion.span key="sun" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                    <Sun size={15} />
                  </motion.span>
                ) : (
                  <motion.span key="moon" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                    <Moon size={15} />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            <Button
              variant="outline"
              onClick={() => scrollToSection("#contact")}
              className="hidden md:inline-flex rounded-full border-primary/40 gold-text hover:bg-primary/8 text-xs tracking-wider uppercase"
            >
              Resume
            </Button>

            <Button
              ref={toggleRef}
              variant="outline"
              size="icon"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden rounded-full w-9 h-9"
              aria-label="Toggle menu"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X size={17} /> : <Menu size={17} />}
            </Button>
          </div>
        </motion.div>
      </header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-2xl lg:hidden flex flex-col justify-center px-10 gap-5"
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
                  onClick={(e) => { e.preventDefault(); scrollToSection(item.href); }}
                  className={`font-display text-3xl font-semibold transition-colors duration-200 ${
                    isActive ? "gold-text" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </motion.a>
              );
            })}
            <div className="absolute bottom-8 left-10 right-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a href="https://github.com/Elagbbas" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Github size={18} /></a>
                <a href="https://www.linkedin.com/in/ahmed-elgabbas-33a186344" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin size={18} /></a>
                <a href="mailto:ahmedelgabbas769@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors"><Mail size={18} /></a>
              </div>
              <Button variant="outline" onClick={() => scrollToSection("#contact")} className="rounded-full border-primary/40 gold-text text-xs">Resume</Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Back to top */}
      <BackToTop />
    </>
  );
}

function BackToTop() {
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
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center bg-card border border-primary/40 gold-text hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
        >
          <Rocket size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
