import type { ObjectKind } from '../content/carousel'

/**
 * The homepage depth gallery (src/components/home/DepthGallery.tsx; the
 * geometry is in src/components/home/galleryModel.ts; the order, names and
 * subtitles are in src/content/carousel.ts).
 *
 * Model (plan-v9 decision 4). The six project objects stand on a curved
 * rail in the room, each one a small object-label sculpture: its
 * transparent PNG with its own title and subtitle beneath it. One
 * continuous position `pos` (in items) says which project is active; each
 * object's signed depth d = wrap(i − pos) (−3 to 3; a = |d|) is the single
 * value from which everything about it is derived, together: its place on
 * the rail (x), how far it has risen towards the far wall (y), its scale
 * (× its own baseScale), its turn away from the active slot, its light (rim
 * and halo, floor spill, contact shadow, reflection, dimming), its label's
 * size and opacity, and its stacking order. `pos` grows continuously, so
 * every object travels leftwards: it approaches from the right, passes
 * through the active slot and recedes to the left, then wraps round while
 * out of view.
 *
 * Px values are at the 1440×900 reference and scale with the size factor
 * `u` (see `size`) unless noted. Tables of four values are knots at
 * a = 0, 1, 2 and 3 (the active slot, the neighbours, the edge objects and
 * beyond), joined by a smooth monotone curve that is flat through the
 * active slot.
 *
 * Research credits (principles only, no code copied; motion-plan.md P1):
 * Fancy Components "Marquee along SVG path" (MIT, Daniel Petho): base travel
 * plus a decaying scroll boost, hover eases the speed but never stops it;
 * Dither Blur Carousel (MIT, Yousuf Soomro): speed briefly adds depth;
 * Hyperiux Arc Flow: cushioned input; Viktor Horváth: vertical wheel drives
 * horizontal travel; Mintform (MIT, Ricky Bharti): the contact shadow
 * narrows and lightens as the object rises.
 */
