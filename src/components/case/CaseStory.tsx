import '../../styles/case.css'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { CASE_BAR } from '../../config/stage'
import { getImage, type ImageId } from '../../content/media'
import { PHONE_SIZES, STAGE_SIZES } from '../../content/projects'
import { prefersReducedMotion, useReducedMotion } from '../../hooks/useReducedMotion'
import { ScrollProgress } from '../../lib/scrollProgress'
import { DemoControls } from '../media/DemoControls'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { useImageDialog } from '../media/ImageDialog'
import { pillWidth } from '../layout/pill'
import { closeOnCancel, closeWithFade } from '../media/dialogExit'
import { CloseIcon } from '../media/ExpandIcon'
import { enterFullscreen } from '../media/fullscreen'
import { onFramePresented } from '../media/videoFrame'
import { CardHover } from '../ui/card-hover'
import { MiniControls } from '../media/MiniControls'
import { CaseTitle } from './CasePage'
import { useStageOnLeft } from './caseSide'

export interface StoryStep {
  title: string
  text: ReactNode
}

/**
 * One layer of a stage that changes with the steps: a picture (with an optional short neutral `label` under it, for a
 * picture whose provenance needs one).
 */
export type StageLayer = { image: ImageId; alt?: string; label?: string }

/**
 * A recording's part for one step: seconds [start, end], looped while the step is current; with 'hold', played once
 * and held on its last frame (Harlie's QA pass, 2026-09-28: the Merchandising Dashboard's order preparation, whose
 * recording goes on to a filter that empties the order).
 */
export type Segment = readonly [number, number] | readonly [number, number, 'hold']

/**
 * What the fixed stage shows. Each kind holds one state per step:
 * - video: a real recording; it plays each step's segment (`play`: on a loop, or once and held, and faster while the
 *   page scrolls), or (`free`) the whole recording loops by itself;
 * - layers: distinct artifacts in a card-hover gallery, the step's own picture in a large card and every picture as a
 *   small circle in a row under it (`show` picks the layer per step; hovering, focusing or clicking a circle shows it);
 * - phones: the app's screens as cutouts in one row, the step's own screen brought forward (`step` on each phone).
 * Layers and phones may carry one short neutral `label` beside the pictures (Harlie's copy brief, 2026-09-29:
 * "Illustrative concept screen", "Screens reconstructed from the original prototype"); nothing else is written on or
 * under them. No page sets a label at present (Harlie's requests, 2026-09-29: none beside the pictures, then none in
 * the meta line either).
 */
export type Stage =
  | {
      kind: 'video'
      src: string
      /**
       * The recording the larger view plays, when the page's `src` is only the part the page shows (a shorter cut of
       * the same file, the same frames and times). Left out, the larger view plays `src`.
       */
      dialogSrc?: string
      poster: string
      width: number
      height: number
      /** The part of the recording for each step (Segment). */
      segments: readonly Segment[]
      /** One still (seconds) per step, used under reduced motion. */
      stills: readonly number[]
      label: string
      /** Plays at its own pace, within the current step's segment, and faster while the page scrolls. */
      play?: boolean
      /** Plays by itself (Harlie's request): the whole recording on a loop, whatever the step, only pausing off screen. */
      free?: boolean
      /** Its playing speed (1 when left out; Harlie's request: the Spreadsheet and Merchandising recordings faster). */
      rate?: number
      /** The name of the control that opens the recording larger ("Play dashboard demo"). */
      action?: string
    }
  | { kind: 'layers'; aspect: number; layers: readonly StageLayer[]; show: readonly number[]; /** The colour of any sliver left around a picture whose proportions differ a little. */ screen?: string; /** A short neutral label for pictures without their own. */ label?: string }
  | { kind: 'phones'; phones: readonly { image: ImageId; name: string; step: number | readonly number[] }[]; /** One picture of all the phones, opened larger on a click. */ all?: ImageId; /** A short neutral label under the phones. */ label?: string }

/**
 * The stage's listener, called as the page scrolls: the current step, the progress through its scroll (0 to 1) and
 * that scroll's length in pixels.
 */
type Follow = (k: number, local: number, span: number) => void
type Bind = (fn: Follow | null) => void

/**
 * Phones and tablets held upright: the stage is not held beside the words but in a band under the header
 * (case-v16.css; keep the two queries in step). A landscape phone, less than 541px tall, keeps the stage beside the
 * words (Harlie's QA pass, 2026-09-28).
 */
const PHONE = '(max-width: 899.98px) and (orientation: portrait), (max-width: 899.98px) and (min-height: 541px)'

/**
 * The words' fading window (Harlie's request, 2026-09-30: "a soft mask so text fades as it approaches the top and
 * bottom edges"): the introduction and the steps fade out towards the window's edges through a mask held to the
 * window, not to the words (case-v16.css). At the top the fade runs from transparent (down to the floating pill's
 * lower edge, 6px below the window's top and 48px tall, layout.css: FADE_PILL; to the header's black bar's edge; or,
 * for the steps on phones, to the held band's) to solid a ramp below the header or the band (about 8% of the window's
 * height, 40 to 88px), so the lines passing under the navigation fade out and none shows under the pill. It grows in
 * over the page's first scroll, at most FADE_IN px, and is whole by the time the title's first line reaches what
 * covers the window's top (the pill's lower edge, or the black bar's): on arrival the title reads whole, and it never
 * shows under the pill half faded (2026-09-30: at 900 to 1200px wide the pill's edge cut across the title's letters,
 * at 15 to 55%, between 54 and 108px of scroll).
 *
 * At the page's end the steps' top fade gives way over the last FADE_IN px of scroll, as far as the last step's heading
 * needs to read whole where the room is short (on phones and landscape phones, between the band or the bar and the
 * footer's links), never closer than END_EDGE to what covers the top: the band's own soft lower edge is as tall
 * (case-v16.css .cs__media::after).
 */
const FADE_PILL = 50
const FADE_IN = 120
const END_EDGE = 20
const fadeRamp = (vh: number) => Math.round(Math.min(88, Math.max(40, 0.08 * vh)))

/**
 * Where the browser draws scroll-driven animations (Chrome 115, Safari 26 and later), the fading window is held to the
 * window by the compositor, in the same frame as each scroll (case-v16.css, fade-hold; 2026-09-30, the verifier's
 * flicker: written here at each scroll event, it ran a frame behind the scrolling Chrome and WebKit do off the main
 * thread). Here it is then only placed in its boxes when the page is measured. Elsewhere it is written as the page
 * scrolls, as before. Keep the question in step with case-v16.css's @supports.
 */
const HELD = typeof CSS !== 'undefined' && CSS.supports('animation-timeline', 'scroll()')

/**
 * How far the held boxes reach past the window (px): room for a line's antialiasing at the edges, and on phones for
 * the window growing as the toolbar goes (the boxes reach the screen's height).
 */
const HOLD_ROOM = 16

/**
 * A box's top in the window as laid out, less what the fading window's held translate and the introduction's slide
 * move it by (case-v16.css), and that slide (px, 0 or less). Both are read from the same style, so they agree with the
 * box's own position whenever this is read.
 */
function laidOut(box: HTMLElement) {
  const style = getComputedStyle(box)
  const held = parseFloat(style.translate.split(' ')[1] ?? '') || 0
  const slide = style.transform && style.transform !== 'none' ? new DOMMatrixReadOnly(style.transform).m42 : 0
  return { top: box.getBoundingClientRect().top - held - slide, slide }
}

/**
 * How far the introduction's top fade stands above its place (px) at scroll s of the page's first fadeIn px, where the
 * compositor holds it (case-v16.css, fade-slide), with `clear` px of the fade's ramp over the title's letters on
 * arrival: the fade clears the title on arrival (s = 0), reaches its place at fadeIn, and in between matches, as
 * closely as a whole fade can, the fade growing in that the page drew before (2026-09-30): over the title's rows in the
 * ramp, its brightest and dimmest differences from that strength balanced (at most about 10 to 14% of full strength, at
 * one row, halfway).
 */
const slideAt = (s: number, fadeIn: number, clear: number) => {
  const k = Math.min(1, Math.max(0, s / fadeIn))
  return Math.max(0, ((1 - k) * (clear + s)) / (1 + k))
}

/** Names the keyframes each page's introduction slides by (case-v16.css, --fade-slide). */
let slides = 0

/**
 * The introduction's slide as keyframes over its first fadeIn px of scroll (fade-slide for the introduction, upwards,
 * and its words' own, back down): whole pixels, each held until the scroll where the next pixel falls, so the words,
 * drawn through the introduction's mask, are never resampled at a fraction of a pixel.
 */
function slideKeyframes(name: string, fadeIn: number, clear: number) {
  const at: [number, number][] = []
  for (let s = 0; s <= fadeIn; s++) {
    const d = s === fadeIn ? 0 : Math.round(slideAt(s, fadeIn, clear))
    if (!at.length || at[at.length - 1][1] !== d) at.push([(s / fadeIn) * 100, d])
  }
  const frames = (sign: number) => at.map(([p, d]) => `${p.toFixed(3)}% { transform: translateY(${sign * d}px); animation-timing-function: step-end; }`).join(' ')
  return `@keyframes ${name} { ${frames(-1)} } @keyframes ${name}-back { ${frames(1)} }`
}

