"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { navItems } from "@/lib/data";
import { useScrollspy } from "@/hooks/use-scroll";

type Theme = "dark" | "light";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const activeId = useScrollspy(
    navItems.map((item) => item.href.replace("#", "")),
    150
  );

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
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
    // mounted flag is the standard hydration-safe pattern for
    // localStorage-backed UI: SSR cannot know the stored theme, so we
    // render a stable default first and update after hydration.
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

  const handleNavClick = (href: string) => {
    setIsMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleContactClick = () => {
    setIsMobileOpen(false);
    const el = document.querySelector("#contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo + Name */}
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("#home");
              }}
              className="flex items-center gap-3 group"
            >
              <div className="w-11 h-11 border border-white/[0.15] rounded-md flex items-center justify-center bg-white/[0.03] group-hover:border-white/[0.3] transition-all duration-300">
                <svg
                  viewBox="0 0 40 40"
                  className="w-7 h-7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 32 L13 8 L20 32 M9.5 24 L16.5 24"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M30 12 C25 12, 22 16, 22 21 C22 27, 26 32, 31 32 C34 32, 36 30, 36 27"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M27 21 L36 21"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <div className="font-bold uppercase tracking-[0.35em] text-sm text-white">
                  Ahmed ElGabbas
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="w-5 h-px bg-white opacity-40" />
                  <span className="text-[10px] uppercase tracking-[0.150em] text-white/50 font-medium">
                    // software engineer //
                  </span>
                </div>
              </div>
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
                      handleNavClick(item.href);
                    }}
                    className={`relative px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase transition-all duration-300 ${
                      isActive
                        ? "text-white"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-2 right-2 h-px bg-white/40"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Contact Button + Theme Toggle + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleContactClick}
                className="hidden md:inline-flex items-center px-5 py-2 rounded-md border border-white/[0.12] bg-transparent font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-300 hover:bg-white/[0.05] hover:border-white/[0.25] hover:text-white transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Contact</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  mounted
                    ? `Switch to ${theme === "dark" ? "light" : "dark"} mode`
                    : "Toggle theme"
                }
                aria-pressed={mounted ? theme === "dark" : undefined}
                className="w-10 h-10 flex items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-white hover:border-white/[0.25] transition-all duration-300"
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
                      <Sun size={16} />
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
                      <Moon size={16} />
                    </motion.span>
                  ) : (
                    <Moon size={16} />
                  )}
                </AnimatePresence>
              </button>

              <button
                ref={toggleRef}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-md border border-white/[0.1] bg-white/[0.03] text-white hover:bg-white/[0.06] transition-all duration-300"
                aria-label="Toggle menu"
                aria-expanded={isMobileOpen}
                aria-controls="mobile-nav"
              >
                {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.nav
              id="mobile-nav"
              aria-modal="true"
              role="dialog"
              aria-label="Mobile navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 right-0 bottom-0 w-[300px] z-50 bg-[#0a0a0a] border-l border-white/[0.06] p-8 pt-24 flex flex-col gap-2 lg:hidden"
            >
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                  className={`px-4 py-3 rounded-lg font-mono text-[12px] tracking-[0.2em] uppercase transition-all duration-300 ${
                    activeId === item.href.replace("#", "")
                      ? "text-white bg-white/[0.05] border border-white/[0.1]"
                      : "text-neutral-500 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {item.label}
                </motion.a>
              ))}

              <div className="mt-auto pt-6 border-t border-white/[0.06] flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleContactClick}
                  className="block w-full text-center px-4 py-3 rounded-md border border-white/[0.12] font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-300 hover:bg-white/[0.05] transition-all"
                >
                  Contact
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md border border-white/[0.1] bg-white/[0.03] font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-300 hover:bg-white/[0.06] transition-all"
                >
                  {mounted && theme === "dark" ? (
                    <>
                      <Sun size={14} /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon size={14} /> Dark Mode
                    </>
                  )}
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
