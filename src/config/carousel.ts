import type { ObjectKind } from '../content/carousel'

/**
 * The homepage project carousel (src/components/home/DepthGallery.tsx; the
 * geometry is in src/components/home/galleryModel.ts; the order, names and
 * subtitles are in src/content/carousel.ts). Plan v11, deliverables 4 to 10,
 * with plan v12, brief v13 (automatic rotation, the pause control, the
 * hover contour) and brief v14 (the carousel just below the first view).
 *
 * Model. The seven objects (About Me and the six projects) stand on one
 * shallow, symmetrical curve, each one an object-label group: its
 * transparent PNG with its title and subtitle beneath it. One continuous
 * position `pos` (in items) says which object is selected; each object's
 * signed slot offset d = wrap(i − pos) (−3.5 to 3.5; a = |d|) is the single
 * value from which its scale, the height of its bottom edge, its turn, its
 * light, its label's size and opacity and its stacking order are derived,
 * with the same rules for every object. Its x comes from the resting places
 * (silhouette gaps, see `layout`), joined by a smooth monotone curve.
 *
 * Tables of four values are knots at a = 0, 1, 2 and 3 (the selected slot,
 * the neighbours, the outer objects and beyond), joined by a smooth
 * monotone curve that is flat through the selected slot.
 *
 * Motion. The carousel rotates slowly on its own (`auto`): `pos` advances at
 * a steady pace, so every object in turn comes forward through the centre
 * and recedes. It pauses while the pointer is over the objects, while
 * keyboard focus is in the carousel, while a drag, swipe, trackpad gesture,
 * arrow step or press is under way, while a project opens, while the pause
 * control is set, and while the carousel is mostly out of view or the tab is
 * hidden; it eases back in from wherever it stands (never a reset). With
 * reduced motion it never moves on its own.
 */
