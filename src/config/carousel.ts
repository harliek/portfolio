/**
 * Desktop spatial work carousel geometry. Values are tuned from screenshots;
 * change them here rather than in components.
 */
export const CAROUSEL = {
  /** Media queries that must all match for the spatial arc to be used. */
  enableQuery: '(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  perspective: 1400,
  /** CSS width of a card: clamp(min, vw, max). */
  cardWidth: { min: 340, vw: 31, max: 440 },
  cardRatio: 16 / 10,
  /** Angular separation between neighbouring cards, degrees. */
  angleStep: 22,
  /** Horizontal gap between the active card and its neighbour, as a fraction of card width. */
  gapRatio: 0.08,
  /** Extra scale falloff per step (perspective does most of the work). */
  scaleFalloff: 0.03,
  opacity: { active: 1, near: 0.72, far: 0.38, hidden: 0 },
  /** Far neighbours only; never on the active or focused card. */
  farBlurPx: 0.6,
  /** Cards further than this many steps from the active card are hidden and inert. */
  visibleSteps: 2,
  drag: {
    thresholdPx: 8,
    /** A single release never moves more than this many projects. */
    maxStepsPerRelease: 2,
  },
  wheel: {
    /** Accumulated horizontal delta needed to move one project. */
    threshold: 60,
    /** Quiet period that ends one gesture. */
    gestureGapMs: 180,
  },
  hoverLift: 2,
} as const
