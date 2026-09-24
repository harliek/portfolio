/**
 * Single source of truth for motion values (GSAP and the few JS-driven CSS
 * durations). CSS-side durations live in src/styles/tokens.css (--dur-*).
 * Every feature below is disabled or made instant when the site-wide motion
 * preference is "reduce" (src/hooks/useMotionPreference.ts).
 */
export const MOTION = {
  feedback: { duration: 0.15, pressScale: 0.98 },

  /** The Work shelf: the Work control shifts left while the shelf reveals horizontally. */
  shelf: { durationMs: 250, workShiftPx: 6, itemOffsetPx: 28, itemStaggerMs: 16 },

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

  /** Pointer trail (fine pointers only). */
  trail: {
    /** Visible length of the line behind the pointer (px). */
    lengthPx: 34,
    /** The line fades out this long after the pointer stops (ms). */
    fadeMs: 190,
    coreWidth: 1.2,
    haloWidth: 7,
    /** Brightness over text (share of full brightness). */
    overText: 0.4,
  },
} as const