export const GALLERY = {
  /**
   * The silhouette inside each PNG (pixels with alpha of at least 64 of
   * 255), as shares of the image box: left, top, width and height. Measured
   * from the 960px derivatives (node_modules/.cache-scripts/v11-alpha.mjs);
   * the files are trimmed, so only a thin transparent margin remains, but
   * every size, gap and bottom edge is measured on the silhouette, never on
   * the box. The mug's silhouette includes its handle.
   */
  opaque: {
    headshot: { x: 0.0146, y: 0.0129, w: 0.9708, h: 0.9871 },
    monitor: { x: 0.0083, y: 0.0063, w: 0.9844, h: 0.9828 },
    mug: { x: 0.0156, y: 0.0146, w: 0.9708, h: 0.9696 },
    laptop: { x: 0.0115, y: 0.0177, w: 0.9771, h: 0.9646 },
    tablet: { x: 0.0146, y: 0.0116, w: 0.9708, h: 0.9767 },
    camera: { x: 0.0125, y: 0.0171, w: 0.976, h: 0.9659 },
    phone: { x: 0.0303, y: 0.0174, w: 0.9395, h: 0.9664 },
  } as Record<ObjectKind, { x: number; y: number; w: number; h: number }>,

  /**
   * Every object's silhouette fits (contain) the same invisible display
   * area of its slot (`layout[cls].area` × its slot scale), bottom-aligned,
   * then takes its own factor, which balances visible weight: the wide
   * screens a little smaller than the area's width, the mug (handle
   * included) clearly smaller so it reads like the software projects, the
   * upright tablet and phone at the area's full height.
   */
  factor: { headshot: 0.95, monitor: 0.93, mug: 0.8, laptop: 0.94, tablet: 0.98, camera: 0.9, phone: 1 } as Record<ObjectKind, number>,
  /** Where the label is centred, as a share of the silhouette's width (the mug's body, not its handle). */
  center: { headshot: 0.5, monitor: 0.5, mug: 0.42, laptop: 0.5, tablet: 0.5, camera: 0.5, phone: 0.5 } as Record<ObjectKind, number>,

  /** Slot rules (knots at a = 0, 1, 2, 3), the same for every object. */
  slot: {
    /** Scale of the display area: selected 1, neighbours 0.8, outer objects 0.65. */
    scale: [1, 0.8, 0.65, 0.55],
    /** A gentle turn towards the centre (degrees; rotateY, the side objects face the selected one). */
    turn: [0, 7, 12, 15],
    /** Label scale: title 22 → 19.4 → 16.5px, description 16 → 14.1px. */
    labelScale: [1, 0.88, 0.75, 0.7],
    /** Title and description opacity (outer objects show their title only). */
    title: [1, 0.94, 0.72, 0],
    sub: [1, 0.86, 0, 0],
    /** The description is gone between these distances (never shown small). */
    subUntil: [1.2, 1.6],
    /**
     * The accent glow layer's opacity (alpha-aware rim and halo): clear on
     * the selected object, subtle on the neighbours, almost none beyond.
     */
    glow: [0.62, 0.2, 0.04, 0],
    /** A dark veil on the silhouette: the objects away from the centre recede a little. */
    dim: [0, 0.08, 0.2, 0.32],
  },

  /**
   * Layout per width class: desktop (≥ 1000px), tablet (600 to 999px),
   * phone (< 600px). `area`: the selected slot's display area at u = 1
   * (px). `rise`: how much higher each slot's bottom edge stands (px, knots
   * at a = 0 to 3). Gaps are between visible silhouettes (px).
   *
   * - desktop: the size factor u lets the widest trio (a narrow object
   *   between two wide ones) stand complete with `gap` either side and
   *   `edgeRoom` to spare at each window edge (so the outer objects show at
   *   least in part), within `u`. The edge room grows with the width (px at
   *   1280 wide, plus `perPx` for each px beyond), so narrower windows keep
   *   the objects large next to their fixed-size labels. The gap adapts to
   *   the width (`gap.share` of it, within min and max).
   * - tablet and phone: u makes the widest selected object `fit` of the
   *   width; the neighbours are glimpsed at the edges. Phones keep one
   *   baseline (no rise).
   * - `gap2`, `gapOuter`: the gaps beyond the neighbours, as shares of `gap`.
   * - `fade`: objects fade out between these distances (beyond the outer
   *   slot) and wrap round unseen.
   * - `sideLabels`: whether the other objects show their labels (tablets
   *   and phones show the selected object's caption only; their neighbours
   *   are glimpses at the edges).
   * - `u`: the size factor's bounds; within them the objects, labels and
   *   controls fit the window below the header (the carousel is scrolled
   *   into view below the first view, brief v14).
   */
  layout: {
    desktop: {
      area: { w: 430, h: 320 },
      rise: [0, 24, 44, 56],
      gap: { share: 0.05, min: 64, max: 88 },
      gap2: 0.72,
      gapOuter: 0.72,
      edgeRoom: { at1280: 72, perPx: 0.35, min: 64, max: 240 },
      fit: 0,
      u: { min: 0.66, max: 1.05 },
      fade: [2.3, 2.85],
      sideLabels: true,
    },
    tablet: {
      area: { w: 430, h: 320 },
      rise: [0, 20, 36, 46],
      gap: { share: 0.06, min: 40, max: 56 },
      gap2: 0.8,
      gapOuter: 0.8,
      edgeRoom: { at1280: 0, perPx: 0, min: 0, max: 0 },
      fit: 0.56,
      u: { min: 0.6, max: 1.2 },
      fade: [1.55, 2.1],
      sideLabels: false,
    },
    phone: {
      area: { w: 300, h: 320 },
      rise: [0, 0, 0, 0],
      gap: { share: 0.06, min: 22, max: 28 },
      gap2: 1,
      gapOuter: 1,
      edgeRoom: { at1280: 0, perPx: 0, min: 0, max: 0 },
      fit: 0.74,
      u: { min: 0.6, max: 1.1 },
      fade: [1.4, 1.95],
      sideLabels: false,
    },
  },

  /** Per-object perspective of the turn (px at u = 1). */
  perspective: 900,

  /**
   * Labels (deliverable 6): the title's line box stands `gap` px below the
   * object's visible bottom edge (its capitals about 6px lower); every
   * label is `width` px wide (at most the window less `inset` either side),
   * with two lines reserved for the description (`lines`). Where two shown labels would come within `clear`
   * px at a resting position, or a title standing higher than the bottom
   * edge of the object inside it would come within `clearObject` px of that
   * object, the outer object moves out (the silhouette gap grows); in
   * between, the farther label yields within `yieldPx` (never two
   * overlapping). A label reaching past the window's edge fades out before
   * it is cut (`visible`: the share of it inside), so a caption is either
   * whole or gone, also as the carousel turns.
   */
  label: { gap: 20, width: { desktop: 440, tablet: 420, phone: 360 }, inset: 16, lines: 2, clear: 18, clearObject: 2, yieldPx: 10, visible: [0.975, 1] },

  /** The stage: room above the selected object (for its glow), below the labels, and around the whole carousel in its section (px). */
  stage: { top: 30, bottom: 10, margin: 28 },

  /**
   * An arrow or keyboard step: `ms` for one object (a longer move adds
   * `perItemMs` per further object, up to `maxMs`), starting at `lead`
   * times its average speed and easing out to rest (a cubic curve with no
   * overshoot; a new step while one runs continues from its speed).
   */
  step: { ms: 500, perItemMs: 130, maxMs: 820, minMs: 360, lead: 1.6 },
  /** After a drag, a swipe or a trackpad gesture: a short ease to the nearest object (ms), carrying the release speed; `flick` is the look-ahead (s). */
  settle: { minMs: 240, maxMs: 420, perItemMs: 260, flick: 0.12 },
  /** Pointer drag and touch swipe: movement before a drag is recognised (px). */
  drag: { slop: 6 },
  /**
   * Horizontal trackpad gestures (deltaX): the carousel follows the fingers;
   * it settles `idleMs` after the last event, or as soon as the momentum
   * tail has fallen below `decay` of the gesture's peak (from a peak of at
   * least `minPeak` px); the rest of that tail is ignored until `tailMs`
   * without events or a new, stronger push. A gesture that moved the
   * carousel more than `advance` of an object's spacing brings the next
   * object in its direction to the centre (a deliberate swipe never springs
   * back).
   */
  wheel: { idleMs: 90, tailMs: 200, decay: 0.3, minPeak: 10, advance: 0.15 },
  /** A press opens the object it started on when released within `ms` and `slop` px (whatever has moved under the pointer meanwhile). */
  press: { ms: 1200, slop: 14 },

  hover: {
    /**
     * Hover and keyboard focus: +6% about the silhouette's bottom centre, its
     * visual baseline (home.css --hover-scale has the same value). None with
     * reduced motion (the red contour alone marks the object).
     */
    scale: 1.06,
    /** Hover follows what is under a still pointer while the carousel moves: checked every this many ms. */
    pollMs: 90,
    /** The light eases in and out over these (ms). */
    inMs: 200,
    outMs: 320,
  },
  /**
   * Automatic rotation (never with reduced motion).
   * - `revolutionS`: one full turn of the seven objects (s); a steady pace,
   *   about 6.4s per object.
   * - `startMs`: the first movement of a fresh visit, after the carousel is
   *   in view; Back into the homepage waits `afterInputMs` instead, so the
   *   project just left stays in front a moment.
   * - `afterInputMs`: it resumes this long after manual input ends (a drag,
   *   swipe, trackpad gesture, arrow or key step, a press, a cancelled
   *   opening); `afterHoverMs`: this long after the pointer leaves the
   *   objects or keyboard focus leaves the carousel.
   * - `easeInMs`: it eases in from rest over this long; `easeOutMs`: when a
   *   pause begins it comes to a stop over this long (a short glide, never a
   *   jolt).
   * - `inView`: it runs only while at least this share of the stage is in
   *   the window above its lowest `belowFold` share (where the first view
   *   shows only the objects' tops, brief v14), so the carousel starts
   *   turning once the visitor has scrolled to it, not while it peeks in.
   */
  auto: { revolutionS: 45, startMs: 1600, afterInputMs: 3000, afterHoverMs: 1200, easeInMs: 1800, easeOutMs: 380, inView: 0.4, belowFold: 0.12 },
  /** Reduced motion: steps cross-fade (ms out, ms in); a horizontal trackpad gesture moves one step after this much scrolling (px), one per gesture (`gapMs`). */
  reduced: { outMs: 120, inMs: 240, wheelPx: 40, gapMs: 220 },
  /**
   * An object (with its label) is never shown before its image has decoded;
   * then it fades in over `ms`, or shows at once when that happens within
   * `instantWithin` ms of the carousel mounting (a cached image, such as on
   * Back).
   */
  appear: { ms: 240, instantWithin: 150 },
} as const
