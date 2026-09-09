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
