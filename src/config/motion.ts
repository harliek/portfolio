/**
 * The motion system (spec/motion-plan.md section 2) on the JS side. The CSS
 * side is the same numbers as custom properties in src/styles/tokens.css
 * (--dur-1 to --dur-4, --ease-standard, --ease-respond, --ease-arrive,
 * --ease-exchange). The carousel's own constants live in
 * src/config/carousel.ts and the project opening's in
 * src/config/transition.ts; both use this scale. Every feature is disabled or
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
  /** Durations (ms), by name and by step: `t.respond` is `t[2]` is `--dur-2`. */
  t: { ...T, 1: T.feedback, 2: T.respond, 3: T.move, 4: T.settle },
  /** The named curves as CSS timing functions (the values of --ease-*). */
  ease: EASE,
  /** The same curves by their GSAP names (core eases only, no plugin). */
  gsapEase: { standard: 'power1.out', respond: 'power2.out', arrive: 'power3.out', exchange: 'power2.inOut' },

  /** The Work shelf: fades down from the header while its entries arrive from the Work side. */
  shelf: { durationMs: T.respond, itemOffsetPx: 16, itemStaggerMs: 14 },

  /** Sticky visual sections: screenshot crossfade and interface highlight. */
  crossfadeMs: T.respond,
  highlightMs: T.respond,

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
