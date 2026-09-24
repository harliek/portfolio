/**
 * The homepage object carousel (src/components/home/ObjectArc.tsx and
 * ObjectRow.tsx; the order, labels and sentences are in
 * src/content/carousel.ts, the display sizes in its OBJECT_SIZE).
 *
 * Geometry (moving arc). The seven transparent PNG objects stand on one
 * continuous track in their fixed order. Each object takes its own width
 * on the track plus one constant gap, so the visible spacing follows the
 * object widths instead of a fixed pitch. The track is a shallow concave
 * arc around the viewer: at the centre the objects are slightly farther
 * away (smaller), towards the sides they come closer and turn inward, and
 * in the last stretch before they leave the stage they shrink and dim
 * again. One phase (px along the track) moves at a constant, time-based
 * speed; every object's transform is derived from it each frame. An object
 * is moved from one end of the loop to the other only where it is fully
 * outside the stage and invisible.
 *
 * All px values are at the 1440×900 reference and scale with the size
 * factor `u` (see `size`), except where noted.
 */
export const CAROUSEL = {
  /** Idle speed along the track (px per second at u = 1). */
  speed: 30,
  /**
   * On a fresh visit the motion eases in from rest over this long (ms), so
   * the About-first opening reads before the objects start to travel.
   * After that the speed is constant.
   */
  startRampMs: 1600,

  /**
   * Scrolling (wheel or trackpad) over the carousel adds up to `max` times
   * the idle speed (1 = twice as fast), then eases back over `easeMs`
   * after the last wheel event. Each event adds |delta| / `perPx` of the
   * extra speed, never beyond `max`. The listener is passive: the page
   * still scrolls normally and nothing navigates.
   */
  wheel: { max: 1, perPx: 160, easeMs: 700, smoothMs: 90 },

  /** Size factor u = clamp(min, min(width / 1440, (height − heightOffset) / heightSpan), max). */
  size: { min: 0.62, max: 1.35, heightOffset: 240, heightSpan: 660 },

  /** Gap between neighbouring objects on the track: `ratio` × stage width, clamped (px, not scaled). */
  gap: { ratio: 0.044, min: 40, max: 90 },

  arc: {
    /** Depth scale at the centre (slightly farther away). */
    centre: 0.94,
    /** Depth scale at `peakAt` (closer). */
    peak: 1.045,
    /** Where the objects are closest, as a share of the stage half-width. */
    peakAt: 0.8,
    /** Beyond `peakAt`, objects shrink by `shrink` × (t − peakAt)² as they leave (t = share of the half-width). */
    shrink: 0.7,
    /** Smallest depth scale at the far ends. */
    minScale: 0.8,
    /** Inward turn at the stage edge (radians; ≈14°), proportional to the distance from the centre. */
    turn: 0.24,
    /** Largest turn (radians). */
    maxTurn: 0.3,
    /** Perspective of each object's turn (px at u = 1). */
    perspective: 1100,
    /** Closer objects stand a little lower (the floor comes towards the viewer): px per unit of depth scale. */
    floorDrop: 150,
    /** Objects dim from this share of the half-width (object centre)… */
    dimFrom: 0.8,
    /** …to this share… */
    dimTo: 1.18,
    /** …down to this opacity. */
    dimOpacity: 0.42,
  },

  /**
   * Hover or keyboard focus: the object comes forward (`lift` px at u = 1)
   * and grows by `scale` (+6%); the whole carousel pauses. Applied through
   * the --hover-scale and --hover-lift custom properties (home.css).
   */
  hover: { scale: 1.06, lift: 6 },

  /**
   * Room above the tallest object at its closest (px at u = 1). A hovered
   * object may rise a little above the stage (it is not clipped vertically).
   */
  topRoom: 12,
  /**
   * At the opening, About's left edge lines up with the identity block,
   * unless the object before it would then be more than this share visible
   * (very wide screens): About is always the leftmost fully visible object.
   */
  openingPrevShare: 0.45,
  /** Room below the baseline for the floor drop and the grounding shadow (px at u = 1). */
  bottomRoom: 30,

  /** An object is a pointer target while at least this share of its width is inside the stage. */
  minVisible: 0.5,
  /** After the pointer leaves an object (or the caption region), motion resumes this much later unless it returns (ms). */
  hoverGraceMs: 160,
  /** While moving, the object under a still pointer is re-checked this often (ms), so an arriving object pauses the carousel. */
  recheckMs: 90,
  /** Keyboard focus on an object outside the readable area glides it in over this long (ms). */
  focusGlideMs: 420,
  /** Largest frame time used for one step (s), so a stalled frame never produces a jump. */
  maxStep: 0.05,

  /** Hover-capable fine pointers at least this wide get the moving arc; everything else gets the swipe row. */
  arcMinWidth: 960,
  /** Touch and coarse pointers get the swipe row (tap opens a project directly). */
  touchQuery: '(hover: none), (pointer: coarse)',

  /** Swipe row (touch, narrow windows, reduced motion): object size factor limits and the narrowest item (px, room for its sentence). */
  row: { minU: 0.66, maxU: 1, minItemWidth: 232 },
} as const
