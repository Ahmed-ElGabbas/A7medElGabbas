"use client";

import { motion } from "framer-motion";
import { tickerSkills } from "@/data/portfolio";

export function Ticker() {
  const skills = tickerSkills;

  return (
    <div className="w-full overflow-hidden border-t border-b border-border py-4">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" },
        }}
      >
        {[...skills, ...skills].map((skill, i) => (
          <span
            key={i}
            className="font-mono text-xs tracking-[0.15em] uppercase text-muted-foreground"
          >
            {skill}
            <span className="mx-4 text-muted-foreground/40">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
