import '../../styles/case.css'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { getImage, type ImageId } from '../../content/media'
import { PHONE_SIZES, STAGE_SIZES } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ScrollTrigger } from '../../lib/gsap'
import { DemoControls } from '../media/DemoControls'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { useImageDialog } from '../media/ImageDialog'
import { closeOnCancel, closeWithFade } from '../media/dialogExit'
import { CloseIcon } from '../media/ExpandIcon'
import { enterFullscreen } from '../media/fullscreen'
import { onFramePresented } from '../media/videoFrame'
import { CardHover } from '../ui/card-hover'
import { CaseTitle } from './CasePage'

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
 *   small circle on its right (`show` picks the layer per step; hovering, focusing or clicking a circle shows it);
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
 * How far the phones' band scrolls with the page before it is held under the header (px): from where the page places
 * it, under the introduction, to its sticky top. Read from the introduction, since the band's own box reports where
 * it is held.
 */
function bandTravel(band: HTMLElement) {
  const intro = band.previousElementSibling
  const style = getComputedStyle(band)
  const flowTop = (intro ? intro.getBoundingClientRect().bottom + window.scrollY : 0) + (parseFloat(style.marginTop) || 0)
  return Math.max(0, flowTop - (parseFloat(style.top) || 0))
}

/** The reading line (a share of the window's height from the top): a step becomes current when its top reaches it. */
const line = () => (window.matchMedia(PHONE).matches ? 0.66 : 0.5)

/** A heading's place on the page (px from the document's top) and the highest it may rest in the window (px). */
interface HeadingBand {
  top: number
  bottom: number
  safe: number
}

/**
 * The headings that must never be left under the navigation (Harlie's brief, 2026-09-28): the title with its details
 * (they go together), and each step's heading. Each one's safe line is the navigation's safe area, the same offset a
 * link to it scrolls by: the heading's own scroll margin (the header's safe area, base.css, and on phones the band held
 * under the header; case-v16.css), with any scroll padding on the root.
 */
function headingBands(root: HTMLElement, y: number): HeadingBand[] {
  const padTop = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  const band = (first: HTMLElement | null, last: HTMLElement | null = first): HeadingBand[] => {
    if (!first || !last) return []
    const safe = padTop + (parseFloat(getComputedStyle(first).scrollMarginTop) || 0)
    return [{ top: first.getBoundingClientRect().top + y, bottom: last.getBoundingClientRect().bottom + y, safe }]
  }
  const steps = [...root.querySelectorAll<HTMLElement>('.cs__body .story__title')].flatMap((el) => band(el))
  return [...band(root.querySelector('.cx-title'), root.querySelector('.cs__intro .cx-meta')), ...steps]
}

/** A line of the words (px: from the document's top, and from the window's left). */
interface TextLine {
  top: number
  bottom: number
  left: number
  right: number
  /** The step it belongs to (-1: the introduction), and whether it is that step's heading. */
  step: number
  head: boolean
  /** The details under the title: their glow reaches a few pixels past the letters. */
  glow: boolean
}

/** Every line of the words (the introduction and the steps), each text line once, however it is split. */
function textLines(root: HTMLElement, y: number): TextLine[] {
  const lines: TextLine[] = []
  const range = document.createRange()
  const steps = [...root.querySelectorAll('.cs__body .story__step')]
  for (const block of root.querySelectorAll(':scope > .cs__intro, :scope > .cs__body')) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement
      if (!node.textContent?.trim() || !parent || parent.closest('[aria-hidden="true"]')) continue
      const stepEl = parent.closest('.story__step')
      const step = stepEl ? steps.indexOf(stepEl) : -1
      const head = Boolean(parent.closest('.story__title, .cx-title'))
      const glow = Boolean(parent.closest('.cx-meta'))
      range.selectNodeContents(node)
      for (const r of range.getClientRects()) {
        if (r.width < 1 || r.height < 1) continue
        const top = r.top + y
        const bottom = r.bottom + y
        const same = lines.find((l) => l.step === step && l.head === head && Math.abs(l.top + l.bottom - top - bottom) < 8)
        if (!same) lines.push({ top, bottom, left: r.left, right: r.right, step, head, glow })
        else Object.assign(same, { top: Math.min(same.top, top), bottom: Math.max(same.bottom, bottom), left: Math.min(same.left, r.left), right: Math.max(same.right, r.right) })
      }
    }
  }
  return lines
}

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
 * floats or while it gathers into the pill.
 */
