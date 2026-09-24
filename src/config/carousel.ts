/**
 * The homepage's concave carousel (src/components/home/ConcaveCarousel.tsx).
 *
 * Six tiles stand on the inside of a curved wall around the viewer: the
 * centre tile faces the viewer, tiles towards the edges turn inward and read
 * slightly closer and taller. One continuous phase (arc length in px) moves
 * at a constant linear speed; every tile's transform is derived from it each
 * frame. A tile is repositioned (recycled) only at the far ends of the arc,
 * outside the clipped viewport.
 *
 * Sizes come from CSS (home.css: --tile-h, --tile-gap); the geometry below
 * is relative to the measured tile width, so it scales with the tiles.
 */
export const CAROUSEL = {
  /** Travel speed along the arc at the centre (px per second). 18px/s ≈ 95s per six-project cycle. */
  speed: 18,
  /** Wall radius as a multiple of the tile width (smaller = stronger curve). */
  radius: 3.8,
  /** A gentler wall for the static arrangement, so all six tiles fit in view. */
  staticRadius: 6,
  /** CSS perspective as a multiple of the radius (the viewer stands at the wall's centre). */
  perspective: 1,
  /** Where the motion starts: this many tile spacings past the first project (1.5 puts projects 1–4 in reading order). */
  startOffset: 1.5,
  /** Largest frame time used for one step (s), so a stalled frame never produces a jump. */
  maxStep: 0.05,
  /** After the pointer leaves a tile, motion resumes this long later unless another tile is entered (ms). Pausing is immediate. */
  resumeGraceMs: 90,
  /** Static arrangement (reduced motion) needs at least this width for all six tiles on the arc; narrower uses the flat row. */
  staticArcMinWidth: 1100,
  /** Narrower windows (even with a mouse) get the flat row: the arc would show only two tiles with clipped names. */
  arcMinWidth: 700,
  /** Width of each edge fade (share of the carousel width, matches home.css mask-image). */
  edgeFade: 0.04,
  /** Touch and coarse pointers get the static swipe row. */
  touchQuery: '(hover: none), (pointer: coarse)',
} as const
