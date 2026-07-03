"use client";

import Background from "./Background";
import SpineLabel from "./SpineLabel";
import ScrollIndicator from "./ScrollIndicator";
import LeftContent from "./LeftContent";
import Portrait from "./Portrait";

/**
 * Hero — main composition. Per spec (Section 2 + 14):
 *   - Two-column asymmetric split (left ≈ 54%, right ≈ 40%, ≈ 6% gutter).
 *   - Section height ≈ 800–820px at 1440px desktop baseline.
 *   - Responsive: stacks at < lg; portrait scales down; spine label hidden < xl;
 *     stats wrap to 2×2 on small.
 *   - Layer order: background → spine → content → portrait → code card →
 *     sparkle → scroll indicator (all per Section 18).
 *
 * The left column carries all the structured content (badge → eyebrow →
 * headline → paragraph → stats → CTAs → socials). The right column carries
 * the portrait visual + floating code card + sparkle. The scroll indicator
 * sits independently at the section bottom, centered.
 */
export default function Hero() {
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden bg-[#08090C]"
      style={{ minHeight: "min(820px, 100vh)" }}
    >
      {/* Layer 1–3: background fill + ambient glow + frame edge-glow */}
      <Background />

      {/* Spine label — outer decorative margin, hidden on small screens */}
      <SpineLabel />

      {/* Main two-column composition */}
      <div className="section-container-hero relative z-10 pt-24 md:pt-28 lg:pt-32 pb-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[640px] lg:min-h-[680px]">
          {/* Left content column — col-span-7 at lg+ */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <LeftContent />
          </div>

          {/* Right portrait column — col-span-5 at lg+, sits above on mobile */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end">
            <Portrait />
          </div>
        </div>
      </div>

      {/* Scroll indicator — independent, bottom-center */}
      <ScrollIndicator />
    </section>
  );
}