function navShade(): Shade {
  const header = document.querySelector<HTMLElement>('.site-header')
  const width = document.documentElement.clientWidth
  const pill = Math.min(parseFloat(header ? getComputedStyle(header).getPropertyValue('--pill-w') : '') || 720, width - 32)
  // A few pixels of room around the pill, where a line would still read as running under it.
  return { top: 3, bottom: 57, left: (width - pill) / 2 - 3, right: (width + pill) / 2 + 3 }
}

/** The header's bar is opaque (below 900px on the case studies, layout.css): nothing shows through it. */
function barOpaque() {
  const header = document.querySelector<HTMLElement>('.site-header')
  if (!header) return false
  const bar = getComputedStyle(header, '::before')
  const alpha = /rgba?\([^)]*[,/]\s*([\d.]+)\s*\)/.exec(bar.backgroundColor)
  const opaque = bar.backgroundColor.startsWith('rgb(') || (alpha !== null && Number(alpha[1]) > 0.9)
  return opaque && (parseFloat(bar.opacity) || 0) > 0.9
}

/** What covers the words once the page is scrolled by some amount (px, in the window). */
interface Cover {
  /**
   * Ranges of the window's height where none of the words show: above its top edge, or under the header's bar, and on
   * phones under the held band.
   */
  hidden: readonly (readonly [number, number])[]
  /** A line within this many px below a covered range crowds its edge (on phones, the band's fade). */
  near: number
  /** The floating pill, over the words' top on wide screens (lines under it are charged by their area), if any. */
  pill: Shade | null
}

/**
 * The scroll each step keeps (px; Harlie's QA pass, 2026-09-28, the short told pages): about 18% of the window's
 * height, 140 to 220px, more than one notch of a mouse wheel (40 to 100px), so a notch never passes over a step.
 * A page whose words and picture fit the window still scrolls this far for each step after the first. At 12px a step
 * (the previous value) one notch went from the first step to the last and the middle picture was never shown.
 */
const stepScroll = () => Math.round(Math.min(220, Math.max(140, 0.18 * window.innerHeight)))

/** What settleEnd weighs, in px: in the window once the page is scrolled to its end, unless said otherwise. */
interface EndRoom {
  /** Where the words would end: level with the held picture (Harlie's request). */
  rest: number
  /** The lowest the words may end: clear of the footer's links. */
  lowest: number
  /** Where the words end on the page (from the document's top); at or below it, the page does not scroll at all. */
  last: number
  /** The least the page scrolls (stepScroll for each step after the first, and on phones the band's travel). */
  least: number
  /** Above this a heading is wholly out of view: the window's top, or the header's bar, or on phones the held band. */
  covered: number
  /** The footer's links (the top of its first row, the bottom of its last). */
  row: { top: number; bottom: number }
  /** The window's height. */
  vh: number
  bands: readonly HeadingBand[]
  lines: readonly TextLine[]
  /** What covers the words at a given scroll. */
  cover: (scroll: number) => Cover
  /** Phones: the last step's whole block, kept below the band at the end where the room allows. */
  tail?: HeadingBand
}

/**
 * Where the words end in the window once the page is scrolled to its end (Harlie's brief, 2026-09-28: headings "fully
 * visible at settled states", and no text left behind the navigation). The page rests by itself at its top and at its
 * end, and on a short page it scrolls only a little, so a title could stop half under the floating navigation there.
 * From `rest`, first downwards (less scroll, never less than `least`): each heading left across its safe line comes
 * down to it, and the footer's links are whole on opening (not cut by the window's bottom), as long as the words stay
 * clear of them; failing that, the headings alone come down. Otherwise upwards (more scroll), until each heading in the
 * way is wholly out of view, and the footer's links wholly below the window on opening.
 *
 * Then, near that end, the end where the words are cut least is chosen, the headings' rule still kept (cost): a line
 * of words is the unit, not a whole block, since blocks are closer together than the safe area is tall. Harlie's QA
 * pass, 2026-09-28: at 1024 to 1536px a line rested half across the window's top edge (only lines under the pill were
 * counted), on tablets the introduction was sliced by the header's black bar, and on phones a step's words showed under
 * the band with its heading hidden. A cut line is never chosen where a whole one can be. Where the words are taller
 * than the window and the pill spans their column (about 900 to 1150px wide), the window's top always holds a line of
 * the introduction or a step, since a heading may not rest in the safe area; that line is then whole, reaching under
 * the pill's end as little as it can.
 */