export const GALLERY = {
  /**
   * Each project's own size when active (critique 23: a per-project
   * baseScale multiplied by the depth scale). 1 would give every object the
   * same opaque area, that of a `ref` px square at u = 1; the factors
   * balance them so a mug, monitor, laptop, tablet, camera and phone feel
   * equally important in front (upright objects need less area to hold the
   * eye; the mug is about 15% smaller than in the v8 gallery).
   * `opaque` is the measured share of each PNG's box that its silhouette
   * fills, `center` the share of its width at its visual centre (the mug's
   * body, not its handle), where its label is centred.
   */
  ref: 400,
  baseScale: { headshot: 1, monitor: 1.064, mug: 0.839, laptop: 0.998, tablet: 0.932, camera: 0.922, phone: 0.773 } as Record<ObjectKind, number>,
  opaque: { headshot: 0.668, monitor: 0.867, mug: 0.721, laptop: 0.845, tablet: 0.94, camera: 0.749, phone: 0.881 } as Record<ObjectKind, number>,
  center: { headshot: 0.5, monitor: 0.5, mug: 0.4, laptop: 0.5, tablet: 0.5, camera: 0.52, phone: 0.5 } as Record<ObjectKind, number>,

  /**
   * Size factor u = clamp(min, min(width / 1440, (height − heightOffset) / heightSpan), max).
   * Below `fitBelow` px wide the widest object also fits within `fit` of
   * the width (tablets and phones show the active object large, with
   * fewer objects around it, instead of shrinking everything).
   * `clear`: no object comes closer than this (px) to the identity block or
   * the portrait anywhere round the loop (else the scene takes a smaller u).
   */
  size: { min: 0.3, max: 1.3, heightOffset: 120, heightSpan: 780, fitBelow: 1000, fit: { tablet: 0.7, phone: 0.78 }, clear: 14 },
  /**
   * Phones: one size factor fits the widest object (the monitor), which
   * leaves the upright objects small. As an object comes to the front it may
   * grow by up to `max`, within `fit` of the width and `height` of the
   * window height (its neighbours keep their size).
   */
  phoneBoost: { max: 1.6, fit: 0.74, height: 0.4 },

  /** Layout per width class: desktop (≥ 1000px), tablet (600 to 999px), phone (< 600px). */
  layout: {
    desktop: {
      /** The active slot's centre as a share of the width. */
      x0: 0.5,
      /**
       * Depth scale s = 1 / (1 + k·(√(a² + c²) − c)): 1 in front, 0.67 at
       * the neighbours, 0.45 two away, 0.34 beyond (rounded through the
       * front by `c`, so an object passing it never changes size abruptly).
       */
      k: 0.7618,
      c: 0.45,
      /** The receding floor: an object rises rise·(1 − s) px (at u = 1): 32 at the neighbours, a further 21 two away. */
      rise: 96,
      /**
       * Turn away from the active slot (degrees, rotateY; left objects face
       * left, right ones face right, like objects on a curved rail seen
       * from the front) at a = 0, 1, 2, 3. Between two slots the turn
       * leads the travel (critique 26): along the travel, it covers
       * 1 − (1 − q)^lead of the way at progress q (65% at a third).
       */
      turn: [0, 12, 23, 30],
      lead: 2.6,
      /**
       * The rail: the neighbours stand `gap` px (u = 1) clear of the active
       * object; the edge slot (`edge`, 2 away) is set at the window's edges
       * with `reveal` of the object inside (so the gallery continues beyond
       * the viewport; perspective enlarges its inner half, so about 30% of
       * it shows), never closer than `gap2` to the neighbour; beyond it,
       * `gapOuter`.
       */
      gap: 64,
      gap2: 24,
      gapOuter: 40,
      edge: 2,
      reveal: 0.26,
      /** Objects fade out between these distances, beyond the window's edges, and wrap round unseen. */
      fade: [2.35, 2.9],
    },
    /** Tablets: the neighbours are the edge objects. */
    tablet: { x0: 0.5, k: 0.7618, c: 0.45, rise: 90, turn: [0, 12, 23, 30], lead: 2.6, gap: 44, gap2: 24, gapOuter: 40, edge: 1, reveal: 0.27, fade: [1.4, 1.95] },
    /** Phones: the neighbours peek in at the edges. */
    phone: { x0: 0.5, k: 0.7618, c: 0.45, rise: 70, turn: [0, 12, 23, 30], lead: 2.6, gap: 26, gap2: 16, gapOuter: 30, edge: 1, reveal: 0.26, fade: [1.4, 1.95] },
  },

  /**
   * Floor. The active object's base sits `bottom` of the window height above
   * its bottom edge (landscape: the rail sits a little higher than in v8,
   * with its label below it), never so low that the tallest active label
   * would come within `labelMargin` px of the bottom edge. Portrait windows
   * stand the rail at `portrait` of the height.
   */
  floor: {
    bottom: { share: 0.168, min: 110, max: 200 },
    labelMargin: 26,
    portrait: { tablet: 0.75, phone: 0.69 },
  },

  /** Per-object perspective of the turn (px at u = 1). */
  perspective: 780,

  /**
   * Light by depth (plan-v9 decision 7; knots at a = 0, 1, 2, 3):
   * - glow: the rim and halo layer's opacity (the layer carries the hover
   *   strength; 0.72 of it is the active object's rim 0.72 and halo 0.56;
   *   the neighbours have 40% of the active object's, far objects almost none);
   * - dim: a dark veil on the silhouette (the others dim; never see-through);
   * - spill: the accent light on the floor beneath;
   * - shadow: the contact shadow (lighter and softer with distance);
   * - reflect: the glossy floor's faint, blurred reflection.
   * Hover or keyboard focus raises glow and spill to full and lifts the
   * object (the contact shadow narrows and lightens) over `hoverInMs`,
   * back over `hoverOutMs`.
   */
  light: {
    glow: [0.72, 0.288, 0.04, 0],
    dim: [0, 0.14, 0.3, 0.42],
    spill: [1, 0.38, 0.06, 0],
    shadow: [1, 0.72, 0.46, 0.3],
    reflect: [1, 0.5, 0.2, 0],
    hoverInMs: 240,
    hoverOutMs: 420,
  },

  /**
   * Labels (plan-v9 decision 5): every object carries its title (one line)
   * and subtitle (at most two balanced lines) centred beneath its visual
   * centre, `gap` px below its base in front, both scaled with the depth
   * scale (title 19 → 12.7 → 8.6px; subtitle 13.5 → 9px, then gone).
   * Opacity knots for the title and the subtitle. The label is as wide as
   * `width.share` of its object in front, within `width.min` and
   * `width.max` px. Collision control: where two labels come within
   * `yieldPx` px of each other, the farther one fades out (never two
   * overlapping). A label mostly outside the window fades out
   * (`visible`: shown share range). It follows its object's turn only by
   * `follow` (it stays upright and readable).
   */
  label: {
    gap: 9,
    title: [1, 0.8, 0.44, 0],
    sub: [1, 0.42, 0, 0],
    /** Beyond the neighbours a subtitle would be too small to read: it is gone between these distances. */
    subUntil: [1.1, 1.4],
    width: { share: 0.84, min: 396, max: 440 },
    yieldPx: 18,
    visible: [0.9, 1],
    follow: 0.18,
  },

  /**
   * Continuous travel to the left: `rate` items per second on average, a
   * gentle `wave` (a little slower near each active position, never
   * stopped, the same average), starting from rest over `rampMs` and
   * stopping (keyboard focus, the pause control, a press) over `stopMs`.
   */
  drift: { rate: 0.0862, wave: 0.2, rampMs: 1500, stopMs: 240 },
  /** A fresh opening holds still this long first, so the Merchandising-in-front composition reads. */
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
   * times the idle speed on top of it. About 1.85× the v8 gallery's movement
   * per gesture (critique 25: v8 had 200 px per unit and a cap of 1.5), so
   * one deliberate swipe visibly carries the next project towards the front.
   * `depth` (motion-plan P1b): while boosted, the turn grows by up to
   * `turnGain` and objects two or more away dim by up to `farDim`, easing
   * back with the boost.
   */
  wheel: { pxPerBoost: 108, decayMs: 270, smoothMs: 120, max: 2.75, maxEvent: 240, depth: { turnGain: 0.25, farDim: 0.1 } },
  /** Settling after an arrow step, a keyboard step or a swipe: a critically damped spring (rad/s); no bounce. */
  settle: { omega: 7.2 },
  /** Touch swipe: one project per this share of the width, flick look-ahead (s), movement before a swipe is recognised (px). */
  swipe: { widthPerItem: 0.55, flick: 0.22, slop: 8 },
  /** A press opens the object it started on when released within `ms` and `slop` px (whatever has moved under the pointer meanwhile). */
  press: { ms: 1200, slop: 14 },

  hover: {
    /**
     * Up (px at u = 1) and +4% about the base (the inner wrapper; the
     * gallery transform stays on the outer element; home.css has the same
     * values, and +2.5% for the active object, the largest). `scale` is the
     * largest, for image sizes and the keep-out check.
     */
    lift: 8,
    scale: 1.04,
    /** Hover follows what is under a still pointer while the objects travel: checked every this many ms. */
    pollMs: 90,
    /** Motion-plan P1a: while a fine pointer rests on an object, the idle travel eases to `factor` (never stops); in over `inMs`, back over `outMs`. */
    slow: { factor: 0.7, inMs: 240, outMs: 420 },
  },
  /** Reduced motion: steps cross-fade (ms out, ms in); a wheel gesture moves one step after this much scrolling (px), one per gesture (`gapMs`). */
  reduced: { outMs: 120, inMs: 240, wheelPx: 40, gapMs: 220 },
  /**
   * An object (with its floor light and label) is never shown before its
   * image has decoded; then it fades in over `ms`, or shows at once when
   * that happens within `instantWithin` ms of the gallery mounting (a
   * cached image, such as on Back).
   */
  appear: { ms: 240, instantWithin: 150 },
  /** Largest frame time used for one step (s), so a stalled frame never produces a jump. */
  maxStep: 0.05,
} as const
