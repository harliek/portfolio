import '../../styles/case.css'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { CASE_BAR } from '../../config/stage'
import { getImage, type ImageId } from '../../content/media'
import { PHONE_SIZES, STAGE_SIZES } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
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
     * the box's top in the page).
     */
    const m = { t: [0], end: 1, pad: 0, lead: 0, clear: 0, fade: [] as HTMLElement[], fadeIn: FADE_IN, strength: -1, b: 0, endB: 0, listB: -1 }
    const holds = new Map<HTMLElement, { at: number }>()
    const cs = list.closest<HTMLElement>('.cs')
    const intro = cs?.querySelector<HTMLElement>(':scope > .cs__intro')
    const body = list.parentElement ?? list
    // A refresh queued below is dropped once the page has gone (the next page's triggers refresh themselves).
    let live = true
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
    return () => {
      live = false
      slideSheet?.remove()
      window.clearTimeout(settleEnd)
      shuffleWatch.disconnect()
      pillWatch.disconnect()
      trigger.kill()
      body.style.paddingBottom = ''
      body.style.marginBottom = ''
      cs?.style.removeProperty('--story-lead')
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