function settleEnd({ rest, lowest, last, least, covered, row, vh, bands, lines, cover, tail }: EndRoom) {
  // The page's scroll once the words end at `end`, and a heading's place then.
  const scroll = (end: number) => Math.max(0, last - end)
  const at = (end: number, h: HeadingBand) => ({ top: h.top - scroll(end), bottom: h.bottom - scroll(end) })
  const across = (end: number) =>
    bands.find((h) => {
      const p = at(end, h)
      return p.bottom > covered && p.top < h.safe
    })
  // On opening (the page at its top), the footer's links are cut by the window's bottom.
  const cut = (end: number) => row.bottom + scroll(end) > vh && row.top + scroll(end) < vh
  // The lowest the words may end and still leave the story its least scroll.
  const most = Math.min(lowest, last - least)
  // Phones: low enough for the last block to be whole below the band, where the footer leaves room for it.
  const start = Math.min(tail ? Math.max(rest, tail.safe + tail.bottom - tail.top + 1) : rest, most)
  // A pixel or two to spare either way, so rounding the space to whole pixels never leaves a sliver across.
  const down = (links: boolean) => {
    let end = start
    for (let k = 0; k <= bands.length + 2; k++) {
      const h = across(end)
      if (h) end += h.safe - at(end, h).top + 1
      else if (links && cut(end)) end = last - Math.max(0, vh - row.bottom - 1)
      else return end
      if (end > most) return null
    }
    return null
  }
  const up = () => {
    let end = start
    for (let k = 0; k <= bands.length + 2; k++) {
      const h = across(end)
      if (h) end -= at(end, h).bottom - covered + 2
      else if (cut(end)) end = last - (vh - row.top + 1)
      else break
    }
    return end
  }
  const found = down(true) ?? down(false) ?? up()
  // How much of the words is cut at `end`: 1000 for each line cut across the edge of what covers it (the window's top,
  // the header's bar, the band's edges), 200 for a line crowding such an edge, 300 for each step whose words show
  // while its heading is hidden, and on wide screens the area (px²) of the lines under the pill, a capsule.
  const cost = (end: number) => {
    const s = scroll(end)
    const { hidden, near, pill } = cover(s)
    // The covered ranges joined where they meet (the band held right under the header's bar), and their edges.
    const merged: [number, number][] = []
    for (const [a, b] of [...hidden].sort((p, q) => p[0] - q[0])) {
      const prev = merged[merged.length - 1]
      if (prev && a <= prev[1] + 0.5) prev[1] = Math.max(prev[1], b)
      else merged.push([a, b])
    }
    const edges = merged.flatMap(([a, b]) => [a, b]).filter(Number.isFinite)
    const headHidden = new Map<number, boolean>()
    const bodyShown = new Map<number, boolean>()
    let sum = 0
    for (const l of lines) {
      const top = l.top - s
      const bottom = l.bottom - s + (l.glow ? 6 : 0)
      // Cut: across an edge, with a pixel to spare either side (the space under the words is rounded to whole pixels).
      const across = edges.some((e) => top < e + 1 && bottom > e - 1)
      const shown = !across && !merged.some(([a, b]) => top >= a - 1 && bottom <= b + 1)
      if (across) sum += 1000
      else if (shown && merged.some(([, b]) => top >= b - 1 && top < b + near)) sum += 200
      if (l.step >= 0) {
        if (l.head) headHidden.set(l.step, (headHidden.get(l.step) ?? true) && !shown)
        else if (shown) bodyShown.set(l.step, true)
      }
      if (!pill || !shown || bottom <= pill.top + 1 || top >= pill.bottom - 1) continue
      // Under the pill (a capsule): a line its lower edge cuts counts as cut; a whole line under it, by how far it
      // reaches in (px, on average), since at some widths the words' column always runs under the pill's end.
      const r = (pill.bottom - pill.top) / 2
      const mid = pill.top + r
      let area = 0
      for (let y = Math.max(top, pill.top) + 0.5; y < Math.min(bottom, pill.bottom); y++) {
        const half = Math.sqrt(Math.max(0, r * r - (y - mid) ** 2))
        area += Math.max(0, Math.min(l.right, pill.right - r + half) - Math.max(l.left, pill.left + r - half))
      }
      if (area < 1) continue
      sum += bottom > pill.bottom - 1 ? 1000 : 150 + (2 * area) / (bottom - top)
    }
    for (const [step, gone] of headHidden) if (gone && bodyShown.get(step)) sum += 300
    // Never an end with none of the steps' words in view (Harlie's QA pass, 2026-09-28: on landscape phones and short
    // phones the steps had all gone up under the header or the band, and the page ended on an empty space).
    if (![...headHidden.values()].some((gone) => !gone) && !bodyShown.size) sum += 5000
    return sum
  }
  // Least cut first, then the footer's links whole on opening, then the least change from `found` (moving up, more
  // scroll, leaves a larger space under the words, so it counts a little more, and goes at most a third of the window:
  // further, the window would show little but that space).
  const score = (end: number) => cost(end) + (cut(end) ? 50 : 0) + (end < found ? 1.5 : 1) * Math.abs(end - found)
  let best = found
  let bestScore = score(found)
  for (let end = Math.floor(found - vh / 3); end <= most; end++) {
    if (across(end)) continue
    const s = score(end)
    if (s < bestScore) {
      best = end
      bestScore = s
    }
  }
  return best
}

