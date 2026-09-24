/**
 * The homepage's image-tile carousel (src/components/home/ConcaveCarousel.tsx)
 * and the project route transition (src/components/transition/projectTransition.ts).
 *
 * Geometry: seven upright 3:4 tiles (six projects and About Me) stand
 * on the inside of a shallow curved wall around the viewer. The centre tile
 * is the farthest and faces the viewer; tiles towards the edges turn inward
 * and come a little closer (so they read slightly larger). One continuous
 * phase (arc length in px) moves at a constant speed and every tile's
 * transform is derived from it each frame. A tile is recycled from one end
 * of the wall to the other only where it is fully outside the visible
 * (masked) stage.
 *
 * Tile sizes come from CSS (home.css: --body-h, the tile height). The
 * spacing and curve are derived here from the measured stage width, so the
 * same composition holds from laptop to large desktop screens.
 */
export const CAROUSEL = {
  /**
   * Travel speed along the arc for a 400px tall tile (px per second); it
   * scales with the tile size so the pace looks the same on every screen.
   * The first card carousel moved at 18px/s; this is ≈1.5× that.
   */
  speed: 27,
  referenceBodyHeight: 400,

  /** The moving arc. */
  arc: {
    /** Angle between neighbouring tiles on the wall (radians): the depth of the curve. */
    step: 0.24,
    /** Perspective distance as a multiple of the wall radius (1 = the viewer stands at the wall's centre). */
    perspective: 1,
    /**
     * Spacing between neighbouring tiles along the wall, as a share of the
     * stage width. At 0.2, four tiles are fully in view half a step off
     * centre (±0.5 and ±1.5 spacings), with portions of the next ones.
     */
    spacing: 0.2,
    /** Neighbouring tiles are never closer than this multiple of the tile width (a clear gap between tiles). */
    minSpacing: 1.13,
  },

  /** The static arrangement (reduced motion on wide screens): all seven tiles in view, a gentler curve. */
  still: {
    step: 0.13,
    perspective: 1,
    /**
     * Caption width limit (px). Each caption is also at most the spacing
     * less `captionGap` wide (a long name wraps), so captions never overlap
     * their neighbours.
     */
    maxCaption: 240,
  },

  /** Caption width (px) in the moving arc (home.css --cap-w); the description wraps to two lines at most. */
  captionWidth: 264,
  /** Names and labels of neighbouring tiles keep at least this gap (px). */
  captionGap: 20,
  /** Captions fade out completely this far (px) before the stage edge… */
  captionFadeEnd: 12,
  /** …over this distance (px), so a project name is never cut in half. */
  captionFadeLength: 96,
  /** Width of each edge fade of the stage (share of its width; matches the mask-image in home.css). */
  edgeMask: 0.045,
  /** Tiles fade over the last share of a spacing before the recycling point (a safety on unusual screens). */
  recycleFade: 0.3,
  /**
   * A tile stays a working link (hover, click) while at least this share of
   * its width is inside the stage (measured to the middle of the edge
   * fades). Hovering such an edge tile brings back its faded caption, moved
   * inward to stay whole. Tiles mostly outside take no pointer events.
   */
  minVisible: 0.5,

  /** Where the motion starts, in spacings past the first tile (1.5 puts tiles 1–4 in reading order). */
  startOffset: 1.5,
  /** Largest frame time used for one step (s), so a stalled frame never produces a jump. */
  maxStep: 0.05,
  /**
   * Whether pointer hover pauses the carousel. Off: Harlie asked for the
   * tiles to keep moving on hover (the hovered tile still lifts, glows and
   * shows its description as it passes). Keyboard focus always pauses.
   */
  pauseOnHover: false,
  /** After the pointer leaves a tile or its caption, its lift drops this long later unless it returns (ms). */
  hoverGraceMs: 180,
  /** Keyboard focus on a tile outside the readable area glides it into view over this long (ms). */
  focusGlideMs: 420,

  /**
   * The static arc needs at least this width for all seven tiles: its
   * spacing must hold a one-line "View case study ↗" / "View About page ↗"
   * (≈146px) plus `captionGap`. Narrower reduced-motion windows use the
   * swipe row (bigger tiles, every caption fully visible).
   */
  staticArcMinWidth: 1340,
  /** Narrower windows (even with a mouse) get the swipe row: the arc would show only two readable tiles. */
  arcMinWidth: 960,
  /** Touch and coarse pointers get the swipe row (tap opens a project directly). */
  touchQuery: '(hover: none), (pointer: coarse)',
} as const

/**
 * The project route transition (carousel tile → case study).
 *
 * 1. The carousel freezes; the chosen tile comes a little forward and fades
 *    (`leaveMs`, `leaveScale`, `leaveLift`); the other tiles dim. No turn or
 *    flip: the portrait artwork is never stretched towards a landscape image.
 * 2. The route changes once that has finished and the route's code has
 *    loaded (never later than `navigateCapMs` after the click).
 * 3. The destination's opening frame ([data-case-hero]) stays hidden until
 *    its image has decoded (at most `heroWaitMs`), then appears in place
 *    (`revealMs`, opacity and a 1.5% scale). Nothing is laid over the new page.
 *
 * Next-project links (no tile) use step 3 alone with `plainRevealMs`.
 */
export const TRANSITION = {
  leaveMs: 230,
  leaveScale: 1.06,
  leaveLift: 10,
  navigateCapMs: 700,
  heroWaitMs: 600,
  /** Longest wait for the destination's opening frame to exist before giving up quietly. */
  heroFindMs: 1500,
  revealMs: 240,
  revealScale: 0.985,
  plainRevealMs: 300,
  ease: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
} as const
