"use client";

import { useEffect, useState, useCallback } from "react";

export function useScrollspy(ids: string[], offset = 100) {
  const [activeId, setActiveId] = useState<string>("");

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + offset;

    for (let i = ids.length - 1; i >= 0; i--) {
      const element = document.getElementById(ids[i]);
      if (element && element.offsetTop <= scrollPosition) {
        setActiveId(ids[i]);
        return;
      }
    }
    setActiveId(ids[0] || "");
  }, [ids, offset]);

  useEffect(() => {
    queueMicrotask(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return activeId;
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    setProgress(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    queueMicrotask(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  return progress;
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      queueMicrotask(() => setMatches(media.matches));
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return position;
}