/**
 * Desktop spatial work carousel geometry. Values are tuned from screenshots;
 * change them here rather than in components.
 *
 * Model (per card, `o` = signed distance from the active position, in projects):
 *   angle = o × angleStep                (clamped to ±90°)
 *   x     = radius × sin(angle)
 *   z     = radius × (cos(angle) − 1)    (0 at the centre, negative = further away)
 *   rotY  = angle × rotateFactor         (neighbours turn away along the arc)
 * with radius = spacing × cardWidth / sin(angleStep), so the unprojected distance
 * between the active card and its neighbour is `spacing` card widths.
 */
export const CAROUSEL = {
  /** Media queries that must all match for the spatial arc to be used. */
  enableQuery: '(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  /** CSS perspective of the stage, px. */
  perspective: 1400,
  /** CSS width of a card (padded frame included): clamp(min, vw, max). */
  cardWidth: { min: 340, vw: 31, max: 440 },
  cardRatio: 16 / 10,
  /** Angular separation between neighbouring cards, degrees. */
  angleStep: 24,
  /** Unprojected centre-to-centre distance of neighbours, in card widths (1 = touching). */
  spacing: 1.06,
  /** Share of the arc angle applied as card rotation (1 = tangent to the arc). */
  rotateFactor: 1,
  /** Extra scale falloff per step (perspective does most of the work). */
  scaleFalloff: 0.04,
  /** Opacity by distance from the active card: 0, 1, 2 steps; beyond that hidden. */
  opacity: { active: 1, near: 0.68, far: 0.34, hidden: 0 },
  /** Far neighbours only (never on the active or focused card); 0 disables. */
  farBlurPx: 0.5,
  /** Cards further than this many steps from the active card are hidden and inert. */
  visibleSteps: 2,
  /** Vertical room above and below the card inside the stage (shadow, focus ring, hover lift), px. */
  stagePadBlock: 30,
  drag: {
    thresholdPx: 8,
    /** A single release never moves more than this many projects. */
    maxStepsPerRelease: 2,
    /** A release that moved at least this share of one step advances one project. */
    intentRatio: 0.18,
    /** Release speed (px/ms) that counts as a flick toward the next project. */
    flickVelocity: 0.45,
    /** Drag resistance past the first/last project (share of pointer travel). */
    edgeResistance: 0.3,
    /** Maximum overscroll past either end, in steps. */
    edgeMax: 0.35,
  },
  wheel: {
    /** Accumulated horizontal delta needed to move one project. */
    threshold: 60,
    /** Quiet period that ends one gesture. */
    gestureGapMs: 180,
    /** A gesture's axis is decided once this much movement (|x| + |y|, px) has accumulated. */
    axisDecidePx: 8,
    /** …and it counts as horizontal only if |x| exceeds |y| by this factor; otherwise it is page scroll. */
    axisBias: 1.5,
  },
  hoverLift: 2,
  transition: {
    /** If the case-study chunk is not ready this long after opening, navigate without travel. */
    chunkTimeoutMs: 250,
    /** Give up on the travel if the destination has not mounted within this time. */
    landTimeoutMs: 2000,
    /** After landing, wait at most this long for the hero image before revealing it. */
    imageWaitMs: 400,
  },
} as const
