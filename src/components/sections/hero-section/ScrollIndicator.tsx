"use client";

import { motion } from "framer-motion";

/**
 * ScrollIndicator — mouse-outline icon + animated dot + "SCROLL DOWN" label,
 * centered at the very bottom of the hero section, independent of the two-column
 * grid above. Per Section 1.10 + Section 8.
 *
 * The internal dot animates with translateY+fade (matches the universal "scroll
 * mouse" convention). The label sits beneath the icon.
 */
export default function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
    >
      {/* Mouse-outline icon */}
      <div className="relative w-[18px] h-[28px] rounded-[10px] border border-faint flex items-start justify-center pt-1.5">
        {/* Animated internal dot */}
        <span className="block w-[3px] h-[6px] rounded-full bg-faint animate-scroll-dot" />
      </div>
      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-faintest">
        Scroll Down
      </span>
    </motion.div>
  );
}
