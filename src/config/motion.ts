/**
 * The motion system (spec/motion-plan.md section 2) on the JS side. The CSS
 * side is the same numbers as custom properties in src/styles/tokens.css
 * (--dur-1 to --dur-4, --ease-standard, --ease-respond, --ease-arrive,
 * --ease-exchange). The project opening's own constants live in
 * src/config/transition.ts and use this scale. Every feature is disabled or
 * made instant when the operating system asks for reduced motion
 * (src/hooks/useMotionPreference.ts).
 */

/** The four durations (ms). */
const T = {
  /** Colour, border and background of links and controls; press scale; the reduced-motion fade-out. */
  feedback: 120,
  /** Hover and focus on objects (lift, glow, spill, contact shadow together); text into the accent; nav indicator; Work shelf. */
  respond: 240,
  /** Spatial changes: the cover move, a page change, the Jumpstart phone emphasis, depth-tier light steps. */
  move: 420,
  /** Returns to rest: the wheel boost decaying, the hover slow-down releasing, the About light fading. */
  settle: 800,
} as const

/** The four named curves (CSS), none with overshoot: nothing on the site bounces. */
const EASE = {
  /** Colour, opacity and state changes. */
  standard: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  /** Hover, focus and press responses on objects. */
  respond: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  /** Spatial moves (cover to slot, phone emphasis): front-loaded, no overshoot. */
  arrive: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  /** Cross-fades: a page change, reduced-motion steps. */
  exchange: 'cubic-bezier(0.33, 0, 0.25, 1)',
} as const

export const MOTION = {
  /** Durations (ms) by name: `t.respond` is `--dur-2`. */
  t: T,
  /** The named curves as CSS timing functions (the values of --ease-*). */
  ease: EASE,

  /**
   * Pointer trail (fine pointers only; src/components/layout/PointerTrail.tsx):
   * a crisp luminous core in a soft blue violet glow, attached to the pointer; a long
   * line of light (Harlie's requests, 2026-09-27: longer), gone ~350ms after it
   * stops; dimmer over text, nearly off over forms, fields, controls and video (pointerContext.ts); beneath the
   * page, never over its words (stage.css; Harlie's brief, 2026-09-28); off for touch and reduced motion.
   */
  trail: {
    /** Longest visible trail behind the pointer (px; was 48): the tail is cut there. */
    lengthPx: 120,
    /** Each point lives this long (ms): the tail retracts into the cursor and the trail is gone ~this long after the pointer stops. */
    lifeMs: 320,
    /** The crisp luminous centre line (px at the pointer end). */
    coreWidth: 2.2,
    /** The soft blue violet glow around it (px at the pointer end; drawn in three layers). */
    haloWidth: 14,
    /** Brightness over reading text, and over forms, fields, controls and video (share of full brightness). */
    overText: 0.45,
    overControl: 0.16,
    /** Length over text and controls (share of lengthPx). */
    shortShare: 0.75,
  },
} as const