/**
 * How close the words may come to the footer's links at the page's end (px, from the words' last line to the top of
 * the footer's first row, Previous project): the words may end inside the footer's own top padding (as before the
 * reading effect), at least END_LINKS above the links, and where the last step's heading would otherwise stay in the
 * top fade, as close as END_LINKS_MIN (2026-09-30: measured from the footer's box, which adds its own 56 to 120px of
 * top padding, the words ended 104 to 112px above the links on phones, and the last heading stayed under the band or
 * the bar).
 */
const END_LINKS = 40
const END_LINKS_MIN = 24

/**
 * One scroll, one section (Harlie's request, 2026-09-30, verbatim: "After just one scroll, it should switch to the
 * next section"). A told page's scroll snaps (case-v16.css, :root[data-case-snap], on while a told page is open): its
 * places are the page's top (the introduction), each step with its middle on the reading line, where it is current,
 * and the page's end (the footer), and each is a stop no scroll passes (scroll-snap-stop), so a touch flick goes to
 * the next place or the one before by the browser's own scrolling. The mouse wheel and the trackpad are taken here
 * instead (onWheel): browsers let them pass places or stop at the wrong one (2026-09-30, measured on the snapping
 * alone: a trackpad's burst of small steps went from the top to the end in Chromium and WebKit, and WebKit's wheel
 * passed a place 8px away). So are the keys (onKey): Space and Shift+Space, Page Down and Up and the arrow keys each go
 * one place, Home and End to the top and the end (2026-09-30, the review: left to Chromium's snapping, a second press
 * while the first was still moving, or a held key, stopped the page between two places, and it stayed there; a page
 * with the same places and no script did the same).
 *
 * A wheel gesture is the run of wheel events in one direction, however many (a notch; a trackpad's swipe with its
 * momentum), until WHEEL_GAP ms pass without one, the direction turns, or, once the gesture has eased to half its
 * strength, a new push rises in it (a second swipe during the first one's momentum). Once it has moved WHEEL_MIN px it
 * goes one place, from the place a move under way is going to, so a second gesture goes one further. The move is the
 * browser's smooth scroll, drawn by the compositor like the page's own (the fading window stays held), and at once
 * under reduced motion. A move is under way until the page arrives (or its scrolling ends), not for a set time after
 * its last scroll (2026-09-30, the review: in Firefox a move whose scrolling paused for 200ms on a busy page was taken
 * as done, and the next notch only went on to where it was already going); AIM_WAIT is the longest it waits for that.
 */
const WHEEL_GAP = 200
const WHEEL_MIN = 4
/** Wheel events this close together (ms) are one, their sizes summed: what the browser had queued, delivered at once. */
const WHEEL_MERGE = 4
/** The longest a move made here counts as under way after the page last scrolled (ms), where no scrollend comes. */
const AIM_WAIT = 1000
/** How far from a place the page may rest and still be there (px): the browsers' own snapping rounds. */
const AT_PLACE = 3

/** Told pages open (a page change mounts the next before the last has gone): the page's scroll snaps while any is. */
let snapPages = 0

/**
 * Whether something under the pointer scrolls by itself that way (a list or a panel with its own scroll): the wheel
 * is left to it. The dialogs and the phone menu lock the page (is-dialog-open, is-menu-open) and keep theirs too.
 */
