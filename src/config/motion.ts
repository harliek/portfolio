/**
 * Single source of truth for motion values (GSAP and the few JS-driven CSS
 * durations). CSS-side durations live in src/styles/tokens.css (--dur-*).
 * Every feature below is disabled or made instant when the site-wide motion
 * preference is "reduce" (src/hooks/useMotionPreference.ts).
 */
export const MOTION = {
  feedback: { duration: 0.15, pressScale: 0.98 },

  /** The Work shelf: fades down from the header while its entries arrive from the Work side. */
  shelf: { durationMs: 220, itemOffsetPx: 16, itemStaggerMs: 14 },

  /** Sticky visual sections: screenshot crossfade and interface highlight. */
  crossfadeMs: 250,
  highlightMs: 220,

  /**
   * Route change. The new page rises 6px while its opacity settles (no
   * blank beat, never a fade to black). On project selection a copy of the
   * clicked cover stays in place until the destination's opening image has
   * decoded, then travels into it (image continuity). Total 300–450ms.
   */
  route: {
    revealMs: 260,
    continuityMs: 280,
    continuityEase: 'power2.inOut',
    /** The cover copy has dissolved after this share of the move… */
    overlayFadeShare: 0.45,
    /** …and the opening image starts to appear at this share (never both at half opacity). */
    heroFadeFrom: 0.4,
    /** Longest wait for the destination image before the copy simply fades. */
    heroWaitMs: 1400,
    fallbackFadeMs: 180,
  },

  /** Pointer trail (fine pointers only; src/components/layout/PointerTrail.tsx). */
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
