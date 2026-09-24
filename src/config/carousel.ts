import type { ObjectKind } from '../content/carousel'

/**
 * The homepage depth gallery (src/components/home/DepthGallery.tsx; the
 * geometry is in src/components/home/galleryModel.ts; the order, names and
 * subtitles are in src/content/carousel.ts, the reference object sizes in
 * its OBJECT_SIZE).
 *
 * Model. The seven transparent PNG objects stand on the floor of the room in
 * their fixed circular order. One continuous position `pos` (in items)
 * says which object is featured: item i sits at the offset d = wrap(i − pos)
 * (−3.5 to 3.5). From d the model derives, together and smoothly: depth
 * scale (the featured object is substantially closer and larger), the base
 * line on the floor (farther objects stand higher, towards the far wall),
 * the horizontal place (a chain of objects edge to edge with a small gap,
 * the featured one slightly right of centre), a turn towards the viewer,
 * stacking order and brightness. Objects far from the front fade out and
 * wrap round while invisible.
 *
 * Px values are at the 1440×900 reference and scale with the size factor
 * `u` (see `size`) unless noted.
 */
export const GALLERY = {
  /** Featured object size, as a multiple of OBJECT_SIZE (the 1440×900 carousel reference). */
  featured: 1.5,
  /**
   * Per-kind size adjustment at every depth, for balanced visual weight
   * (the wide screens slightly smaller, the slim phone slightly larger).
   */
  kindScale: { headshot: 0.97, monitor: 0.97, mug: 0.9, laptop: 0.95, tablet: 0.98, camera: 0.98, phone: 1 },

  /**
   * Size factor u = clamp(min, min(width / 1440, (height − heightOffset) / heightSpan), max).
   * Below `fitBelow` px wide the widest featured object also fits within
   * `fit` of the width (phones and portrait tablets show the featured
   * object with its neighbours at the edges instead of shrinking everything).
   */
  size: { min: 0.36, max: 1.3, heightOffset: 120, heightSpan: 780, fitBelow: 1000, fit: { tablet: 0.54, phone: 0.54 } },
  /**
   * Phones: one size factor fits the widest object (the monitor), which
   * leaves the upright objects small. As an object comes to the front it may
   * grow by up to `max`, within `fit` of the width and `height` of the
   * window height (its neighbours keep their size).
   */
  phoneBoost: { max: 1.6, fit: 0.76, height: 0.45 },

  /** Layout per width class: desktop (≥ 1000px), tablet (600 to 999px), phone (< 600px). */
  layout: {
    desktop: {
      /** Featured object's centre as a share of the width (slightly right of centre). */
      x0: 0.515,
      /** Depth: scale s(a) = 1 / (1 + k·(√(a² + c²) − c)) at distance a (in items) from the front. */
      k: 0.86,
      c: 0.35,
      /** Largest turn towards the viewer (radians) and how quickly it is reached: turn = −max·tanh(d / reach). */
      turnMax: 0.33,
      turnReach: 1.35,
      /** Gaps between neighbours on the chain, by the inner one's distance (0 = featured, 1, 2, 3); px at u = 1. */
      gaps: [22, 34, 60, 70],
      /** At rest the featured object's neighbours tuck this far behind it (px at u = 1); none while objects pass. */
      tuck: 34,
      /** Spacing on the left (more room there) × (1 + bias), on the right × (1 − bias). */
      bias: 0.13,
      /**
       * Objects fade out between these distances (and are invisible beyond):
       * on the right, and sooner on the left, so the left neighbour is the
       * leftmost object at rest (About Me at the opening).
       */
      fade: [2.3, 2.85],
      fadeLeft: [1.3, 1.85],
    },
    /** Tablets show the featured object and its two neighbours (the outer ones only while passing). */
    tablet: { x0: 0.5, k: 0.8, c: 0.35, turnMax: 0.26, turnReach: 1.35, gaps: [22, 36, 48, 56], tuck: 50, bias: 0, fade: [1.35, 1.9], fadeLeft: [1.35, 1.9] },
    /** Phones: the featured slot stands right of centre, so the left neighbour (About Me at the opening) shows whole with its name and the right one only peeks in. */
    phone: { x0: 0.6, k: 0.65, c: 0.35, turnMax: 0.18, turnReach: 1.35, gaps: [10, 22, 30, 40], tuck: 40, bias: 0, fade: [1.3, 1.85], fadeLeft: [1.3, 1.85] },
  },

  /**
   * Floor. The featured object's base sits `bottom` above the window's
   * bottom edge (room for its name, subtitle and the controls). Bases of
   * farther objects approach the room's far floor line (where stage.css
   * draws it: the loop's line at 65% of its frame, object-fit cover at 50%
   * 55%), minus `horizonLift` of the window height. Phones stand the
   * objects higher (`phoneBottom`), nearer the middle of the tall window.
   * Portrait windows (tablets, phones) raise the floor further, until the
   * opening's featured object stands `portrait.band` of the window height
   * below the identity, but never closer than `portrait.belowLine` of the
   * height to the far floor line (the objects stay on the floor). The
   * arrows stay at the bottom edge. At laptop heights (tablets and wider)
   * the floor stands `short.lift` px higher, taking the room from the empty
   * band under the identity, so the featured caption ends well above the
   * arrow row: fully between `short.ramp[1]` and `short.ramp[2]` px of
   * window height, easing in from `ramp[0]` and out by `ramp[3]`.
   */
  floor: {
    bottom: { share: 0.145, min: 96, max: 150 },
    short: { lift: 40, ramp: [560, 700, 900, 980] },
    phoneBottom: { share: 0.28, min: 96, max: 250 },
    horizonLift: 0.02,
    portrait: { band: 0.22, belowLine: 0.025 },
  },

  /** Distance dimming (opacity) at distance a: 1 − linear·a − square·a². */
  dim: { linear: 0.08, square: 0.025 },
  /** Per-object perspective of the turn (px at u = 1). */
  perspective: 1500,
  /**
   * Name label: gap below the base (px at u = 1, plus a share of the depth
   * scale); it stays `edgeMargin` px inside the window and fades out while
   * its object's share inside the window falls from `edgeFade[1]` to `edgeFade[0]`.
   * A name standing beside a nearer object keeps `clear` px (at u = 1)
   * from it, fully once the name's top is `rise` px (at u = 1) above that
   * object's lowest wide part; `foot` is the share of an object's height,
   * from its base, that is only a narrow stand (the monitor's), beside
   * which names may stand. Phones: the front name is gone by distance
   * `phoneFade.front`; a neighbour's name (only where its object rests
   * wholly in the window with room for the name beside the front object)
   * fades in between `side[0]` and `side[1]` and out between `side[2]` and
   * `side[3]`. Touch screens at least `touchSubs.minWidth` px wide show
   * the neighbours' subtitles too (narrower ones only the featured one, as
   * phones do), each only while it keeps `touchSubs.subGap` px from every
   * other shown name and subtitle at its height and stays off the featured
   * name's line.
   */
  label: {
    gap: 12,
    gapDepth: 10,
    edgeFade: [0.55, 0.78],
    edgeMargin: 12,
    clear: 10,
    rise: 24,
    foot: { monitor: 0.142 } as Partial<Record<ObjectKind, number>>,
    phoneFade: { front: 0.4, side: [0.8, 0.97, 1.03, 1.2] },
    touchSubs: { minWidth: 900, subGap: 16 },
  },

  /**
   * Very slow idle drift: its rate (items per second) and wave (slower near
   * each featured position, never stopped). Phones use the stronger
   * `phoneWave` in the same time per project: the drift dwells longer at
   * each project and crosses faster between them, so a name is readable
   * more of the time (only the front one shows there).
   */
  drift: { rate: 0.1, wave: 0.62, phoneWave: 0.9, rampMs: 1800 },
  /** A fresh opening holds still this long, so the About-first composition reads. */
  openingHoldMs: 3200,
  /**
   * After wheel or trackpad movement settles, a short reading pause before
   * the drift resumes. A deliberate step (arrow button, arrow key, swipe)
   * holds instead until the next input.
   */
  readPauseMs: 2600,
  /** After hover or focus ends, at least this long before a pending drift resumes. */
  resumeDelayMs: 900,

  /**
   * Wheel and trackpad: `pxPerItem` of scrolling moves one project; each
   * event counts at most `maxEvent` px; one gesture (events less than
   * `gapMs` apart) moves at most one project; `inputTau` smooths the
   * movement during input; `endMs` after the last event it settles on a
   * project (the next one in the gesture's direction once it moved at least
   * `threshold`; `overshoot` past a project settles back on it).
   */
  wheel: { pxPerItem: 240, maxEvent: 60, gapMs: 220, endMs: 140, inputTau: 70, threshold: 0.05, overshoot: 0.15 },
  /** Settling: a critically damped spring (rad/s); no bounce. */
  settle: { omega: 7.2 },
  /** Touch swipe: one project per this share of the width, flick look-ahead (s), movement before a swipe is recognised (px). */
  swipe: { widthPerItem: 0.55, flick: 0.22, slop: 8 },

  hover: {
    /**
     * Forward (px at u = 1) and +5% (the inner wrapper; the gallery transform
     * stays on the outer element). The featured object, the largest, grows
     * +3% (home.css), about the same pixels, so it never covers a
     * neighbour's embedded title. `scale` is the largest (for image sizes).
     */
    lift: 8,
    scale: 1.05,
    /** After the pointer leaves an object, it may reach the object's name (or come back) within this long without resuming. */
    graceMs: 150,
  },
  /** Reduced motion: steps cross-fade (ms out, ms in); a wheel gesture moves one step after this much scrolling (px). */
  reduced: { outMs: 110, inMs: 170, wheelPx: 40 },
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