function scrollsItself(target: EventTarget | null, dir: number) {
  for (let el = target instanceof Element ? target : null; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    if (el.scrollHeight <= el.clientHeight + 1) continue
    const overflow = getComputedStyle(el).overflowY
    if (overflow !== 'auto' && overflow !== 'scroll' && overflow !== 'overlay') continue
    if (dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true
  }
  return false
}

/** What keeps the keys for itself, for typing (a field), or Space too, for pressing (a button, a box to tick). */
const KEEPS_KEYS = 'input, textarea, select, video, audio, [contenteditable]:not([contenteditable="false"])'
const KEEPS_SPACE = 'button, summary, [role="button"], [role="checkbox"], [role="switch"], [role="radio"], [role="tab"], [role="menuitem"], [role="option"]'

/** The floating navigation pill (px, in the window), with a few pixels of room around it. */
interface Shade {
  top: number
  bottom: number
  left: number
  right: number
}

/**
 * The pill once the page is scrolled (Header.tsx sizes it to --pill-w; layout.css centres it 6px below the top, 48px
 * tall, at most the window less 32px). Derived rather than read, since the page may be measured before the header
 * floats or while it gathers into the pill; its width from the header's contents, as Header.tsx takes it (pill.ts),
 * since the page is measured before the header has measured itself (on a first load, and as a page change adds Back).
 */
function navShade(): Shade {
  const header = document.querySelector<HTMLElement>('.site-header')
  const width = document.documentElement.clientWidth
  const pill = Math.min((header && pillWidth(header)) || parseFloat(header ? getComputedStyle(header).getPropertyValue('--pill-w') : '') || 720, width - 32)
  // A few pixels of room around the pill, where a line would still read as running under it.
  return { top: 3, bottom: 57, left: (width - pill) / 2 - 3, right: (width + pill) / 2 + 3 }
}

/**
 * The header's bar is opaque (black on the case studies below 900px and in windows at most 540px tall, layout.css;
 * CASE_BAR): nothing shows through it. Taken from the same query as the bar, not read from the bar's colour, which
 * eases in over a page change while the new page is first measured.
 */
const barOpaque = () => window.matchMedia(CASE_BAR).matches

/**
 * Where a flipped page's words keep clear of the floating pill (pillClear): from 1200px wide, in windows taller than
 * 540px. Below 1200px the pill reaches so far over the words' column that keeping clear of it would leave the words
 * under 300px wide: there the words' top fade takes the lines passing under it (Harlie's request, 2026-09-30).
 */
const PILL_CLEAR = '(min-width: 1200px) and (min-height: 541px)'

/**
 * How far in from its left edge the words' column starts its lines where the words stand on the right (a flipped page)
 * and the floating pill's right end reaches over the column (px; 0 where it does not): 8px clear of the pill (navShade
 * keeps 3px of them), so no line's first letters rest under it at the page's end (2026-09-30, with the flip:
 * "afePress's opportunity" at 1440px), and at 1280px CafePress UK's role still keeps to one line. The column's own
 * inset gives way first (case-v16.css, --pill-clear). Words on the left need none: only the lines' uneven ends meet the
 * pill there, and the top fade takes them.
 */
const pillClear = (column: HTMLElement) => Math.max(0, Math.ceil(navShade().right + 5 - column.getBoundingClientRect().left))

/**
 * The picture itself, directly on the page (Harlie's request, 2026-09-26: no device or frame PNG): a box in the
 * media's own proportions with rounded corners and a soft glow (case-v16.css), the recording or screenshot filling it
 * whole (never cropped).
 */
function MediaBox({ aspect, onZoom, zoomLabel, below, children }: { aspect: number; onZoom?: (trigger: HTMLElement) => void; zoomLabel?: string; below?: ReactNode; children: ReactNode }) {
  return (
    <div className={below ? 'story__stage story__box story__box--ctl' : 'story__stage story__box'} style={{ '--aspect': aspect } as CSSProperties}>
      <div className="story__screen">{children}</div>
      {onZoom && <ZoomButton onZoom={onZoom} label={zoomLabel} />}
      {/* Under the picture, inside the stage's room (the recording's control line; case-v16.css --ctl-room). */}
      {below}
    </div>
  )
}

/**
 * A case study told in a few compact steps (brief v21). The introduction and a few short groups (a heading and one
 * explanation) run down one column; the stage stays in place in the other (recordings and screenshots directly on the
 * page with rounded corners and a soft glow, whole; Jumpstart's phones stand free), below the header, centred in its
 * column and never taller than 72% of the window, so the whole composition sits inside the window with a gutter on
 * each side. Its opening state is level with the introduction. The words are on the left and the stage on the right,
 * or, on every other told page, the other way round (data-flip, from the project's order: caseSide.ts; Harlie's
 * request, 2026-09-30); everything here is measured from the page as laid out, so it follows either side.
 *
 * The words read like a film (Harlie's request, 2026-09-30, with normal page scrolling kept): they fade towards the
 * window's top and bottom edges (the fading window, FADE_PILL; case-v16.css), and the current step is the one nearest
 * the reading line, the middle of the window below what covers its top (the header's black bar, on phones the held
 * band). It is bright, with the one pink line beside it (moving to each new current step), and the other steps are
 * dimmed; the introduction stays bright. The first step is current from the start; the steps start low enough for it
 * to reach the reading line, and the page ends with the last step's middle on it (or higher, where the footer needs
 * the room, though never so high that its heading rests in the top fade where there is room below it: END_LINKS), so
 * the first and the last are each read there in turn. The stage changes with the current step: a
 * recording plays that step's segment (or, playing by itself, the whole recording loops whatever the step),
 * Jumpstart's phones stand in a row with the current section's brought forward, and artifacts are all shown at once,
 * the step's own large and the others small: the next step's picture grows where it stands as the large one shrinks,
 * following the scroll (over the last part of a step, done as the next step becomes current). Only the steps' own
 * positions drive this.
 *
 * Phones and tablets held upright (PHONE): the introduction, then a compact stage held under the header (about 30% of
 * the screen), with the steps below it.
 *
 * Reduced motion: no easing or movement (the gallery changes at once, the line and the dimming at once), and a
 * recording shows one still per step.
 */
export function CaseStory({ title, meta, lede, steps, stage }: { title: string; meta: readonly string[]; lede: ReactNode; steps: readonly StoryStep[]; stage: Stage }) {
  const listRef = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)
  /** The stage's per-frame listener (a recording's time, the gallery's position). */
  const follow = useRef<Follow | null>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const n = steps.length
    /**
     * Scroll positions where each step becomes current, the page's last scroll position, the space added under the
     * steps and above them (lead), the words' room kept clear of the pill (pillClear), the boxes that carry the fading
     * window (the introduction, the list of steps), the scroll over which the top fade grows in (fadeIn), its strength
     * last set, and the steps' top fade's lower edge (px in the window): as measured (b), at the page's end (endB),
     * last set (listB). Where the compositor holds the fading window (HELD), where each box's mask is placed in it (at:
     * the box's top in the page). For the snapping (WHEEL_GAP): what covers the window's top (covered), and how far a
     * step snapped by its heading keeps below it (room) and its end above the window's bottom (roomEnd).
     */
    const m = { t: [0], end: 1, pad: 0, lead: 0, clear: 0, fade: [] as HTMLElement[], fadeIn: FADE_IN, strength: -1, b: 0, endB: 0, listB: -1, covered: 0, room: 0, roomEnd: 0 }
    const holds = new Map<HTMLElement, { at: number }>()
    const cs = list.closest<HTMLElement>('.cs')
    const intro = cs?.querySelector<HTMLElement>(':scope > .cs__intro')
    const body = list.parentElement ?? list
    // A refresh queued below is dropped once the page has gone (the next page's triggers refresh themselves).
    let live = true
    // The page's scroll snaps while it is open (WHEEL_GAP; case-v16.css).
    const root = document.documentElement
    if (!snapPages++) root.setAttribute('data-case-snap', '')
    // The introduction's slide, written as the page is measured (slideKeyframes), where the compositor holds the fading
    // window; removed with the page.
    const slideName = ++slides
    const slideSheet = HELD ? document.head.appendChild(document.createElement('style')) : null
    // The last scroll position fade() had, and when (its lead at the page's end, below), and the exact place written once
    // the scrolling stops.
    let lastY = -1
    let lastAt = 0
    let settleEnd = 0
    const measure = () => {
      // With the words on the right beside the floating pill (a flipped page from 1200px, PILL_CLEAR), their lines
      // start clear of the pill's right end (pillClear). Set before anything is read, since it moves the words' line
      // breaks. A change is measured again two frames on, once the title has been fitted to the column's new width:
      // CaseTitle's observer reports after the next frame's callbacks, and a title still fitted to the old width left
      // the words' end where they no longer were (a first clearance taken from a pill not yet measured: lines cut by
      // the window's top at 1920px).
      if (cs && intro) {
        const clear = cs.hasAttribute('data-flip') && window.matchMedia(PILL_CLEAR).matches ? pillClear(intro) : 0
        cs.style.setProperty('--pill-clear', `${clear}px`)
        if (clear !== m.clear) {
          m.clear = clear
          requestAnimationFrame(() => requestAnimationFrame(() => live && ScrollProgress.refresh()))
        }
      }
      const vh = window.innerHeight
      const wide = !window.matchMedia(PHONE).matches
      // Phones: the band held under the header (the stage) covers what passes beneath it; its height is part of the
      // navigation's safe area there (--story-band, case-v16.css).
      const band = !wide ? cs?.querySelector<HTMLElement>('.cs__media') : null
      cs?.style.setProperty('--story-band', band ? `${band.offsetHeight}px` : '0px')
      const header = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0
      const bar = barOpaque() ? header : 0
      // What covers the window's top once the page is scrolled: nothing where the header floats as the translucent
      // pill, else the header's black bar, and on phones the band held under it (from where it is held).
      const covered = band ? (parseFloat(getComputedStyle(band).top) || 0) + band.offsetHeight : bar
      // The reading line (px from the window's top): the middle of the window below what covers its top.
      const read = (covered + vh) / 2
      // The fading window's top edge (FADE_PILL): the introduction's from the header, the steps' (on phones) from the
      // band; the page's first step never reaches the band's fade while the band still travels, being below it.
      const ramp = fadeRamp(vh)
      const edge = (el: HTMLElement | null | undefined, from: number) => {
        el?.style.setProperty('--fade-a', `${from || FADE_PILL}px`)
        el?.style.setProperty('--fade-b', `${(from || header) + ramp}px`)
      }
      edge(intro, bar)
      edge(list, covered)
      // The steps' --fade-b as measured (fade() eases it at the page's end, below), written again by the next fade().
      m.b = (covered || header) + ramp
      m.listB = -1
      // The page is scrolled to its top and back as it is measured (ScrollProgress): no lead from that.
      lastY = -1
      // The top fade is whole by the time the title's first line (its letters' box) reaches what covers the window's
      // top: the black bar's edge, or the floating pill's lower edge (FADE_IN).
      const titleEl = intro?.querySelector<HTMLElement>(':scope > .cs__words > .cx-title')
      let lift = 0
      if (titleEl) {
        const range = document.createRange()
        range.selectNodeContents(titleEl)
        const top = Math.min(titleEl.getBoundingClientRect().top, range.getBoundingClientRect().top) + window.scrollY
        m.fadeIn = Math.max(1, Math.min(FADE_IN, Math.floor(top - (bar || navShade().bottom))))
        // Held by the compositor (HELD, 2026-09-30), the introduction's fade slides into place over the same scroll
        // instead (case-v16.css, fade-slide): how far it stands above its place at each quarter of it, from clearing
        // the title's letters on arrival (the fade's lower edge, px in the window, less their top in the page, the
        // window's at arrival). Its bottom fade sits as far lower in its mask (--fade-lift), so on arrival it stands
        // where it always did. Whole pixels, a pixel at a time (slideKeyframes).
        if (HELD && intro && slideSheet) {
          const clear = (bar || header) + ramp - top
          const name = `fade-slide-${slideName}`
          slideSheet.textContent = slideKeyframes(name, m.fadeIn, clear)
          intro.style.setProperty('--fade-slide', name)
          intro.style.setProperty('--fade-slide-back', `${name}-back`)
          intro.style.setProperty('--fade-in', `${m.fadeIn}px`)
          lift = Math.round(slideAt(0, m.fadeIn, clear))
          intro.style.setProperty('--fade-lift', `${lift}px`)
        }
      }
      /*
       * Room before the first step (Harlie's request, 2026-09-30: "add substantial internal padding ... so the first
       * and last ideas can actually reach the centered, fully visible position"): the introduction is already above it,
       * so the steps start lower only where the page opens with the first step's middle above the reading line, just
       * enough for it to start there.
       */
      const first = list.firstElementChild?.getBoundingClientRect()
      const lead = first ? Math.max(0, Math.ceil(read - (first.top + window.scrollY + first.height / 2 - m.lead))) : 0
      if (lead !== m.lead) {
        m.lead = lead
        cs?.style.setProperty('--story-lead', `${lead}px`)
      }
      const y = window.scrollY
      const boxes = [...list.children].map((el) => el.getBoundingClientRect())
      const tops = boxes.map((b) => b.top + y)
      const bottoms = boxes.map((b) => b.bottom + y)
      const lastBottom = bottoms[n - 1]
      const footer = document.querySelector<HTMLElement>('.site-end')
      const footerBox = footer?.getBoundingClientRect()
      const footerTop = footerBox ? footerBox.top + y : document.documentElement.scrollHeight
      const footerH = footerBox?.height ?? 0
      // The footer's top once the page is scrolled to its end, the space between the words and the footer that does
      // not change (all but the space added here), and the footer's links then (its own top padding above them).
      const footerAtEnd = vh - footerH
      const between = footerTop - lastBottom - m.pad
      const links = [...(footer?.querySelectorAll<HTMLElement>('.site-end__inner > *') ?? [])].map((el) => el.getBoundingClientRect())
      const rowTop = footerAtEnd + (links.length ? Math.min(...links.map((r) => r.top + y)) - footerTop : 0)
      // The footer's rows once it has risen (from its first row to the window's bottom): the held picture keeps above
      // them (case-v16.css --stage-h; Harlie's QA pass, 2026-09-28: on landscape phones and short windows "Next
      // project" came up over the picture).
      cs?.style.setProperty('--end-rows', `${Math.ceil(vh - rowTop)}px`)
      /*
       * The page's end (Harlie's request, 2026-09-30): the words end with the last step's middle on the reading line,
       * where it is current, or higher where the footer needs the room: at least END_LINKS above the footer's links
       * (inside the footer's own top padding). Where the last step's heading would then rest in the top fade (short
       * phones, landscape phones), the words come down, as far as END_LINKS_MIN above the links, and the steps' top
       * fade gives way at the end just enough for the heading (endB, fade()), never closer than END_EDGE to what covers
       * the window's top. Where even that leaves too little room (a last step taller than the room between the band
       * or the bar and the links), the heading rests as low as it can. The page's own length does it: the space under
       * the words (the body's padding, or a negative margin for space taken back), at least enough for the footer to
       * meet the window's bottom (the page has no minimum height of its own here, case-v16.css).
       */
      const lastH = lastBottom - tops[n - 1]
      let settled = Math.min(read + lastH / 2, rowTop - END_LINKS)
      if (settled - lastH < m.b) settled = Math.max(settled, Math.min(m.b + lastH, rowTop - END_LINKS_MIN))
      m.endB = Math.min(m.b, Math.max((covered || FADE_PILL) + END_EDGE, settled - lastH))
      const fill = m.pad + vh - footerH - footerTop
      const pad = Math.round(Math.max(footerAtEnd - settled - between, fill))
      body.style.paddingBottom = pad > 0 ? `${pad}px` : ''
      body.style.marginBottom = pad < 0 ? `${pad}px` : ''
      if (pad !== m.pad) {
        m.pad = pad
        requestAnimationFrame(() => live && ScrollProgress.refresh())
      }
      // The current step is the one nearest the reading line: each after the first becomes current as the line passes
      // the middle of the space between it and the step before. The first is current from the start (Harlie's request).
      m.t = tops.map((top, k) => (k === 0 ? 0 : Math.max(0, (bottoms[k - 1] + top) / 2 - read)))
      m.end = Math.max(1, document.documentElement.scrollHeight - vh)
      /*
       * Where the page's scroll snaps (one scroll, one section: WHEEL_GAP, case-v16.css). The places are counted below
       * what covers the window's top (--snap-top, the root's scroll padding), so a step snapped by its middle has it on
       * the reading line, where it is current. A step too tall to stand whole there, between the steps' top fade and
       * the bottom fade (a small phone, a very short window), snaps by its heading instead, just below the top fade
       * (--snap-room, data-snap "start"); one taller than that room by as much as the steps' usual spacing apart for a
       * flick (near, below) has a second place, its end, with its last line above the bottom fade (--snap-room-end,
       * data-snap "through"), so it is read through before the next step (2026-09-30: the browsers' own free scrolling
       * within a place taller than the window was not to be had, Chromium stopping part way at 320x568 and WebKit not
       * at all; a second place only 9 to 35px on was passed by every flick).
       *
       * The introduction is a place of its own (the page's top, .cs__top, placed where what covers the window's top
       * ends, so its place is exactly the top: WebKit dropped a place held there by a margin once the scroll padding
       * was a phone band's, and its arrow keys stopped at the first step) only where the first step's place shows
       * something new and is not too close: where the first step is already whole in view at the top, above the bottom
       * fade (wide windows), the top is its place too, since it is current there from the start, and a first scroll
       * that only brought it the 9 to 69px onto the reading line would switch nothing; and where the two are less than
       * 0.6 of the steps' usual spacing apart (near), since a flick passes a place close to where the finger lets go
       * (2026-09-30, Chromium: a stop within one frame of the glide, 20 to 50px, is passed; 90px flicks passed first
       * steps 88 and 94px from the top at 390x844). Likewise the page's end (the footer): a place of its own only where
       * the footer's rows are not whole in view with the last step on the reading line and it is at least that far
       * beyond the last step (small phones; 58 to 83px beyond at 390x844, and a flick up from the end passed the last
       * step).
       */
      m.covered = covered
      m.room = Math.max(0, Math.round(m.b - covered))
      m.roomEnd = Math.round(0.12 * vh)
      root.style.setProperty('--snap-top', `${covered}px`)
      cs?.style.setProperty('--snap-room', `${m.room}px`)
      cs?.style.setProperty('--snap-room-end', `${m.roomEnd}px`)
      const topMark = cs?.querySelector<HTMLElement>(':scope > .cs__top')
      if (topMark) {
        const at = topMark.getBoundingClientRect().top + y
        topMark.style.top = `${(parseFloat(topMark.style.top) || 0) + covered - at}px`
      }
      const fits = boxes.map((b) => b.height / 2 <= Math.min(read - m.b, 0.88 * vh - read))
      const stepPlaces = boxes.map((_, k) => (fits[k] ? (tops[k] + bottoms[k]) / 2 - read : tops[k] - covered - m.room))
      const gaps = stepPlaces.slice(1).map((p, k) => p - stepPlaces[k]).sort((a, b) => a - b)
      const near = 0.6 * (gaps[Math.floor(gaps.length / 2)] ?? 0)
      const rowBottom = footerAtEnd + (links.length ? Math.max(...links.map((r) => r.bottom + y)) - footerTop : footerH)
      for (const [k, el] of [...list.children].entries()) {
        if (!(el instanceof HTMLElement)) continue
        const last = el.lastElementChild?.getBoundingClientRect()
        const through = !fits[k] && last !== undefined && last.bottom + y + m.roomEnd - vh >= stepPlaces[k] + Math.max(1, near)
        let snap = fits[k] ? '' : through ? 'through' : 'start'
        if (k === 0 && (bottoms[k] <= 0.88 * vh || (fits[k] && stepPlaces[k] < near))) snap = 'none'
        else if (k === n - 1 && fits[k] && (rowBottom + (m.end - stepPlaces[k]) <= vh + 0.5 || m.end - stepPlaces[k] < near)) snap = 'none'
        if (snap) el.dataset.snap = snap
        else delete el.dataset.snap
      }
      // The boxes that carry the fading window, and the offset in its box of each piece a page change carries
      // (transition/pieces.ts: the title, the details, the lede, each step), which takes the mask itself while the
      // change pictures the page (case-v16.css). The boxes' own positions are read as laid out (laidOut): where the
      // compositor holds them, they are drawn elsewhere.
      m.fade = intro ? [intro, list] : [list]
      // Held (HELD, 2026-09-30): each box reaches from above the page's top to below the window's bottom, as far as the
      // screen's height where that is more (a phone's toolbar going), so it covers the whole window wherever it is held
      // (case-v16.css), the introduction as much further as its slide lifts it; and its mask is placed at the page's
      // top in it, where the window is while it is held.
      const reach = Math.max(vh, window.screen?.width || 0, window.screen?.height || 0) + HOLD_ROOM
      for (const box of m.fade) {
        if (HELD) {
          // The reach it has now (from an earlier measure, or an earlier run of this effect), taken off first.
          const wasUp = parseFloat(box.style.getPropertyValue('--hold-up')) || 0
          const wasDown = parseFloat(box.style.getPropertyValue('--hold-down')) || 0
          const at = laidOut(box).top + y
          const up = Math.max(0, Math.ceil(at + wasUp)) + HOLD_ROOM
          const down = Math.max(0, Math.ceil(reach + (box === intro ? lift : 0) - (at + box.offsetHeight - wasDown)))
          if (up !== wasUp) box.style.setProperty('--hold-up', `${up}px`)
          if (down !== wasDown) box.style.setProperty('--hold-down', `${down}px`)
          const placed = laidOut(box).top + y
          box.style.setProperty('--fade-hold', `${(-placed).toFixed(2)}px`)
          holds.set(box, { at: placed })
        }
        const top = laidOut(box).top
        for (const piece of box.querySelectorAll<HTMLElement>(':scope > .story__step, :scope > .cs__words > :is(.cx-title, .cx-meta, .cx-lede)')) {
          piece.style.setProperty('--fade-o', `${(piece.getBoundingClientRect().top - top).toFixed(1)}px`)
        }
      }
    }
    /*
     * The fading window follows the window, not the words (case-v16.css): the offset of each box from the window's
     * top, read at every scroll (the boxes move with the page, and the title is refitted to its column as the fonts
     * arrive), the top fade's strength, grown in over the page's first scroll (fadeIn) so the title reads whole on
     * arrival, and the steps' top fade, giving way over the last FADE_IN px to the page's end (endB). Written only as
     * the page scrolls or is measured.
     *
     * Where the compositor holds the fading window (HELD, 2026-09-30), the boxes' offsets here only place the pieces'
     * own masks for a page change (with the introduction's slide), the top fade is always whole (its slide does the
     * growing in), and a box whose place in the page has moved since it was measured has its mask placed again.
     */
    const fade = (y: number) => {
      if (!cs) return
      if (!HELD) {
        const strength = Math.min(1, Math.max(0, y / m.fadeIn))
        if (strength !== m.strength) {
          m.strength = strength
          cs.style.setProperty('--fade-top', (1 - strength).toFixed(3))
        }
      }
      /*
       * Scrolling back up out of the page's end, the compositor draws the page about a frame further up than this
       * position (HELD): the steps' top fade is written for there, so it never shows lighter than it should (2026-09-30:
       * a frame at up to 29% over its strength in 360x640 phones' flicks), and at its exact place once the scrolling
       * stops. Only a steady scroll leads: an isolated jump is drawn where it lands.
       */
      const now = performance.now()
      const lead = HELD && lastY >= 0 && y < lastY ? (lastY - y) * Math.min(1, 20 / Math.max(1, now - lastAt)) : 0
      lastY = y
      lastAt = now
      const endB = (at: number) => Math.round((m.endB + (m.b - m.endB) * Math.min(1, Math.max(0, (m.end - at) / FADE_IN))) * 10) / 10
      const listB = endB(y - lead)
      if (m.b > 0 && listB !== m.listB) {
        m.listB = listB
        list.style.setProperty('--fade-b', `${listB}px`)
      }
      window.clearTimeout(settleEnd)
      if (listB !== endB(y)) settleEnd = window.setTimeout(() => live && fade(window.scrollY), 150)
      if (!HELD) {
        place()
        return
      }
      for (const box of m.fade) {
        const hold = holds.get(box)
        const at = laidOut(box).top + y
        if (hold && Math.abs(at - hold.at) > 0.05) {
          hold.at = at
          box.style.setProperty('--fade-hold', `${(-at).toFixed(2)}px`)
        }
      }
    }
    // Each box's offset from the window's top (and the introduction's slide), where its mask stands in the window: the
    // mask's place as the page scrolls where CaseStory writes it (not HELD), and the pieces' own masks for a page change.
    const place = () => {
      for (const box of m.fade) {
        const { top, slide } = laidOut(box)
        box.style.setProperty('--fade-y', `${(slide - top).toFixed(1)}px`)
      }
    }
    // Held, the pieces' masks are placed only as a page change begins to picture the page (:root[data-shuffle],
    // transition/pieces.ts), before it is pictured: written at every scroll, it restyled the boxes all through the
    // scroll, and WebKit drew a frame now and then without the mask (2026-09-30).
    const shuffleWatch = new MutationObserver(() => {
      if (document.documentElement.hasAttribute('data-shuffle')) place()
    })
    if (HELD) shuffleWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-shuffle'] })
    const update = () => {
      const y = window.scrollY
      fade(y)
      let k = 0
      while (k < n - 1 && y >= m.t[k + 1]) k++
      const span = Math.max(1, (k < n - 1 ? m.t[k + 1] : m.end) - m.t[k])
      setActive(k)
      follow.current?.(k, Math.min(1, Math.max(0, (y - m.t[k]) / span)), span)
    }
    const trigger = ScrollProgress.create({
      start: 0,
      end: 'max',
      onRefresh: () => {
        measure()
        update()
      },
      onUpdate: update,
    })
    // The header measures the pill's width again (Header.tsx, --pill-w on it) when its contents change size, as the
    // fonts arrive: the words' clearance (pillClear) is measured again then, with the page's end. Nothing runs
    // otherwise.
    const header = document.querySelector<HTMLElement>('.site-header')
    let pillW = header?.style.getPropertyValue('--pill-w') ?? ''
    const pillWatch = new MutationObserver(() => {
      const w = header?.style.getPropertyValue('--pill-w') ?? ''
      if (w === pillW) return
      pillW = w
      ScrollProgress.refresh()
    })
    if (header) pillWatch.observe(header, { attributes: true, attributeFilter: ['style'] })

    /*
     * The places the page's scroll snaps to, as laid out now (px of scroll, in order from the top). Read from the page
     * as the browser reads it for the snapping (the steps' boxes and their data-snap, measure()), so a move lands where
     * the snapping would; places within a pixel of each other are one (a step whose place is the page's top or end).
     * snapAreas: each box that makes a place (case-v16.css), with its place.
     */
    const snapAreas = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      const end = Math.max(0, document.documentElement.scrollHeight - vh)
      const read = (m.covered + vh) / 2
      const areas: { el: Element; at: number }[] = []
      const top = cs?.querySelector(':scope > .cs__top')
      if (top) areas.push({ el: top, at: 0 })
      for (const el of list.children) {
        const snap = el instanceof HTMLElement ? el.dataset.snap : 'none'
        if (snap === 'none') continue
        const box = el.getBoundingClientRect()
        if (snap === 'start' || snap === 'through') areas.push({ el, at: box.top + y - m.covered - m.room })
        else areas.push({ el, at: (box.top + box.bottom) / 2 + y - read })
        const last = el.lastElementChild
        if (snap === 'through' && last) areas.push({ el: last, at: last.getBoundingClientRect().bottom + y + m.roomEnd - vh })
      }
      const footer = document.querySelector('.site-end')
      if (footer) areas.push({ el: footer, at: end })
      return { end, areas: areas.map((a) => ({ el: a.el, at: Math.min(end, Math.max(0, a.at)) })) }
    }
    const places = () => {
      const { end, areas } = snapAreas()
      const at = [0, end, ...areas.map((a) => a.at)].sort((a, b) => a - b)
      const one: number[] = []
      for (const p of at) if (!one.length || p - one[one.length - 1] > 1) one.push(p)
      return one
    }
    // Where a move made here is going, until the page arrives there or its scrolling ends (AIM_WAIT the longest after
    // its last scroll, for a browser without scrollend).
    let aim: number | null = null
    let aimEnd = 0
    const aimed = () => {
      window.clearTimeout(aimEnd)
      aimEnd = window.setTimeout(() => (aim = null), AIM_WAIT)
    }
    // The page cannot scroll (the phone menu or a dialog open) and keeps its own keys and wheel then.
    const locked = () => root.classList.contains('is-dialog-open') || root.classList.contains('is-menu-open')
    /*
     * The places a touch may end at (onTouchStart): every box beyond them gives up its place for the time being
     * (data-snap-off, case-v16.css), so there is no place for a fling to pass to; all are back once the page is still
     * again, or for a move made here.
     */
    let narrowed = false
    const widen = () => {
      if (!narrowed) return
      narrowed = false
      for (const el of document.querySelectorAll('[data-snap-off]')) el.removeAttribute('data-snap-off')
    }
    // A move made here: to a place, the browser's smooth scroll (at once under reduced motion).
    const move = (to: number) => {
      widen()
      aim = to
      aimed()
      window.scrollTo({ top: to, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })
    }
    /*
     * A focus in what is held in view (2026-09-30): below 900px wide the header's bar, and on phones the band holding
     * the stage, are sticky, and a focus there that brings its target into view (Tab or Shift+Tab to Menu, a header
     * link, the recording's controls or the gallery's circles; a circle's arrow keys) was resolved by the snapping to
     * the place nearest the sticky box's own place in the page, near the top, though it was in view all along: from the
     * third section at 390x844 and 800x900 the page went to 0 in Chromium (at once, before the focusin) and to 0 or
     * 122 in WebKit (at the next frame). The page stays where it was, as before the snapping: put back at the focusin
     * (Chromium), and for WebKit the snapping is set aside for two frames (data-snap-hold, case-v16.css), so there is
     * nothing to move to, with any move in the meantime put back. A tap or a click there never moved it.
     */
    let seenY = window.scrollY
    let keep: number | null = null
    let keepFrame = 0
    const hold = () => {
      if (keep !== null && Math.abs(window.scrollY - keep) > 0.5) window.scrollTo({ top: keep, behavior: 'instant' })
    }
    const onFocusIn = (e: FocusEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('.site-header, .cs__media')) return
      keep = seenY
      hold()
      root.setAttribute('data-snap-hold', '')
      cancelAnimationFrame(keepFrame)
      keepFrame = requestAnimationFrame(() => {
        keepFrame = requestAnimationFrame(() => {
          hold()
          keep = null
          root.removeAttribute('data-snap-hold')
        })
      })
    }
    // The way the page last scrolled, and whether the safety net (onScrollEnd) has put it right since the last input.
    let lastDir = 0
    let righted = false
    /*
     * A touch goes one place at most, as the wheel does (2026-09-30, the review: at 390x844 Chromium's fling passed the
     * next place about half the time, the finger letting go 20 to 40px before it, the places there being about a
     * flick's length apart; scroll-snap-stop did not hold it, and neither did putting the page at the place as the fling
     * passed it, which Chromium's fling went on from). As a touch begins, only the place the page is at and the one on
     * each side of it (or, caught between two, those two) keep their boxes' places (narrowed, widen), before the
     * browser has taken up the fling and chosen where it ends: so the finger may go on or back one place, or stay. The
     * page is at rest at a place then, so nothing moves as the others give theirs up. Not for a pinch, nor with the
     * page locked (the phone menu, a dialog). The fingers down: touches.
     */
    let touches = 0
    let touchY = 0
    const onTouchStart = (e: TouchEvent) => {
      touches = e.touches.length
      touchY = window.scrollY
      // The finger has the page: a move made here is over.
      aim = null
      righted = false
      if (touches > 1 || locked()) {
        widen()
        return
      }
      const y = window.scrollY
      const { areas } = snapAreas()
      const at = places()
      const i = at.findIndex((p) => Math.abs(p - y) <= AT_PLACE)
      const lo = i >= 0 ? at[Math.max(0, i - 1)] : (at.filter((p) => p < y).pop() ?? 0)
      const hi = i >= 0 ? at[Math.min(at.length - 1, i + 1)] : (at.find((p) => p > y) ?? at[at.length - 1])
      narrowed = true
      for (const a of areas) a.el.toggleAttribute('data-snap-off', a.at < lo - 1 || a.at > hi + 1)
    }
    const onTouchEnd = (e: TouchEvent) => {
      touches = e.touches.length
      // A tap (the page has not moved): every place back at once, for whatever it does next.
      if (!touches && Math.abs(window.scrollY - touchY) < 1) widen()
    }
    // A mouse or a pen (the scroll bar, say) after a touch: every place back.
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') widen()
    }
    /*
     * The safety net (2026-09-30, the review): wherever the page's scrolling ends away from every place (a browser's
     * snapping stopping between two, as Chromium's did for keys pressed in quick succession), it goes on to the place it
     * was going to, or else the next place the way it was going. Once only until the next wheel, key or touch, so a
     * place the browser rounds differently can never set it going back and forth.
     */
    const onScrollEnd = () => {
      const y = window.scrollY
      // The places a touch kept, where they are now (a phone's toolbar may have gone meanwhile, moving them).
      const kept = narrowed && !touches ? snapAreas().areas.filter((a) => !a.el.hasAttribute('data-snap-off')).map((a) => a.at) : []
      if (!touches) widen()
      // A touch dragged further than one place (to the page's top or end, where the browser had no place to snap
      // to): back to the one place on.
      const lo = Math.min(...kept)
      const hi = Math.max(...kept)
      if (kept.length && !locked() && (y < lo - AT_PLACE || y > hi + AT_PLACE)) {
        move(y < lo ? lo : hi)
        return
      }
      // Arrived. A move not yet arrived stays under way: Firefox ended the scrolling at the place a move was going to
      // before it took up the next one, made meanwhile, on a busy page (2026-09-30).
      if (aim !== null && Math.abs(y - aim) <= AT_PLACE) {
        aim = null
        window.clearTimeout(aimEnd)
      }
      if (touches || righted || locked() || !root.hasAttribute('data-case-snap') || root.hasAttribute('data-snap-hold')) return
      const at = places()
      if (at.some((p) => Math.abs(p - y) <= AT_PLACE)) return
      const to = aim ?? (lastDir > 0 ? at.find((p) => p > y) : lastDir < 0 ? at.filter((p) => p < y).pop() : undefined) ?? at.reduce((a, b) => (Math.abs(b - y) < Math.abs(a - y) ? b : a))
      righted = true
      move(to)
    }
    const onScroll = () => {
      hold()
      const y = window.scrollY
      const step = y - seenY
      if (step) lastDir = Math.sign(step)
      seenY = y
      if (aim !== null) {
        if (Math.abs(y - aim) <= 1) {
          aim = null
          window.clearTimeout(aimEnd)
        } else aimed()
      }
    }
    /*
     * The keys (2026-09-30): Space and Shift+Space, Page Down and Up, and the arrow keys go one place on or back, from
     * where a move under way is going, so each press goes one further; a key held down goes on one place each time the
     * page has arrived, a step at a time. Home and End, and on a Mac Cmd+Up and Cmd+Down, go to the page's top and its
     * end, as before the snapping (WebKit's snapping stopped them at the next place like Page Down: at 1440x900 End
     * from the top went to the second step and Home from the end to the third). Left to whatever takes the key itself
     * (a field; Space on a button; the recording's seek line and the gallery's circles prevent theirs; a panel with its
     * own scroll, that way), and while a dialog or the phone menu is open.
     */
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || locked()) return
      const k = e.key
      const far = e.metaKey ? k === 'ArrowUp' || k === 'ArrowDown' : !e.shiftKey && (k === 'Home' || k === 'End')
      const dir =
        k === 'Home' || k === 'PageUp' || k === 'ArrowUp' ? -1
        : k === 'End' || k === 'PageDown' || k === 'ArrowDown' ? 1
        : k === ' ' ? (e.shiftKey ? -1 : 1)
        : 0
      if (!dir || (!far && (e.metaKey || (e.shiftKey && k !== ' ')))) return
      const t = e.target instanceof Element ? e.target : null
      if (t?.closest(KEEPS_KEYS) || (k === ' ' && t?.closest(KEEPS_SPACE)) || (!far && scrollsItself(t, dir))) return
      e.preventDefault()
      righted = false
      if (far) move(dir > 0 ? Math.max(0, document.documentElement.scrollHeight - window.innerHeight) : 0)
      else if (!e.repeat || aim === null) go(dir)
    }
    /** One place on (dir 1) or back (dir -1), from where the page is, or is going. */
    const go = (dir: number) => {
      const at = places()
      const y = aim ?? window.scrollY
      const i = at.findIndex((p) => Math.abs(p - y) <= AT_PLACE)
      // The next place that way (from between two: a touch's scroll still under way, the next one on).
      const to = i >= 0 ? at[i + dir] : dir > 0 ? at.find((p) => p > y) : at.filter((p) => p < y).pop()
      if (to !== undefined) move(to)
    }
    /*
     * The wheel gesture under way: its direction, its last event's time, the sample being gathered (its size, px, and
     * the time since the sample before, ms: events WHEEL_MERGE apart are one), its largest sample, whether it has eased
     * to half that, the smallest sample and speed (px/ms) since, how many samples in a row have risen well above them,
     * how far it has gone, whether it has moved the page, and whether it is the page's (not something under the pointer
     * that scrolls by itself). A new push is a rise to 1.5 times the eased low, in both size and speed, held over two
     * samples: the browsers deliver wheel events unevenly and merge those queued while the page is busy into one of
     * their summed size (2026-09-30: in Chromium a trackpad's momentum easing from 23 to 19px, then 27px for two merged;
     * in WebKit 62px, then 110px stamped 1ms later, as the move began; and in the review, WebKit's momentum tail of 4
     * and 5px, then 5px after 59ms and 12px 0ms later, taken for a second swipe and moving the page a second place), so
     * a single jump is not one. A speed is counted over at least a frame (16ms).
     */
    let wheel: { dir: number; at: number; size: number; dt: number; peak: number; eased: boolean; low: number; lowSpeed: number; rises: number; sum: number; moved: boolean; own: boolean } | null = null
    // Weighs the sample just gathered: whether it makes a new push.
    const weigh = (g: NonNullable<typeof wheel>) => {
      const speed = g.size / Math.max(16, g.dt)
      if (!g.eased) {
        g.peak = Math.max(g.peak, g.size)
        if (g.size > g.peak / 2) return false
        g.eased = true
      }
      if (g.size >= 6 && g.size > 1.5 * g.low && speed > 1.5 * g.lowSpeed) return ++g.rises >= 2
      g.rises = 0
      g.low = Math.min(g.low, g.size)
      g.lowSpeed = Math.min(g.lowSpeed, speed)
      return false
    }
    const onWheel = (e: WheelEvent) => {
      // Zooming (a pinch, or Ctrl and the wheel), a wheel event the browser will not let go of, a dialog or the phone
      // menu open: as before.
      if (e.defaultPrevented || !e.cancelable || e.ctrlKey || locked()) return
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const dy = e.deltaY * unit
      if (!dy || Math.abs(e.deltaX * unit) > Math.abs(dy)) return
      const dir = Math.sign(dy)
      const size = Math.abs(dy)
      const t = e.timeStamp
      let g = wheel
      const fresh = (peak: number) => ({ dir, at: t, size, dt: 16, peak, eased: false, low: Infinity, lowSpeed: Infinity, rises: 0, sum: 0, moved: false, own: !scrollsItself(e.target, dir) })
      if (!g || dir !== g.dir || t - g.at > WHEEL_GAP) g = wheel = fresh(0)
      else if (t - g.at < WHEEL_MERGE) {
        g.size += size
        g.at = t
      } else if (weigh(g)) g = wheel = fresh(g.size)
      else {
        g.dt = t - g.at
        g.size = size
        g.at = t
      }
      if (!g.own) return
      e.preventDefault()
      g.sum += size
      if (!g.moved && g.sum >= WHEEL_MIN) {
        g.moved = true
        righted = false
        go(dir)
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scrollend', onScrollEnd)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocusIn)
    return () => {
      live = false
      slideSheet?.remove()
      window.clearTimeout(settleEnd)
      window.clearTimeout(aimEnd)
      cancelAnimationFrame(keepFrame)
      root.removeAttribute('data-snap-hold')
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scrollend', onScrollEnd)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('pointerdown', onPointerDown)
      widen()
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocusIn)
      shuffleWatch.disconnect()
      pillWatch.disconnect()
      trigger.kill()
      body.style.paddingBottom = ''
      body.style.marginBottom = ''
      cs?.style.removeProperty('--story-lead')
      if (!--snapPages) {
        root.removeAttribute('data-case-snap')
        root.style.removeProperty('--snap-top')
      }
    }
  }, [steps.length])

  /*
   * The one moving line (Harlie's request, 2026-09-30: "make the active pink vertical line move with the active text
   * section rather than having multiple permanent rules"): each step holds a line, shown only while the step is
   * current (case-v16.css), so it goes with its step in a page change (transition/pieces.ts). As the current step
   * changes, the new step's line starts where the last one stands (part way along its own move, if that has not
   * finished), at its length, and moves and stretches into place beside its step over 0.35s, as the site's
   * --ease-standard eases (tokens.css). At once under reduced motion.
   */
  const reduced = useReducedMotion()
  const lineAt = useRef(-1)
  useLayoutEffect(() => {
    const prev = lineAt.current
    lineAt.current = active
    const list = listRef.current
    if (!list || prev < 0 || prev === active) return
    const lines = [...list.querySelectorAll<HTMLElement>(':scope > .story__step > .story__line')]
    const from = lines[prev]
    const to = lines[active]
    if (!from || !to) return
    const was = from.getBoundingClientRect()
    for (const line of [from, to]) line.getAnimations().forEach((a) => a.cancel())
    if (reduced) return
    const now = to.getBoundingClientRect()
    to.animate(
      [
        { transform: `translateY(${(was.top - now.top).toFixed(1)}px)`, height: `${was.height.toFixed(1)}px` },
        { transform: 'none', height: `${now.height.toFixed(1)}px` },
      ],
      { duration: 350, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    )
  }, [active, reduced])

  const bind = useCallback<Bind>((fn) => {
    follow.current = fn
  }, [])

  // Wide windows: the stage is fixed in the window for the whole page (Harlie's request), so the footer rises
  // beneath it at the end. Its holder takes the stage column's place and width (the right column, or the left on a
  // flipped page), measured from the column itself, so it follows whichever side the column is on.
  const mediaRef = useRef<HTMLDivElement>(null)
  const flip = useStageOnLeft()
  useLayoutEffect(() => {
    const col = mediaRef.current
    if (!col) return
    const place = () => {
      const box = col.getBoundingClientRect()
      col.style.setProperty('--hold-left', `${box.left.toFixed(1)}px`)
      col.style.setProperty('--hold-width', `${box.width.toFixed(1)}px`)
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(col)
    window.addEventListener('resize', place)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', place)
    }
  }, [])

  return (
    <div className="cs story" data-flip={flip || undefined}>
      {/* The page's top as a place the scroll snaps to (WHEEL_GAP), placed where what covers the window's top ends. */}
      <span className="cs__top" aria-hidden="true" />
      <header className="cs__intro">
        {/* The introduction's words, as one: where the compositor holds the fading window, this is what moves back by
            as much as the introduction's fade slides (case-v16.css, 2026-09-30), so its words keep their own transforms. */}
        <div className="cs__words">
          <CaseTitle title={title} meta={meta} />
          <div className="cx-lede">{lede}</div>
        </div>
      </header>
      <div ref={mediaRef} className="cs__media story__media">
        <div className="story__hold">
          <StageView stage={stage} active={active} bind={bind} name={title} />
        </div>
      </div>
      <div className="cs__body">
        <ol ref={listRef} className="story__steps" role="list">
          {steps.map((s, k) => (
            <li key={s.title} className="story__step" data-current={k === active || undefined}>
              <span className="story__line" aria-hidden="true" />
              <h2 className="story__title">{s.title}</h2>
              {/* A step with two paragraphs (Harlie's text of 2026-09-30) passes them as an array. */}
              {Array.isArray(s.text) ? s.text.map((t, i) => <p key={i} className="story__text">{t}</p>) : <p className="story__text">{s.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/** A transparent control over the whole picture: a click opens it larger (Harlie's request). */
function ZoomButton({ onZoom, label = 'Enlarge image' }: { onZoom: (trigger: HTMLElement) => void; label?: string }) {
  return <button type="button" className="story__zoom" aria-label={label} onClick={(e) => onZoom(e.currentTarget)} />
}

/**
 * A recording opened larger, as the films open (FilmDialog; Harlie's QA pass, 2026-09-28: the recordings' view had an
 * empty bar, the browser's own controls over the table's lower rows, and a scroll lock of its own). The project's
 * recording named in the bar beside Close; the recording, muted and looping at the page's speed from the moment the
 * stage was showing (so it opens on the current section), fading in over the black once its first frame is on screen;
 * below it the site's compact controls (DemoControls: play or pause, seek, the sound control shown disabled, full
 * screen). The page behind is locked like every larger view (html.is-dialog-open). Close, Escape or a click outside
 * close it with the shared fade; focus returns to the picture.
 */
function VideoDialog({ src, poster, title, width, height, duration, start, rate, trigger, onClose }: { src: string; poster: string; title: string; width: number; height: number; duration: number; start: number; rate: number; trigger: HTMLElement | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const fullscreenRef = useRef<HTMLButtonElement>(null)
  const stopRef = useRef<() => void>(undefined)
  const [ready, setReady] = useState(false)
  /** This copy is in the browser's full screen (the bar's Full screen control): its own controls while it lasts. */
  const [fullscreen, setFullscreen] = useState(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    document.documentElement.classList.add('is-dialog-open')
    closeRef.current?.focus()
    // No dialog.close() here: that would report a close when React re-runs this effect in development; unmounting
    // removes the dialog from the top layer anyway.
    return () => {
      document.documentElement.classList.remove('is-dialog-open')
      stopRef.current?.()
    }
  }, [])

  // Leaving full screen returns focus to its control.
  useEffect(() => {
    const onChange = () => {
      const on = Boolean(videoRef.current) && document.fullscreenElement === videoRef.current
      setFullscreen((was) => {
        if (was && !on) requestAnimationFrame(() => fullscreenRef.current?.focus({ preventScroll: true }))
        return on
      })
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused || v.ended) v.play().catch(() => {})
    else v.pause()
  }

  return (
    <dialog
      ref={ref}
      className="image-dialog cs-video-dialog"
      aria-labelledby={titleId}
      onClose={() => {
        onClose()
        if (trigger?.isConnected) trigger.focus({ preventScroll: true })
      }}
      onCancel={closeOnCancel}
      onClick={(e) => {
        if (e.target === ref.current) closeWithFade(ref.current)
      }}
    >
      <div className="image-dialog__panel">
        <div className="image-dialog__bar">
          <p id={titleId} className="image-dialog__count t-small">
            {title}
          </p>
          <div className="image-dialog__controls">
            <button ref={closeRef} type="button" className="button button--secondary button--small" onClick={() => closeWithFade(ref.current)}>
              <CloseIcon />
              Close
            </button>
          </div>
        </div>
        <div className="cs-video-dialog__stage cs-video-dialog__stage--player" style={{ '--r': width / height } as CSSProperties}>
          <div className="cs-player cs-video-dialog__player">
            <div className="cs-video-dialog__screen">
              <video
                ref={videoRef}
                className="cs-video-dialog__video"
                data-ready={ready || undefined}
                src={src}
                poster={poster}
                width={width}
                height={height}
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                controls={fullscreen}
                aria-label={title}
                onClick={fullscreen ? undefined : togglePlay}
                onLoadedMetadata={(e) => {
                  // The same speed and moment as the page's recording.
                  const v = e.currentTarget
                  v.defaultPlaybackRate = rate
                  v.playbackRate = rate
                  v.currentTime = start
                  stopRef.current = onFramePresented(v, () => setReady(true))
                  v.play().catch(() => setReady(true))
                }}
              />
            </div>
            <DemoControls
              videoRef={videoRef}
              title={title}
              duration={duration}
              hasAudio={false}
              onExpand={() => {
                if (videoRef.current) enterFullscreen(videoRef.current)
              }}
              expandLabel="Show the recording full screen"
              expandRef={fullscreenRef}
            />
          </div>
        </div>
      </div>
    </dialog>
  )
}

function StageView({ stage, active, bind, name }: { stage: Stage; active: number; bind: Bind; name: string }) {
  if (stage.kind === 'video') return <VideoStage stage={stage} bind={bind} name={name} />
  if (stage.kind === 'phones') return <PhoneRow stage={stage} active={active} />
  return <GalleryStage stage={stage} active={active} />
}

/**
 * The screenshots of CafePress UK and the AI Leasing Agent in a card-hover gallery (Harlie's request, 2026-09-29: "Try
 * with the pages with multiple photos try something like this but with three small circles on the right side", with
 * 21st.dev's Card Hover; CardHover in src/components/ui; it replaced the image accordion of 2026-09-28). The current
 * step's picture fills the card and every picture stands as a small circle in a row centred under it (on its right
 * until Harlie's request of 2026-09-30); hovering, focusing or clicking
 * a circle shows its picture for as long as that step is current, and scrolling to another step shows that step's.
 * Clicking the card enlarges the picture. A picture's own `label`, or the stage's, stands under the card.
 */
function GalleryStage({ stage, active }: { stage: Extract<Stage, { kind: 'layers' }>; active: number }) {
  const dialog = useImageDialog()
  const items = stage.layers.map((l) => ({ image: l.image, alt: l.alt, label: l.label }))
  const ids = items.map((i) => i.image)
  const step = Math.max(0, Math.min(active, stage.show.length - 1))
  const stepPicture = Math.max(0, Math.min(stage.show[step] ?? 0, items.length - 1))
  // A picture the reader chose by hand, kept while the step it was chosen on is current.
  const [picked, setPicked] = useState<{ step: number; index: number } | null>(null)
  const current = picked && picked.step === step ? picked.index : stepPicture
  return (
    <div className="story__stage story__cards">
      <CardHover
        items={items}
        active={current}
        aspect={stage.aspect}
        background={stage.screen}
        sizes={STAGE_SIZES}
        label={stage.label}
        onActivate={(index) => setPicked({ step, index })}
        onEnlarge={(index, trigger) => dialog.open(ids[index], trigger, { gallery: ids })}
      />
    </div>
  )
}

/**
 * The phones (Jumpstart): the three cutouts in one row, in Harlie's order (Profile, Home, Community, as on the homepage
 * tile), the current section's phone brought forward and the other two a little smaller and dimmed (case-v16.css).
 * Harlie's request, 2026-09-28: the phones "back to how they were before" the scroll stack. Each phone reads its own
 * description (media.ts; Harlie's QA pass, 2026-09-28: they were named only "Profile screen" and so on).
 */
function PhoneRow({ stage, active }: { stage: Extract<Stage, { kind: 'phones' }>; active: number }) {
  const dialog = useImageDialog()
  // Each phone's width follows its own proportions, so phones of different shapes stand at the same height.
  const aspects = stage.phones.map((p) => getImage(p.image).width / getImage(p.image).height)
  const widest = Math.max(...aspects)
  const holds = (p: (typeof stage.phones)[number]) => (typeof p.step === 'number' ? p.step === active : p.step.includes(active))
  return (
    <div className="story__stage story__phones">
      {stage.phones.map((p, k) => (
        <div key={p.image} className="story__phone" data-on={holds(p) || undefined} style={{ width: `${((aspects[k] / widest) * 100).toFixed(2)}%` }}>
          <ResponsiveImage image={p.image} sizes={PHONE_SIZES} priority />
        </div>
      ))}
      <ZoomButton
        onZoom={(trigger) => {
          if (stage.all) {
            dialog.open(stage.all, trigger, { gallery: [stage.all] })
            return
          }
          const ids = stage.phones.map((p) => p.image)
          dialog.open(stage.phones.find(holds)?.image ?? ids[0], trigger, { gallery: ids })
        }}
      />
      {stage.label && <p className="story__media-label">{stage.label}</p>}
    </div>
  )
}

/**
 * Plays a muted recording while it is on screen and pauses it off screen or in a hidden tab (and while `wanted` says
 * not, e.g. held on a segment's last frame). The site pauses every video in a hidden tab (useMediaPlayback), so the
 * recording starts again here when the tab is shown. Returns `sync`, to apply a change of `wanted`, and the cleanup.
 */
function playWhenVisible(video: HTMLVideoElement, wanted: () => boolean = () => true) {
  let seen = false
  const sync = () => {
    if (seen && document.visibilityState === 'visible' && wanted()) void video.play().catch(() => {})
    else video.pause()
  }
  const io = new IntersectionObserver(([e]) => {
    seen = e.isIntersecting
    sync()
  })
  io.observe(video)
  document.addEventListener('visibilitychange', sync)
  return {
    sync,
    stop: () => {
      io.disconnect()
      video.pause()
      document.removeEventListener('visibilitychange', sync)
    },
  }
}

/** The recording: playing by itself (`play`, `free`), and one still per step under reduced motion. */
function VideoStage({ stage, bind, name }: { stage: Extract<Stage, { kind: 'video' }>; bind: Bind; name: string }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  const [zoom, setZoom] = useState<{ from: HTMLElement; at: number } | null>(null)
  /*
   * The control line under the recording (MiniControls; Harlie's request, 2026-09-30). A skip or a seek takes over
   * (`manual`): the recording is no longer brought back into the current step's part until the step changes, when it
   * follows the steps again. A pause the visitor made (`userPaused`) lasts, across step changes too, until they press
   * play. `ctl` is how the controls reach the playback logic of the effect below that is running.
   */
  const manual = useRef(false)
  const userPaused = useRef(false)
  const ctl = useRef<{ use: () => void; play: () => void; pause: () => void } | null>(null)

  // Play mode: the recording plays at its own pace while on screen, within the current step's segment so the picture
  // always supports the step being read (the step changes, the recording moves to that step's part): on a loop, or
  // once and held on its last frame ('hold'); it runs faster while the page is scrolled (up to four times, by the speed
  // of the scroll), settling back when it stops. Reduced motion: the step's still, no playback.
  useEffect(() => {
    const video = ref.current
    if (!video || !stage.play || stage.free) return
    const last = stage.segments.length - 1
    let seg = 0
    /** Held on the current segment's last frame. */
    let held = false
    const range = () => stage.segments[Math.min(seg, last)]
    const reducedNow = reduced
    const playing = reducedNow ? null : playWhenVisible(video, () => !held && !userPaused.current)
    const show = (i: number) => {
      seg = Math.max(0, Math.min(i, last))
      // Under reduced motion a recording the visitor played stops on the new step's still.
      if (reducedNow) video.pause()
      video.currentTime = reducedNow ? stage.stills[seg] : range()[0]
      if (held) {
        held = false
        playing?.sync()
      }
    }
    bind((k) => {
      const i = Math.max(0, Math.min(k, last))
      if (i === seg) return
      // A new step: the recording follows the steps again (a visitor's pause still holds).
      manual.current = false
      show(i)
    })
    ctl.current = {
      use: () => {
        manual.current = true
        held = false
      },
      play: () => {
        userPaused.current = false
        if (playing) playing.sync()
        else void video.play().catch(() => {})
      },
      pause: () => {
        userPaused.current = true
        video.pause()
      },
    }
    // Keep playback inside the current segment: checked on every presented frame (timeupdate comes only every quarter
    // second, late enough for the next section's frames, or the file's first, to flash), going back to the start (or
    // holding) two frames before the end, sooner while playback is sped up. The file itself never loops.
    const lead = (1 / 24) * 2
    const keep = (t: number) => {
      if (manual.current) return
      const [a, b, hold] = range()
      if (t < a - 0.3) video.currentTime = a
      else if (t + lead * video.playbackRate < b) return
      else if (!hold) video.currentTime = a
      else if (!held) {
        held = true
        playing?.sync()
      }
    }
    const onTime = () => {
      if (!reducedNow) keep(video.currentTime)
    }
    const onEnded = () => {
      if (reducedNow) return
      manual.current = false
      video.currentTime = range()[0]
      held = false
      playing?.sync()
    }
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('ended', onEnded)
    let watch = 0
    let watching = !reducedNow
    const onFrame = (_now: number, meta: { mediaTime: number }) => {
      if (!watching) return
      if (!video.seeking) keep(meta.mediaTime)
      watch = video.requestVideoFrameCallback(onFrame)
    }
    const onRaf = () => {
      if (!watching) return
      if (!video.seeking) keep(video.currentTime)
      watch = requestAnimationFrame(onRaf)
    }
    const perFrame = 'requestVideoFrameCallback' in video
    if (watching) watch = perFrame ? video.requestVideoFrameCallback(onFrame) : requestAnimationFrame(onRaf)
    const stopWatch = () => {
      watching = false
      if (perFrame) video.cancelVideoFrameCallback(watch)
      else cancelAnimationFrame(watch)
    }
    const onMeta = () => show(seg)
    if (video.readyState >= 1) show(seg)
    else video.addEventListener('loadedmetadata', onMeta, { once: true })
    if (!playing) {
      return () => {
        bind(null)
        ctl.current = null
        stopWatch()
        video.removeEventListener('timeupdate', onTime)
        video.removeEventListener('ended', onEnded)
        video.removeEventListener('loadedmetadata', onMeta)
      }
    }
    // Its own speed (stage.rate), and faster still while the page scrolls.
    const base = stage.rate ?? 1
    video.defaultPlaybackRate = base
    video.playbackRate = base
    let frame = 0
    let rate = base
    let boost = 0
    let lastY = window.scrollY
    let lastT = performance.now()
    let scrolledAt = 0
    const tick = () => {
      frame = 0
      if (performance.now() - scrolledAt > 140) boost = 0
      rate += (base + boost - rate) * 0.18
      if (Math.abs(rate - base - boost) < 0.01) rate = base + boost
      video.playbackRate = Math.max(base, Math.min(4, rate))
      if (rate > base + 0.005 || boost) frame = requestAnimationFrame(tick)
    }
    const onScroll = () => {
      const now = performance.now()
      const speed = Math.abs(window.scrollY - lastY) / Math.max(1, now - lastT)
      lastY = window.scrollY
      lastT = now
      scrolledAt = now
      boost = Math.min(3, speed * 2.2)
      if (!frame) frame = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      bind(null)
      ctl.current = null
      playing.stop()
      window.removeEventListener('scroll', onScroll)
      stopWatch()
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('loadedmetadata', onMeta)
      cancelAnimationFrame(frame)
    }
  }, [stage, bind, reduced])

  // Free: the whole recording plays by itself on a loop (Harlie's request), whatever the step, pausing off screen or
  // in a hidden tab. Reduced motion: the current step's still, changing with the step (Harlie's QA pass, 2026-09-28:
  // the Spreadsheet Agent's second still, the cell's source detail, was never shown).
  useEffect(() => {
    const video = ref.current
    if (!video || !stage.free) return
    if (reduced) {
      let seg = 0
      const still = () => {
        video.pause()
        video.currentTime = stage.stills[Math.min(seg, stage.stills.length - 1)]
      }
      bind((k) => {
        const i = Math.max(0, k)
        if (i === seg) return
        seg = i
        if (video.readyState >= 1) still()
      })
      ctl.current = {
        use: () => {},
        play: () => void video.play().catch(() => {}),
        pause: () => video.pause(),
      }
      if (video.readyState >= 1) still()
      else video.addEventListener('loadedmetadata', still, { once: true })
      return () => {
        bind(null)
        ctl.current = null
        video.removeEventListener('loadedmetadata', still)
      }
    }
    video.defaultPlaybackRate = stage.rate ?? 1
    video.playbackRate = stage.rate ?? 1
    const playing = playWhenVisible(video, () => !userPaused.current)
    ctl.current = {
      use: () => {},
      play: () => {
        userPaused.current = false
        playing.sync()
      },
      pause: () => {
        userPaused.current = true
        video.pause()
      },
    }
    return () => {
      ctl.current = null
      playing.stop()
    }
  }, [stage, bind, reduced])

  return (
    <>
      <MediaBox
        aspect={stage.width / stage.height}
        zoomLabel={stage.action ?? 'Enlarge recording'}
        onZoom={(trigger) => setZoom({ from: trigger, at: ref.current?.currentTime ?? 0 })}
        below={
          <MiniControls
            video={ref}
            label={`${name} recording`}
            marks={stage.segments.map(([start]) => start)}
            onUse={() => ctl.current?.use()}
            onPlay={() => ctl.current?.play()}
            onPause={() => ctl.current?.pause()}
          />
        }
      >
        <video
          ref={ref}
          className="story__video"
          src={stage.src}
          poster={stage.poster}
          width={stage.width}
          height={stage.height}
          muted
          loop={stage.free || undefined}
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-label={stage.label}
        />
      </MediaBox>
      {/* Outside the picture, so the larger view's pointer never tilts or enlarges the picture behind it. The whole
          recording (dialogSrc) when the page plays a shorter cut of it. */}
      {zoom && (
        <VideoDialog
          src={stage.dialogSrc ?? stage.src}
          poster={stage.poster}
          title={`${name} recording`}
          width={stage.width}
          height={stage.height}
          duration={stage.segments[stage.segments.length - 1][1]}
          start={zoom.at}
          rate={stage.rate ?? 1}
          trigger={zoom.from}
          onClose={() => setZoom(null)}
        />
      )}
    </>
  )
}
