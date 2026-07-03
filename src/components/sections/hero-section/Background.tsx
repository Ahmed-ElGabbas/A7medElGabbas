/**
 * Background — base fill, ambient teal-charcoal radial glow, and the tighter
 * frame edge-glow that hugs the portrait frame.
 *
 * Per spec Section 3:
 *   - Layer 1 base fill: #08090C solid
 *   - Layer 2 ambient glow: radial gradient, ~700x700 ellipse, centered ~78% / 45%,
 *     color #1B2628 → #0A0C0F
 *   - Layer 3 frame edge-glow: tighter, brighter teal blob hugging the frame border
 *
 * All three layers are absolutely positioned, pointer-events-none, sit at z-0.
 * Frame edge-glow sits just above the ambient glow.
 */
export default function Background() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Layer 1 — base fill */}
      <div className="absolute inset-0 bg-[#08090C]" />

      {/* Layer 2 — ambient glow. Radial teal-charcoal field, centered around
          the portrait column. Uses background-blend to layer two stops. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 700px 700px at 78% 45%, #1B2628 0%, #0A0C0F 65%, #08090C 100%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Subtle secondary glow lower-left, balancing composition */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 500px 400px at 12% 85%, rgba(31, 190, 162, 0.05) 0%, transparent 65%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Layer 3 — frame edge-glow. Tighter, brighter blob hugging the portrait
          frame. Slightly offset to mimic the implied light source behind-right. */}
      <div
        className="absolute"
        style={{
          right: "8%",
          top: "14%",
          width: "520px",
          height: "660px",
          background:
            "radial-gradient(ellipse at center, rgba(63, 203, 176, 0.22) 0%, rgba(31, 190, 162, 0.08) 40%, transparent 70%)",
          filter: "blur(30px)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
}
