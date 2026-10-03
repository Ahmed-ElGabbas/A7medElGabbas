"use client";

import { motion } from "framer-motion";
import type { TickerSkill } from "@/lib/content";

/**
 * Marquee strip. Takes labels as a prop rather than importing tickerSkills,
 * because the list is now editable from the admin.
 *
 * The list is duplicated so the x animation can loop seamlessly from 0% to -50%.
 */
export function Ticker({ items }: { items: TickerSkill[] }) {
  const labels = items.map((item) => item.label);

  if (labels.length === 0) return null;

  return (
    <div className="w-full overflow-hidden border-t border-b border-border py-4">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          x: { repeat: Infinity, repeatType: "loop", duration: 30, ease: "linear" },
        }}
      >
        {[...labels, ...labels].map((label, i) => (
          <span
            // Half the entries are duplicates of the first half, so the index
            // (not the label) is the only stable key here.
            key={i}
            className="font-mono text-xs tracking-[0.15em] uppercase text-muted-foreground"
          >
            {label}
            <span className="mx-4 text-muted-foreground/40">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}