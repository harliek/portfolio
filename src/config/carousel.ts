import type { ObjectKind } from '../content/carousel'

/**
 * The homepage depth gallery (src/components/home/DepthGallery.tsx; the
 * geometry is in src/components/home/galleryModel.ts; the order, names and
 * subtitles are in src/content/carousel.ts).
 *
 * Model. The seven transparent PNG objects stand on the floor of the room in
 * their fixed circular order. One continuous position `pos` (in items)
 * says which object is in front: item i sits at the offset d = wrap(i − pos)
 * (−3.5 to 3.5). From d the model derives, together and smoothly: depth
 * scale (the featured object substantially closer and larger, its two
 * neighbours about three quarters of that), the base line on the floor
 * (farther objects stand higher, towards the far wall), the horizontal
 * place (a chain of objects with a little overlap, the featured one right of
 * centre, beside and below the title), a turn towards the viewer, stacking
 * order and brightness. `pos` grows continuously, so every object travels
 * leftwards: it approaches from the right, passes through the featured
 * position and recedes to the left, then wraps round while invisible.
 *
 * Px values are at the 1440×900 reference and scale with the size factor
 * `u` (see `size`) unless noted.
 */
export const GALLERY = {
  /**
   * The featured size of each object at u = 1 (1440×900): a width for
   * landscape objects, a height for upright ones. Balanced one by one, so a
   * camera, monitor, mug, portrait, tablet and phone carry comparable weight
   * when featured (the wide white screens a little smaller than their
   * width suggests, the upright objects as tall as the title leaves room
   * for). Against the previous gallery at 1440×900 (the monitor 553 px
   * wide): the monitor, laptop, portrait, tablet and phone about 23 to 31%
   * larger, the mug and camera (small there) about 38% and a third.
   */
  featured: {
    headshot: { height: 545 },
    monitor: { width: 722 },
    mug: { height: 445 },
    laptop: { width: 695 },
    tablet: { height: 520 },
    camera: { width: 650 },
    phone: { height: 545 },
  } as Record<ObjectKind, { width?: number; height?: number }>,

  /**
   * Size factor u = clamp(min, min(width / 1440, (height − heightOffset) / heightSpan), max).
   * Below `fitBelow` px wide the widest featured object also fits within
   * `fit` of the width (phones and portrait tablets show the featured
   * object with its neighbours at the edges instead of shrinking everything).
   * On landscape windows an object whose silhouette would pass closer than
   * `titleClear` px to a line of the title somewhere round the loop takes a
   * smaller size of its own (galleryModel.ts, buildScene; in practice the
   * monitor, a few per cent on laptop screens).
   */
  size: { min: 0.3, max: 1.3, heightOffset: 120, heightSpan: 780, fitBelow: 1000, fit: { tablet: 0.66, phone: 0.7 }, titleClear: 12 },
  /**
   * Phones: one size factor fits the widest object (the monitor), which
   * leaves the upright objects small. As an object comes to the front it may
   * grow by up to `max`, within `fit` of the width and `height` of the
   * window height (its neighbours keep their size).
   */
  phoneBoost: { max: 1.6, fit: 0.8, height: 0.44 },

  /** Layout per width class: desktop (≥ 1000px), tablet (600 to 999px), phone (< 600px). */
  layout: {
    desktop: {
      /** Featured object's centre as a share of the width (right of centre: the title holds the left quarter). */
      x0: 0.53,
      /**
       * Depth: scale s = 1 / (1 + k·(√(d² + c²) − c)) at offset d (in items)
       * from the front, with `k` on the right (approaching: 0.76 beside the
       * front, 0.57 next) and `kLeft` on the left (receding: 0.715, then
       * 0.52). The left neighbour stands under the title on landscape
       * windows, so its size is what the title leaves room for; a slightly
       * faster recession there lets the featured object be larger.
       */
      k: 0.445,
      kLeft: 0.562,
      c: 0.35,
      /** Largest turn towards the viewer (radians) and how quickly it is reached: turn = −max·tanh(d / reach). */
      turnMax: 0.3,
      turnReach: 1.35,
      /** Gaps between neighbours on the chain, by the inner one's distance (0 = featured, 1, 2, 3); px at u = 1 (negative: overlap). */
      gaps: [4, -18, -46, -60],
      /** At rest the featured object's neighbours tuck this far behind it (px at u = 1); none while objects pass. */
      tuck: 30,
      /** Spacing on the left (the left neighbour stays clearly visible) × (1 + bias), on the right × (1 − bias). */
      bias: 0.16,
      /** Objects fade out between these distances (right, then left), mostly beyond the window's edges. */
      fade: [2.45, 3.05],
      fadeLeft: [2.35, 2.95],
    },
    /** Tablets: the featured slot right of centre, so the left neighbour (About Me at the opening) shows whole; the right one enters at the edge. */
    tablet: { x0: 0.575, k: 0.5, kLeft: 0.5, c: 0.35, turnMax: 0.24, turnReach: 1.35, gaps: [12, -10, -30, -40], tuck: 70, bias: 0, fade: [1.7, 2.3], fadeLeft: [1.7, 2.3] },
    /** Phones: the featured slot right of centre, so the left neighbour (About Me at the opening) shows; the right one peeks in at the edge. */
    phone: { x0: 0.6, k: 0.55, kLeft: 0.55, c: 0.35, turnMax: 0.18, turnReach: 1.35, gaps: [8, 0, -10, -20], tuck: 110, bias: 0, fade: [1.6, 2.2], fadeLeft: [1.6, 2.2] },
  },

  /**
   * Floor. The featured object's base sits `bottom` above the window's
   * bottom edge (room for its caption), and never so low that the tallest
   * caption would run past the bottom edge (desktop) or into the arrow row
   * (tablets and phones, where the caption spans most of the width). Bases
   * of farther objects approach the room's far floor line (where stage.css
   * draws it: the loop's line at 65% of its frame, object-fit cover at 50%
   * 55%), minus `horizonLift` of the window height. Phones stand the
   * objects higher (`phoneBottom`). Portrait windows (tablets, phones) raise
   * the floor further, until the opening's featured object stands
   * `portrait.band` of the window height below the identity, but never
   * closer than `portrait.belowLine` of the height to the far floor line.
   */
  floor: {
    bottom: { share: 0.12, min: 90, max: 140 },
    phoneBottom: { share: 0.24, min: 96, max: 250 },
    horizonLift: 0.02,
    portrait: { band: 0.2, belowLine: 0.025 },
  },

  /** Brightness by distance (opacity) at distance a: 1 − square·a² (distant objects stay solid; the depth tiers dim them). */
  dim: { square: 0.022 },
  /** Per-object perspective of the turn (px at u = 1). */
  perspective: 1500,
  /**
   * The caption (live title and subtitle): only the foremost object shows
   * it, centred beneath the featured slot, `gap` px below the featured
   * object's base (a fixed line, so nothing shifts). It follows its object
   * sideways by `follow` of the object's offset from the featured slot and
   * is fully shown while the object is within `show` of the front, gone at
   * 0.5 (where the next object becomes the foremost). It stays `edgeMargin`
   * px inside the window; `bottomMargin` px stay free below the tallest
   * caption on desktop.
   */
  label: { gap: 14, follow: 0.4, show: 0.4, edgeMargin: 16, bottomMargin: 18 },

  /**
   * Continuous travel to the left: `rate` items per second on average (1.4 ×
   * the previous drift's 0.0616), a gentle `wave` (a little slower near each
   * featured position, never stopped, the same average), starting from rest
   * over `rampMs` and stopping (keyboard focus, the pause control, a press)
   * over `stopMs`.
   */
  drift: { rate: 0.0862, wave: 0.2, rampMs: 1500, stopMs: 240 },
  /** A fresh opening holds still this long first, so the About-left, Merchandising-in-front composition reads. */
  openingHoldMs: 1400,
  /** Back from a project: a short calm moment before the travel resumes where it was. */
  returnHoldMs: 700,
  /** After an arrow step or a swipe settles, the object stays this long before the travel resumes. */
  stepHoldMs: 1400,

  /**
   * Wheel and trackpad accelerate the same leftward travel, whatever the
   * direction of the input (never to the right): each event adds its
   * distance / `pxPerBoost` to an energy that decays with `decayMs` (back to
   * the idle speed within about 800 ms of the last event); the extra speed
   * follows that energy with `smoothMs` (no jolt) and is capped at `max`
   * times the idle speed on top of it (2.5 × idle in all).
   */
  wheel: { pxPerBoost: 200, decayMs: 270, smoothMs: 120, max: 1.5, maxEvent: 240 },
  /** Settling after an arrow step, a keyboard step or a swipe: a critically damped spring (rad/s); no bounce. */
  settle: { omega: 7.2 },
  /** Touch swipe: one project per this share of the width, flick look-ahead (s), movement before a swipe is recognised (px). */
  swipe: { widthPerItem: 0.55, flick: 0.22, slop: 8 },
  /** A press opens the object it started on when released within `ms` and `slop` px (whatever has moved under the pointer meanwhile). */
  press: { ms: 1200, slop: 14 },

  hover: {
    /**
     * Up (px at u = 1) and +4% about the base (the inner wrapper; the
     * gallery transform stays on the outer element); the featured object,
     * the largest, +2.5% (`frontScale`; home.css has the same values).
     * `scale` is the largest (for image sizes). Beneath the title an object
     * grows and rises only as far as keeps `clear` px below it (--room).
     */
    lift: 8,
    scale: 1.04,
    frontScale: 1.025,
    clear: 6,
    /** Hover follows what is under a still pointer while the objects travel: checked every this many ms. */
    pollMs: 90,
  },
  /** Reduced motion: steps cross-fade (ms out, ms in); a wheel gesture moves one step after this much scrolling (px), one per gesture (`gapMs`). */
  reduced: { outMs: 110, inMs: 170, wheelPx: 40, gapMs: 220 },
  /**
   * An object (with its floor light and name) is never shown before its
   * image has decoded; then it fades in over `ms`, or shows at once when
   * that happens within `instantWithin` ms of the gallery mounting (a
   * cached image, such as on Back).
   */
  appear: { ms: 200, instantWithin: 150 },
  /** Largest frame time used for one step (s), so a stalled frame never produces a jump. */
  maxStep: 0.05,
} as const
