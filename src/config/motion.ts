/**
 * Motion values for the shell (the few JS-driven durations). CSS-side
 * durations live in src/styles/tokens.css (--dur-*); the carousel's in
 * src/config/carousel.ts; the shared-image route transition's in
 * src/config/transition.ts. Every feature is disabled or made instant when
 * the operating system asks for reduced motion (src/hooks/useMotionPreference.ts).
 */
export const MOTION = {
  /** The Work shelf: fades down from the header while its entries arrive from the Work side. */
  shelf: { durationMs: 220, itemOffsetPx: 16, itemStaggerMs: 14 },

  /** Sticky visual sections: screenshot crossfade and interface highlight. */
  crossfadeMs: 250,
  highlightMs: 220,

  /**
   * Pointer trail (fine pointers only; src/components/layout/PointerTrail.tsx):
   * a crisp luminous core in a soft lavender glow, short, attached to the
   * pointer, gone ~200ms after it stops; dimmer over text, nearly off over
   * controls and video; off for touch and reduced motion.
   */
  trail: {
    /** Longest visible trail behind the pointer (px); the tail is cut, never a long streak. */
    lengthPx: 48,
    /** Each point lives this long (ms): the tail retracts into the cursor and the trail is gone ~this long after the pointer stops. */
    lifeMs: 150,
    /** The crisp luminous centre line (px at the pointer end). */
    coreWidth: 2.2,
    /** The soft violet glow around it (px at the pointer end; drawn in three layers). */
    haloWidth: 14,
    /** Brightness over reading text, and over controls and video (share of full brightness). */
    overText: 0.45,
    overControl: 0.16,
    /** Length over text and controls (share of lengthPx). */
    shortShare: 0.6,
  },

} as const
