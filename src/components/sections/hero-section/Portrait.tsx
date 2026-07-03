"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { codeCardHeader, codeCardLines, type CodeToken } from "./data";

/**
 * Portrait — the right column of the Hero. Composes the portrait frame, the
 * floating code card overlapping its bottom-left, and a small decorative
 * sparkle just outside the frame's bottom-right corner.
 *
 * Per spec:
 *   - PortraitFrame: ~460–480 × 620–640, 3:4 ratio, 28–32px radius,
 *     1.5–2px teal border @ ~60–70% opacity, teal glow + neutral grounding.
 *   - CodeCard: glass widget ~330–350 × 150–160, radius 12–14px, header label,
 *     3 traffic-light dots, 4–5 lines of syntax-highlighted JS object.
 *   - DecorativeSparkle: small diamond glyph just outside the frame's BR corner.
 *
 * Since the project does not ship an actual portrait photo, the frame contains
 * a stylized placeholder (gradient + initials + soft silhouette cue) so the
 * composition reads as "photo here" without faking a real photo.
 */

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

function CodeLine({ tokens, lineIndex }: { tokens: CodeToken[]; lineIndex: number }) {
  const colorFor = (kind: CodeToken["kind"]) => {
    switch (kind) {
      case "keyword":
        return "text-[#7da9d8]"; // code-keyword
      case "key":
        return "text-[#d19a6a]"; // code-key
      case "string":
        return "text-[#8fd19e]"; // code-string
      case "punct":
        return "text-[#c7c8ca]"; // code-punct
      default:
        return "text-[#dcddde]";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.85 + lineIndex * 0.08,
        ease: easeOutExpo,
      }}
      className="font-mono text-[11px] md:text-[12px] leading-[1.7] whitespace-pre"
    >
      {tokens.map((tok, i) => (
        <span key={i} className={colorFor(tok.kind)}>
          {tok.text}
        </span>
      ))}
    </motion.div>
  );
}

function CodeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.75, ease: easeOutExpo }}
      className="absolute -bottom-6 -left-6 lg:-left-10 z-20 w-[300px] md:w-[330px] lg:w-[350px] rounded-[14px] border border-border-hero/40 shadow-card-soft overflow-hidden"
      style={{
        background: "rgba(16, 20, 22, 0.88)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <span className="block w-[10px] h-[10px] rounded-full bg-traffic-red" />
          <span className="block w-[10px] h-[10px] rounded-full bg-traffic-yellow" />
          <span className="block w-[10px] h-[10px] rounded-full bg-traffic-green" />
        </div>
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-faint">
          {codeCardHeader}
        </span>
      </div>
      {/* Code block */}
      <div className="px-5 py-4 flex flex-col gap-0">
        {codeCardLines.map((tokens, i) => (
          <CodeLine key={i} tokens={tokens} lineIndex={i} />
        ))}
      </div>
    </motion.div>
  );
}

function DecorativeSparkle() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.5, delay: 1.0, ease: easeOutExpo }}
      className="absolute -bottom-3 -right-3 lg:-right-5 z-30 text-primary-bright"
      style={{ filter: "drop-shadow(0 0 10px rgba(63, 203, 176, 0.5))" }}
      aria-hidden
    >
      <Sparkles size={20} strokeWidth={1.5} />
    </motion.div>
  );
}

function PortraitPlaceholder() {
  // Stylized placeholder since no actual portrait photo is shipped.
  // Uses gradient + subject initials to suggest "photo here" honestly.
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] lg:rounded-[32px]">
      {/* Dark studio background with subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, #1a2326 0%, #0d1012 55%, #08090c 100%)",
        }}
      />
      {/* Soft rim-light cue (matches external frame edge-glow direction) */}
      <div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(63, 203, 176, 0.08) 70%, rgba(63, 203, 176, 0.18) 100%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Subject silhouette cue: large soft oval suggesting head/shoulders */}
      <div
        className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[58%] aspect-square rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(31, 190, 162, 0.12) 0%, rgba(20, 28, 30, 0.4) 50%, transparent 70%)",
        }}
      />
      {/* Subject initials — large, low-opacity monogram */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display font-extrabold leading-none select-none"
          style={{
            fontSize: "clamp(120px, 16vw, 220px)",
            color: "rgba(92, 93, 96, 0.18)",
            letterSpacing: "-0.04em",
          }}
        >
          AE
        </span>
      </div>
      {/* Subtle bottom darkening for grounding */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(8, 9, 12, 0.6) 100%)",
        }}
      />
    </div>
  );
}

export default function Portrait() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto lg:mx-0">
      {/* === Portrait frame === */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.25, ease: easeOutExpo }}
        className="relative aspect-[3/4] w-full animate-float-soft"
        style={{
          borderRadius: "30px",
        }}
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-2 lg:-inset-3 rounded-[36px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(63, 203, 176, 0.28) 0%, rgba(31, 190, 162, 0.10) 50%, transparent 75%)",
            filter: "blur(20px)",
          }}
          aria-hidden
        />
        {/* Border + frame */}
        <div
          className="relative w-full h-full overflow-hidden shadow-drop-soft"
          style={{
            borderRadius: "30px",
            border: "1.5px solid rgba(63, 203, 176, 0.65)",
            boxShadow:
              "0 0 0 1px rgba(63, 203, 176, 0.15), 0 0 50px rgba(63, 203, 176, 0.22)",
          }}
        >
          <PortraitPlaceholder />
        </div>
      </motion.div>

      {/* === Floating code card (overlaps bottom-left) === */}
      <CodeCard />

      {/* === Decorative sparkle (outside bottom-right corner) === */}
      <DecorativeSparkle />
    </div>
  );
}
