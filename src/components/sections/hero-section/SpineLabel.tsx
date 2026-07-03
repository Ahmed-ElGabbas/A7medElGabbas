"use client";

import { motion } from "framer-motion";
import { spineLetters } from "./data";

/**
 * Spine label — vertical "AHMED ELGABBAS" text + 1px vertical line + teal dot,
 * placed in the outer decorative margin (≈ 20px from the viewport edge).
 *
 * Per Section 1.1: stacked monospace glyphs, NOT a literal rotate(-90deg) string
 * (each glyph reads upright). The "writing-mode: vertical-rl" approach is also
 * ruled out because it would tip the letters on their sides.
 *
 * Per Section 2: sits ~20px from the true viewport edge, in the outer margin
 * distinct from the content margin. Hidden on small screens.
 */
export default function SpineLabel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="hidden xl:flex absolute left-5 top-1/2 -translate-y-1/2 z-10 flex-col items-center gap-1 select-none"
      aria-hidden
    >
      {spineLetters.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: 0.7 + i * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="font-mono text-[10px] font-medium tracking-[0.18em] uppercase text-faint leading-[1.4]"
        >
          {letter}
        </motion.span>
      ))}
      <div className="w-px h-3 bg-divider my-1" />
      <div className="w-1.5 h-1.5 rounded-full bg-primary-bright shadow-glow-teal-soft" />
    </motion.div>
  );
}