/**
 * The picture itself, directly on the page (Harlie's request, 2026-09-26: no device or frame PNG): a box in the
 * media's own proportions with rounded corners and a soft glow (case-v16.css), the recording or screenshot filling it
 * whole (never cropped).
 */
function MediaBox({ aspect, onZoom, zoomLabel, children }: { aspect: number; onZoom?: (trigger: HTMLElement) => void; zoomLabel?: string; children: ReactNode }) {
  return (
    <div className="story__stage story__box" style={{ '--aspect': aspect } as CSSProperties}>
      <div className="story__screen">{children}</div>
      {onZoom && <ZoomButton onZoom={onZoom} label={zoomLabel} />}
    </div>
  )
}

/**
 * A case study told in a few compact steps (brief v21). The introduction and three short groups (a heading and one
 * explanation) run down the left; the stage stays in place on the right (recordings and screenshots directly on the
 * page with rounded corners and a soft glow, whole; Jumpstart's phones stand free), below the header, centred in its
 * column and never taller than 72% of the window, so the whole composition sits inside the window with a gutter on
 * each side. Its opening state is level with the introduction.
 *
 * A step becomes the current one when its top reaches the reading line, and the stage changes with it at that moment:
 * a recording plays that step's segment (or, playing by itself, the whole recording loops whatever the step),
 * Jumpstart's phones stand in a row with the current section's brought forward, and artifacts are all shown at once,
 * the step's own large and the others small: the next step's picture grows where it stands as the large one shrinks,
 * following the scroll (over the last part of a step, done as the next step becomes current). Only the steps' own
 * positions drive this; the length of the rest of the page never does. Where the page is too short for the steps to
 * reach the line in turn, each step after the first still keeps its own scroll (stepScroll; on phones once the band is
 * held), the changes spaced evenly: the words come to their end and are held there, like the picture, while the
 * steps change, then the footer rises beneath them (Harlie's QA pass, 2026-09-28). The current step takes a glowing
 * rule and a glowing heading; the others stay fully readable.
 *
 * Phones and tablets held upright (PHONE): the introduction, then a compact stage held under the header (about 30% of
 * the screen), with the steps below it.
 *
 * Reduced motion: no easing or movement (the gallery changes at once), and a recording shows one still per step.
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
    /** Scroll positions where each step becomes current, the page's last scroll position, and the space added under the steps. */
    const m = { t: [0], end: 1, pad: 0 }
    const cs = list.closest<HTMLElement>('.cs')
    const intro = cs?.querySelector<HTMLElement>(':scope > .cs__intro')
    // A refresh queued below is dropped once the page has gone (the next page's triggers refresh themselves).
    let live = true
    const measure = () => {
      // The words where the page places them: a hold (below) is let go while they are measured, in the same frame.
      if (cs) cs.dataset.measuring = ''
      const y = window.scrollY
      const vh = window.innerHeight
      const items = [...list.children] as HTMLElement[]
      const tops = items.map((el) => el.getBoundingClientRect().top + y)
      const body = list.parentElement ?? list
      const lastBottom = items[n - 1].getBoundingClientRect().bottom + y
      const footer = document.querySelector<HTMLElement>('.site-end')
      const footerBox = footer?.getBoundingClientRect()
      const footerTop = footerBox ? footerBox.top + y : document.documentElement.scrollHeight
      const footerH = footerBox?.height ?? 0
      // At the end of the page the words end level with the bottom of the held picture (Harlie's request), so the
      // footer follows close under both; on phones (the picture is not held beside the words) a short gap.
      const stage = cs?.querySelector<HTMLElement>('.story__hold > .story__stage')
      const wide = !window.matchMedia(PHONE).matches
      // The picture's visible bottom: its lowest image (the screenshot, or the largest phone), never below the stage's
      // own box, and not the phones' padded box.
      const box = stage?.getBoundingClientRect().bottom ?? 0
      const shown = stage ? [...stage.querySelectorAll('img')].map((el) => el.getBoundingClientRect().bottom).filter((b) => b > 0) : []
      const stageBottom = shown.length ? Math.min(box, Math.max(...shown)) : box
      // The footer's top once the page is scrolled to its end, the space between the words and the footer that does
      // not change (all but the space added here), and the footer's links then (its own top padding above them).
      const footerAtEnd = vh - footerH
      const between = footerTop - lastBottom - m.pad
      const links = [...(footer?.querySelectorAll<HTMLElement>('.site-end__inner > *') ?? [])].map((el) => el.getBoundingClientRect())
      const row = {
        top: footerAtEnd + (links.length ? Math.min(...links.map((r) => r.top + y)) - footerTop : 0),
        bottom: footerAtEnd + (links.length ? Math.max(...links.map((r) => r.bottom + y)) - footerTop : footerH),
      }
      // The footer's rows once it has risen (from its first row to the window's bottom): the held picture keeps above
      // them (case-v16.css --stage-h; Harlie's QA pass, 2026-09-28: on landscape phones and short windows "Next
      // project" came up over the picture).
      cs?.style.setProperty('--end-rows', `${Math.ceil(vh - row.top)}px`)
      // Phones: the band held under the header (the stage) covers what passes beneath it; its height is part of the
      // navigation's safe area there (--story-band, case-v16.css). It first scrolls with the page (`travel`).
      const band = !wide ? cs?.querySelector<HTMLElement>('.cs__media') : null
      cs?.style.setProperty('--story-band', band ? `${band.offsetHeight}px` : '0px')
      const header = document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0
      const bar = barOpaque() ? header : 0
      const stickyTop = band ? parseFloat(getComputedStyle(band).top) || 0 : 0
      const bandH = band?.offsetHeight ?? 0
      const travel = band ? bandTravel(band) : 0
      const covered = band ? stickyTop + bandH : bar
      const step = stepScroll()
      // What covers the words at a given scroll: the window's top (or the header's opaque bar), the floating pill on
      // wide screens, and on phones the band, held once it has travelled (a fade of 20px under it).
      const pill = !bar ? navShade() : null
      const cover = (s: number): Cover => {
        const hidden: [number, number][] = [[-Infinity, bar]]
        if (band) {
          const top = Math.max(stickyTop, stickyTop + travel - s)
          hidden.push([top, top + bandH])
        }
        return { hidden, near: band ? 20 : 8, pill }
      }
      // Where the words end at the bottom of the page (in the window), then moved so that no heading rests across the
      // navigation's safe area, the fewest lines are cut, and the footer's links are not cut on opening (Harlie's
      // brief, 2026-09-28; settleEnd). Coming down, the words may end inside the footer's own top padding, as far as
      // 40px above its links.
      const rest = Math.min(wide && stage ? Math.min(stageBottom, footerAtEnd - 24) : footerAtEnd - 56, footerAtEnd - between)
      const lowest = Math.max(footerAtEnd - between, row.top - 40)
      // The page's least scroll: each step after the first keeps its own (and on phones the band first travels).
      const least = travel + step * (n - 1)
      const bands = cs ? headingBands(cs, y) : []
      // Phones: the last step with its heading's safe line.
      const tailBand = !wide && bands.length ? { top: tops[n - 1], bottom: lastBottom, safe: bands[bands.length - 1].safe } : undefined
      // The words' end is chosen for the words alone (on phones with the band held), since they can be held (below).
      const lines = cs ? textLines(cs, y) : []
      const room = { lowest, last: lastBottom, least: travel, covered, row, vh, bands, lines, cover, tail: tailBand }
      let settled = cs ? settleEnd({ ...room, rest }) : rest
      // On phones, words to be held come to rest as low as they may, the steps whole under the band where they fit
      // (the gap kept above the footer is for a page whose own length ends it).
      if (cs && !wide && lastBottom - settled < least - 0.5) settled = settleEnd({ ...room, rest: lowest })
      // Keep the introduction and reading blocks on the same scroll trajectory.
      // Holding only the steps caused the title to slide away independently at the page end.
      // The page's scroll once the complete text column reaches its resting position.
      const moved = Math.max(0, lastBottom - settled)
      /*
       * Where the words reach their end before the steps have had their scroll (a short page; Harlie's QA pass,
       * 2026-09-28), they stop there and are held, like the picture beside them (on phones, the steps under the held
       * band), while the rest of the scroll moves through the steps; then the footer rises beneath them. The page ends
       * on the composition chosen for the words (on wide screens the title, introduction and every step whole, level
       * with the picture), not with the words pushed up under the navigation or the band. The held words stay in the
       * story's grid: a last row makes the room they are held through (--hold-rest), and where they end inside the
       * footer's top padding the footer comes up over that row (--hold-under). Elsewhere the page's own length does the
       * work: the space under the words (the body's padding, or a negative margin for space taken back).
       */
      const holding = wide && Boolean(cs && intro) && moved < least - 0.5
      let pad: number
      if (holding && cs && intro) {
        // Hold the complete text column while the remaining media steps finish.
        const scrollTo = least
        pad = Math.round(scrollTo + vh - footerH - lastBottom - between)
        const under = Math.max(0, Math.ceil(settled - footerAtEnd + between))
        cs.style.setProperty('--hold-rest', `${pad + under}px`)
        cs.style.setProperty('--hold-under', `${-under}px`)
        cs.style.setProperty('--hold-intro', `${(intro.getBoundingClientRect().top + y - moved).toFixed(1)}px`)
        cs.style.setProperty('--hold-body', `${(body.getBoundingClientRect().top + y - moved).toFixed(1)}px`)
        // The introduction and steps always remain together.
        cs.dataset.hold = 'words'
        body.style.paddingBottom = ''
        body.style.marginBottom = ''
      } else {
        // The page has no minimum height of its own here (case-v16.css), so on a short page the words can come down to
        // the picture; the space still reaches far enough for the footer to meet the window's bottom.
        const fill = m.pad + vh - footerH - footerTop
        pad = Math.round(Math.max(footerAtEnd - settled - between, fill))
        if (cs) delete cs.dataset.hold
        body.style.paddingBottom = pad > 0 ? `${pad}px` : ''
        body.style.marginBottom = pad < 0 ? `${pad}px` : ''
      }
      if (cs) delete cs.dataset.measuring
      if (pad !== m.pad) {
        m.pad = pad
        requestAnimationFrame(() => live && ScrollTrigger.refresh())
      }
      // Each step becomes current when its top reaches the reading line.
      const end = Math.max(1, document.documentElement.scrollHeight - vh)
      const raw = tops.map((top) => top - line() * vh)
      const lim = end - Math.min(0.35 * vh, 260)
      // Crowded (a short page: the last step could not reach the line with room to spare, a step would get less than
      // its scroll, the first less than half of it, or on phones one would change before the band is held): the steps
      // after the first change at even intervals over the scroll there is once the band is held, the first and the last
      // keeping half an interval, so every step (and its picture) is current in turn, whatever the wheel's notch.
      // Held words never reach the line: their steps change evenly too. On phones whose words scroll under the band
      // (not held), a step only counts as crowded when a notch could pass over it: spread evenly over a long page, a
      // step changed long after its words had gone under the band (Harlie's QA pass, 2026-09-28: on short phones the
      // last step lit up only once its heading was hidden).
      const scrolling = Boolean(band) && !holding
      const gapLeast = scrolling ? 0.75 * step : Math.max(0.6 * (end / n), 0.75 * step)
      const crowded = n > 1 && (holding || raw[n - 1] > lim || raw[1] < travel + 0.5 * step || raw.some((r, k) => k > 0 && r - raw[k - 1] < gapLeast))
      const even = (end - travel) / Math.max(1, n - 1)
      m.t = crowded ? raw.map((_, k) => (k === 0 ? 0 : travel + (k - 0.5) * even)) : raw
      // There, each step is current by the time its heading is 24px from going under the band, at the latest.
      if (scrolling) m.t = m.t.map((t, k) => (k === 0 ? t : Math.min(t, tops[k] - covered - 24)))
      m.end = end
    }
    const update = () => {
      const y = window.scrollY
      // The first step is current from the start (Harlie's request), before it reaches the reading line.
      if (y < m.t[0]) {
        setActive(0)
        follow.current?.(0, 0, Math.max(1, m.t[1] ?? m.end))
        return
      }
      let k = 0
      while (k < n - 1 && y >= m.t[k + 1]) k++
      const span = k < n - 1 ? m.t[k + 1] - m.t[k] : Math.max(1, m.end - m.t[k])
      setActive(k)
      follow.current?.(k, Math.min(1, Math.max(0, (y - m.t[k]) / span)), span)
    }
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onRefresh: () => {
        measure()
        update()
      },
      onUpdate: update,
    })
    return () => {
      live = false
      trigger.kill()
      const body = list.parentElement ?? list
      body.style.paddingBottom = ''
      body.style.marginBottom = ''
      if (cs) delete cs.dataset.hold
    }
  }, [steps.length])

  const bind = useCallback<Bind>((fn) => {
    follow.current = fn
  }, [])

  // Wide windows: the stage is fixed in the window for the whole page (Harlie's request), so the footer rises
  // beneath it at the end. Its holder takes the right column's place and width, measured from the column.
  const mediaRef = useRef<HTMLDivElement>(null)
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
    <div className="cs story">
      <header className="cs__intro">
        <CaseTitle title={title} meta={meta} />
        <div className="cx-lede">{lede}</div>
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
              <h2 className="story__title">{s.title}</h2>
              <p className="story__text">{s.text}</p>
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
 * step's picture fills the card and every picture stands as a small circle on its right; hovering, focusing or clicking
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
    const playing = reducedNow ? null : playWhenVisible(video, () => !held)
    const show = (i: number) => {
      seg = Math.max(0, Math.min(i, last))
      video.currentTime = reducedNow ? stage.stills[seg] : range()[0]
      if (held) {
        held = false
        playing?.sync()
      }
    }
    bind((k) => {
      const i = Math.max(0, Math.min(k, last))
      if (i !== seg) show(i)
    })
    // Keep playback inside the current segment: checked on every presented frame (timeupdate comes only every quarter
    // second, late enough for the next section's frames, or the file's first, to flash), going back to the start (or
    // holding) two frames before the end, sooner while playback is sped up. The file itself never loops.
    const lead = (1 / 24) * 2
    const keep = (t: number) => {
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
        video.currentTime = stage.stills[Math.min(seg, stage.stills.length - 1)]
      }
      bind((k) => {
        const i = Math.max(0, k)
        if (i === seg) return
        seg = i
        if (video.readyState >= 1) still()
      })
      if (video.readyState >= 1) still()
      else video.addEventListener('loadedmetadata', still, { once: true })
      return () => {
        bind(null)
        video.removeEventListener('loadedmetadata', still)
      }
    }
    video.defaultPlaybackRate = stage.rate ?? 1
    video.playbackRate = stage.rate ?? 1
    return playWhenVisible(video).stop
  }, [stage, bind, reduced])

  return (
    <>
      <MediaBox
        aspect={stage.width / stage.height}
        zoomLabel={stage.action ?? 'Enlarge recording'}
        onZoom={(trigger) => setZoom({ from: trigger, at: ref.current?.currentTime ?? 0 })}
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
