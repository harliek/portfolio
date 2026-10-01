import './dock-title.css'
import { useEffect, type RefObject } from 'react'
import { motionReduced, subscribeMotion } from '../../hooks/useMotionPreference'

/**
 * Dock-style magnification on text (Harlie's request: "use the hover aspect of this effect on title letters",
 * pointing at Aceternity's Floating Dock; since 2026-09-30 on every text on the site: "Is there any way to do the cool
 * effect that's on the titles? on all of the text", "Like instead of it growing bigger, it would do that", then "For
 * the titles, do letter by letter, though. Like, including titles in the sections"). As the pointer moves along a
 * line, what is under it grows with its closeness to the pointer: largest right under it, easing back to its normal
 * size about one and a half letters' height either side. Titles and headings grow letter by letter; running text
 * (paragraphs, details lines, the footer) grows whole words, the word under the pointer the most and its neighbours
 * less as they get further (Harlie: "you dont have to do every letter if thats easier"), so it reads as the same dock
 * at a word's scale. The reach is in ems, so the huge PORTFOLIO, a case title and a paragraph feel alike. What comes
 * after a grown letter or word steps along so nothing overlaps, and everything moves on the dock's own spring (mass
 * 0.1, stiffness 150, damping 12), settling back to rest when the pointer leaves.
 *
 * Transforms only: letters and words grow from their baseline and slide sideways by the extra width of those before
 * them, so nothing reflows and the lines wrap exactly as before. A line keeps its start on the column (the end for a
 * line set from the right) and widens away from it. The titles the dock was made for give way the other way where
 * they would pass the viewport's edge, as they always have. Every other text never moves its start (2026-09-30, the
 * reviewer's finding: a case study's long step lines stepped about 10px out of their column, towards the moving line,
 * breaking the column's edge): it widens only into the free room on its open side, short of whatever stands beside its
 * block (the held picture beside a case study's steps, the portrait beside About's opening), a box that clips or masks
 * it (a case study's fading window, which WebKit clips to its box; case-v16.css gives the steps' window the same room
 * towards the picture as the introduction's) or the viewport's edge, and where that room is short (a full line) that
 * line's swell is lower. A link among the words (the contact form's sent line) stays exactly where it rests and does
 * not swell: the words before it grow away from it towards the line's start, the words after it towards its end, so
 * the address is drawn where it takes the click and its focus ring (the reviewer's finding: the swollen address
 * reached 50px left of the real link, and a click on its first letters did nothing). The swell swells on the line
 * under the pointer; the other lines give way vertically only as much as it needs: a title's lines, set close, by as
 * much as its ascenders and descenders grow; running text, with room between its lines, only by what the grown letters
 * would overlap (usually nothing, so a paragraph never lurches). The swell also stops short of whatever sits just
 * above or below the block (the homepage's HARLIE KATZ label, a case study's details, a step's heading, the site's
 * header): where the room is tight, the peak is a little lower.
 *
 * At rest the text is untouched: same markup, same layout, no transforms, no frames. Text made of plain text keeps
 * it, with its kerning, selection, find-in-page, links and screen-reader name. Only while it is hovered is it drawn
 * by a layer laid exactly over it, inert and hidden from screen readers: copies of its text, each clipped to the
 * cells of the letters or words it draws, so at rest the copies add up to the text pixel for pixel in every engine (a
 * lone letter drawn by itself lands a pixel off in WebKit, and loses the kerning with its neighbours). Neighbours that
 * sit the same way share a copy: the lines above and below the pointer's line are one copy each, the words before
 * and after the swell on its line one each, so a frame draws a copy per letter or word in the swell and about four
 * more, however long the text. Copies are made as the swell first needs them and reused frame to frame. The text's
 * own words keep their place underneath, drawn in no ink (dock-title.css), so its links stay where they were and
 * still take the click. A copy must lay out exactly as the text (checked each time the layer is made: the first,
 * middle and last letter or word of every line, where any other wrapping, spacing or font would show); if one does
 * not, the text keeps still for that hover. A title already made of letters (PORTFOLIO, TypeLine's data-dock-letter
 * spans) has those letters moved directly.
 *
 * The text is read at the first frame after the pointer arrives, not in the pointer's own event, and what was read
 * (each letter's or word's box and ink) is kept for the next hover while the text still lies where it was read (its
 * words, size and those same letters or words checked again), so moving down a column of paragraphs, or back onto
 * one, costs little (2026-09-30, the performance review: the first move onto one of About's paragraphs took 43 to
 * 61ms on a slowed processor, read afresh on every entry). Each word's ink is kept for the whole site once the fonts
 * are in.
 *
 * The colour and the glow under the pointer are the site's (lift.css): the glow is a filter on the words' element,
 * so it lights the swollen copies as one, with no seam where two copies meet.
 *
 * One animation frame loop per element, only while it is hovered or settling; nothing re-renders. Mouse and trackpad
 * only: nothing on touch screens and nothing under reduced motion (the colour and the glow still come). While a
 * selection is on the text, or PORTFOLIO is still typing itself in, the letters stay at rest (a pointer already
 * resting on PORTFOLIO starts the swell as the typing ends).
 */

/** Size of the letter or word right under the pointer (the brief: up to about 1.5×), where there is room for it. */
const PEAK_SCALE = 1.45
/** Space the grown letters keep from the content above and below the text, in ems of its font size. */
const CLEARANCE_EM = 0.03
/** Space a line giving way sideways keeps from the content beside its block, in ems of its font size. */
const SIDE_CLEARANCE_EM = 0.5
/** How far the swell reaches either side of the pointer, in ems of the text's font size. */
const REACH_EM = 1.45
/** The Floating Dock's spring (framer-motion's useSpring in the demo). */
const SPRING = { mass: 0.1, stiffness: 150, damping: 12 }
/** Integration step of the spring, in seconds: stable for this stiffness at any frame rate. */
const STEP = 1 / 240
/** Close enough to rest to stop the loop. */
const REST_SCALE = 0.0005
const REST_SPEED = 0.01
/** Space kept clear at the viewport's edges when a line grows towards them, in pixels. */
const VIEWPORT_GUTTER = 16
/** Far enough to stand for "no limit" on a cell's outer edges. */
const FAR = 1e5

/** Letters (titles and headings) or whole words (running text). */
export type DockMode = 'letters' | 'words'

export interface DockOptions {
  mode: DockMode
  /**
   * One of the titles the dock was made for (PORTFOLIO, a case study's title, About's name): its lines give way by the
   * whole growth of the swell and may run on to the viewport's edge, as they have since the dock arrived.
   */
  title?: boolean
}

export interface Dock {
  /** A mouse or trackpad pointer at (x, y) over the element, with these buttons pressed. */
  move(x: number, y: number, buttons: number): void
  /** The pointer has left the element: the letters settle back to rest. */
  leave(): void
  /** PORTFOLIO has typed itself in: a pointer already resting on it starts the swell. */
  typed(): void
  /** Straight back to rest. */
  snap(): void
}

type Box = { left: number; top: number; width: number; height: number }

/** Where a letter or word sits in the text: which of its text nodes, where in it, and which of its boxes (a word broken across two lines has two). */
type Spot = { node: number; start: number; end: number; part: number }
/** One of a title's own letters, moved directly, has no place in a text node. */
const NO_SPOT: Spot = { node: -1, start: 0, end: 0, part: 0 }

/** A letter or word as laid out, before it becomes a cell. */
interface Found {
  el: HTMLElement | null
  text: string
  host: Element
  box: Box
  style: string | null
  spot: Spot
  /** Inside a link or a button among the words (the contact form's sent line): it keeps its place. */
  fixed: boolean
}

interface Cell {
  /** One of the title's own letters (TypeLine's), moved directly; null for a letter or word drawn by the copies. */
  el: HTMLElement | null
  /** The letter or word it stands for, the element whose font draws it, and where it sits in the text. */
  text: string
  host: Element
  spot: Spot
  /** Part of a link or button: never swells, never moves sideways. */
  fixed: boolean
  /** Its place on its line, from the start. */
  index: number
  /** Its rest box, in the element's own (unscaled) pixels, and where the baseline sits in it (its font's ascent). */
  left: number
  top: number
  width: number
  fontAscent: number
  centre: number
  line: number
  /** How far its ink reaches above and below the baseline, and left and right of where its box starts. */
  ascent: number
  descent: number
  inkLeft: number
  inkRight: number
  /** The style attribute one of the title's own letters had before (restored exactly at rest). */
  style: string | null
  scale: number
  speed: number
  /** How strongly it swells for the pointer's place this frame (0 to 1), and its slide along its line. */
  hill: number
  shift: number
  /** Its share of the text (its clip) and its centre on the baseline, in the copies' own pixels. */
  clipLeft: number
  clipRight: number
  ox: number
  oy: number
  /** Its transform this frame (what was last written, for one of the title's own letters). */
  transform: string
}

interface Line {
  cells: Cell[]
  top: number
  bottom: number
  left: number
  right: number
  baseline: number
  inkTop: number
  inkBottom: number
  /** Where its cells end above and below, in the copies' own pixels. */
  clipTop: number
  clipBottom: number
  /** The first and last of its cells that are part of a link (-1 for none): they, and any between, stay put. */
  fixedFrom: number
  fixedTo: number
  /**
   * Running text: how many of its cells, from the start, grow towards the line's start (those before a link, or all of
   * a line set from the right); the others grow towards its end.
   */
  pivot: number
}

/** What the text's letters or words measured at rest, kept for the next hover while the text still lies the same. */
interface Kept {
  text: string
  size: string
  nodes: Text[]
  cells: Cell[]
  lines: Line[]
}

interface Copy {
  el: HTMLElement
  transform: string
  clip: string
  shown: boolean
}

/** A stretch of neighbouring cells drawn by one copy this frame. */
interface Run {
  transform: string
  left: number
  right: number
  top: number
  bottom: number
  band: boolean
}

type Ink = { left: number; right: number; ascent: number; descent: number; fontAscent: number }

let inkContext: CanvasRenderingContext2D | null | undefined
let inkFont = ''
/** Each text's ink in each font, once the fonts are in (the same words come back across the site's paragraphs). */
const inks = new Map<string, Ink>()
const INKS_KEPT = 4000

/**
 * Each text's ink around its origin in the font of `host`, from the canvas's glyph metrics, in CSS pixels: how far it
 * reaches left and right of where it starts, above and below the baseline, and the font's ascent (where the baseline
 * sits in a text box).
 */
function inkMeasurer(host: Element) {
  const style = getComputedStyle(host)
  const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  const fontSize = parseFloat(style.fontSize) || 16
  const upper = style.textTransform === 'uppercase'
  // PORTFOLIO is thickened by a fine outline (home.css), which adds half its width to the ink on every side.
  const stroke = (parseFloat(style.getPropertyValue('-webkit-text-stroke-width')) || 0) / 2
  return (text: string): Ink => {
    const drawn = upper ? text.toUpperCase() : text
    const key = `${stroke} ${font}\n${drawn}`
    const known = inks.get(key)
    if (known) return known
    inkContext ??= document.createElement('canvas').getContext('2d')
    if (inkContext && inkFont !== font) {
      inkContext.font = font
      inkFont = font
    }
    const metrics = inkContext?.measureText(drawn)
    const ink = {
      left: (metrics?.actualBoundingBoxLeft ?? 0) + stroke,
      right: (metrics?.actualBoundingBoxRight ?? fontSize * 0.6 * text.length) + stroke,
      ascent: (metrics?.actualBoundingBoxAscent ?? fontSize * 0.75) + stroke,
      descent: Math.max(0, (metrics?.actualBoundingBoxDescent ?? 0) + stroke),
      fontAscent: metrics?.fontBoundingBoxAscent ?? fontSize * 0.9,
    }
    // Kept only once the fonts are in: before, the canvas measures in the fallback font.
    if (metrics && document.fonts?.status !== 'loading') {
      if (inks.size >= INKS_KEPT) inks.clear()
      inks.set(key, ink)
    }
    return ink
  }
}

/** The text nodes under `root` the dock draws, in order: text for screen readers only, and the dock's own layer, left out. */
function textNodes(root: Node) {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const host = node.parentElement
    const layer = host?.closest('.dock-title__layer')
    if (!host || host.closest('.visually-hidden') || (layer && root.contains(layer))) continue
    nodes.push(node)
  }
  return nodes
}

/**
 * The laid-out letters or words of `nodes` (the text nodes under `root`), each with its box in the element's pixels
 * (a word broken across two lines is two), and whether it is part of a link or button among the words.
 */
function textBoxes(nodes: Text[], root: Node, mode: DockMode, local: (r: DOMRect) => Box) {
  const range = document.createRange()
  const found: Found[] = []
  nodes.forEach((node, index) => {
    const host = node.parentElement!
    const control = host.closest('a[href], button')
    const fixed = !!control && root.contains(control)
    const data = node.data
    const add = (start: number, end: number, first: boolean) => {
      range.setStart(node, start)
      range.setEnd(node, end)
      const rects = range.getClientRects()
      for (let part = 0; part < (first ? Math.min(1, rects.length) : rects.length); part++) {
        const r = rects[part]
        if (r.width > 0) found.push({ el: null, text: data.slice(start, end), host, box: local(r), style: null, spot: { node: index, start, end, part }, fixed })
      }
    }
    if (mode === 'words') {
      for (const match of data.matchAll(/\S+/g)) {
        const at = match.index ?? 0
        add(at, at + match[0].length, false)
      }
      return
    }
    for (let i = 0; i < data.length; ) {
      const ch = String.fromCodePoint(data.codePointAt(i) ?? 32)
      // One box per letter: the first of its rects (a letter never breaks across lines).
      if (ch.trim()) add(i, i + ch.length, true)
      i += ch.length
    }
  })
  return found
}

/** Where a letter or word lies now among `nodes` (the text's own, or a copy's), or null when it is no longer there. */
function boxAt(nodes: Text[], spot: Spot, range: Range, local: (r: DOMRect) => Box): Box | null {
  const node = nodes[spot.node]
  if (!node || spot.end > node.length) return null
  range.setStart(node, spot.start)
  range.setEnd(node, spot.end)
  const r = range.getClientRects()[spot.part]
  return r ? local(r) : null
}

/**
 * Whether the letters or words among `nodes` (the text's own, or a copy's) lie where they were measured, within half a
 * pixel: the first, middle and last of every line. Any other wrapping, spacing or font moves one of them.
 */
function inPlace(lines: Line[], nodes: Text[], local: (r: DOMRect) => Box) {
  const range = document.createRange()
  return lines.every(({ cells }) =>
    [cells[0], cells[cells.length >> 1], cells[cells.length - 1]].every((c) => {
      const box = boxAt(nodes, c.spot, range, local)
      return !!box && Math.abs(box.left - c.left) <= 0.5 && Math.abs(box.top - c.top) <= 0.5 && Math.abs(box.width - c.width) <= 0.5
    }),
  )
}

/**
 * Puts back the style attribute an element had (none, or its old text). Read back before removing: Blink writes a
 * changed inline style to the attribute lazily, and brought back an empty style="" after the removal.
 */
function restoreStyle(node: HTMLElement, style: string | null) {
  node.style.cssText = ''
  void node.getAttribute('style')
  if (style === null) node.removeAttribute('style')
  else node.setAttribute('style', style)
}

/**
 * Gives `el` the dock's magnification under a mouse or trackpad: its letters (`mode: 'letters'`) or words swell
 * around the pointer while `move` reports it over the element, and settle back to rest after `leave`.
 */
export function createDock(el: HTMLElement, { mode, title = false }: DockOptions): Dock {
  let cells: Cell[] = []
  let lines: Line[] = []
  /** The text nodes the cells sit in (the copies' match them one for one). */
  let nodes: Text[] = []
  /** What was measured on an earlier hover, kept while the text still lies the same (plain text only). */
  let kept: Kept | null = null
  /** The text has been read for this hover (at the first frame after the pointer arrived). */
  let measured = false
  /** Where the copies repeat the text from (a DockTitle's text span, or the element itself). */
  let source: HTMLElement = el
  let layer: HTMLElement | null = null
  let copies: Copy[] = []
  /** Room a copy leaves before its text, for what the element draws before its words (About's label: its rule). */
  let copyIndent = 0
  let active = false
  let hovered = false
  let pointerX = 0
  let pointerY = 0
  let reach = 1
  /** The largest size a letter grows to here (PEAK_SCALE, or less where the room around the text is tight). */
  let peak = PEAK_SCALE
  /** A pointer arrived while PORTFOLIO was still typing: the swell starts when the typing ends. */
  let waiting = false
  /** The copies did not lay out as the text on this hover: it stays still until the pointer comes back. */
  let failed = false
  /** How far the lines may reach left and right, in the element's pixels, and which end of a line stays put. */
  let leftLimit = -FAR
  let rightLimit = FAR
  let anchor: 'start' | 'end' | 'center' = 'start'
  /** The ink between each two lines that a swell may take before the lines give way. */
  let gaps: number[] = []
  /** TypeLine's typing bar, after the homepage line's last word: it moves along with that line's end. */
  let follower: { el: HTMLElement; style: string | null; at: string; moved: boolean } | null = null
  let observer: MutationObserver | null = null
  let unsubscribeMotion: (() => void) | null = null
  let frame = 0
  let last = 0

  /** The element's box on screen and how much its ancestors scale it (the homepage's opening, a tile opening). */
  const frameOf = () => {
    const rect = el.getBoundingClientRect()
    // offsetWidth is rounded to whole pixels, so within a pixel of it the element is not scaled.
    const width = el.offsetWidth
    const zoom = width > 0 && Math.abs(rect.width - width) > 1 ? rect.width / width : 1
    return { rect, zoom: zoom > 0 ? zoom : 1 }
  }

  /** Groups boxes into lines by their vertical middle, top to bottom, each line's cells left to right. */
  const intoLines = (found: Found[]) => {
    const grouped: Line[] = []
    const all: Cell[] = []
    for (const { el: own, text, host, box, style, spot, fixed } of found) {
      const middle = box.top + box.height / 2
      let line = grouped.find((l) => Math.abs((l.top + l.bottom) / 2 - middle) < box.height / 2)
      if (!line) {
        line = {
          cells: [],
          top: box.top,
          bottom: box.top + box.height,
          left: box.left,
          right: box.left + box.width,
          baseline: 0,
          inkTop: 0,
          inkBottom: 0,
          clipTop: -FAR,
          clipBottom: FAR,
          fixedFrom: -1,
          fixedTo: -1,
          pivot: 0,
        }
        grouped.push(line)
      }
      const cell: Cell = {
        el: own,
        text,
        host,
        spot,
        fixed,
        index: 0,
        left: box.left,
        top: box.top,
        width: box.width,
        fontAscent: box.height,
        centre: box.left + box.width / 2,
        line: 0,
        ascent: 0,
        descent: 0,
        inkLeft: 0,
        inkRight: box.width,
        style,
        scale: 1,
        speed: 0,
        hill: 0,
        shift: 0,
        clipLeft: -FAR,
        clipRight: FAR,
        ox: 0,
        oy: 0,
        transform: 'none',
      }
      line.cells.push(cell)
      line.top = Math.min(line.top, box.top)
      line.bottom = Math.max(line.bottom, box.top + box.height)
      line.left = Math.min(line.left, box.left)
      line.right = Math.max(line.right, box.left + box.width)
      all.push(cell)
    }
    grouped.sort((a, b) => a.top - b.top)
    grouped.forEach((line, i) => {
      line.cells.sort((a, b) => a.left - b.left)
      line.cells.forEach((c, j) => {
        c.line = i
        c.index = j
        if (!c.fixed) return
        if (line.fixedFrom < 0) line.fixedFrom = j
        line.fixedTo = j
      })
    })
    return { grouped, all }
  }

  /** Where the baseline of the last line in `host` sits on screen: an empty box placed at its end sits on it. */
  const baselineOf = (host: HTMLElement) => {
    const probe = document.createElement('span')
    probe.className = 'dock-title__probe'
    host.append(probe)
    const y = probe.getBoundingClientRect().top
    probe.remove()
    return y
  }

  /** Each cell's ink, from the font of the element that draws it. */
  const measureInk = () => {
    const measurers = new Map<Element, (text: string) => Ink>()
    return cells.map((c) => {
      let measurer = measurers.get(c.host)
      if (!measurer) measurers.set(c.host, (measurer = inkMeasurer(c.host)))
      const ink = measurer(c.text)
      c.ascent = ink.ascent
      c.descent = ink.descent
      c.inkLeft = ink.left
      c.inkRight = ink.right
      c.fontAscent = ink.fontAscent
    })
  }

  /**
   * The nearest content above and below the element that shares its columns (the homepage's HARLIE KATZ label over
   * PORTFOLIO, a case study's details under its title, a step's heading over its words, the site's header), as screen
   * edges: found among the earlier and later elements beside the element and beside each of its ancestors, out to the
   * page's main region.
   */
  const neighbours = (inkTop: number, inkBottom: number, left: number, right: number) => {
    let above = -Infinity
    let below = Infinity
    const shares = (r: DOMRect) => r.width > 0 && r.height > 0 && r.left < right && r.right > left
    for (let node: Element | null = el; node && node !== document.body && node.tagName !== 'MAIN'; node = node.parentElement) {
      for (let sibling = node.previousElementSibling; sibling && above === -Infinity; sibling = sibling.previousElementSibling) {
        const r = sibling.getBoundingClientRect()
        if (shares(r) && r.bottom <= inkTop + 1) above = r.bottom
      }
      for (let sibling = node.nextElementSibling; sibling && below === Infinity; sibling = sibling.nextElementSibling) {
        const r = sibling.getBoundingClientRect()
        if (shares(r) && r.top >= inkBottom - 1) below = r.top
      }
    }
    // The site's header stays over the top of the page: where it draws a bar (phones, on a case study) the whole bar
    // is in the way; where it is clear (Harlie's transparent header), only its links and buttons are.
    const header = document.querySelector<HTMLElement>('.site-header')
    if (header) {
      const bar = getComputedStyle(header, '::before')
      const solid = bar.opacity !== '0' && bar.backgroundColor !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(bar.backgroundColor)
      const box = header.getBoundingClientRect()
      for (const part of solid ? [header] : header.querySelectorAll('a, button')) {
        const r = part.getBoundingClientRect()
        // Only what sits in the bar itself (the closed menu's links wait, unseen, further down).
        if (r.bottom <= box.bottom + 1 && shares(r) && r.bottom <= inkTop + 1) above = Math.max(above, r.bottom)
      }
    }
    return { above, below }
  }

  /** The peak for the room around the text: its tallest ascender and deepest descender, grown, stay clear of its neighbours. */
  const peakFor = (rect: DOMRect, zoom: number, fontSize: number) => {
    const first = lines[0]
    const final = lines[lines.length - 1]
    const tallest = Math.max(...cells.map((c) => c.ascent))
    const deepest = Math.max(...cells.map((c) => c.descent))
    // The text's span across the page, with the room a swell takes to the right.
    const left = rect.left + Math.min(...cells.map((c) => c.left)) * zoom
    const right = rect.left + Math.min(rightLimit, Math.max(...lines.map((line) => line.right)) + reach) * zoom
    const { above, below } = neighbours(rect.top + first.inkTop * zoom, rect.top + final.inkBottom * zoom, left, right)
    const clearance = CLEARANCE_EM * fontSize
    const roomAbove = (rect.top - above) / zoom + first.inkTop - clearance
    const roomBelow = (below - rect.top) / zoom - final.inkBottom - clearance
    let most = PEAK_SCALE
    if (tallest > 0) most = Math.min(most, 1 + roomAbove / tallest)
    if (deepest > 0) most = Math.min(most, 1 + roomBelow / deepest)
    return Math.max(1, most)
  }

  /**
   * How far the text's lines may reach sideways, as screen edges: the viewport less its gutter, inside every box that
   * clips or masks the text (a case study's fading window: WebKit clips a mask to its box), and clear of what stands
   * beside the element or beside any of its ancestors on the same rows (the held picture's column, a step's moving
   * line, About's portrait, the Education paragraph beside the school).
   */
  const sideRoom = (rect: DOMRect, clear: number) => {
    let left = VIEWPORT_GUTTER
    let right = document.documentElement.clientWidth - VIEWPORT_GUTTER
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a)
      const mask = s.maskImage || s.getPropertyValue('-webkit-mask-image')
      if (s.overflowX !== 'visible' || (mask && mask !== 'none') || s.clipPath !== 'none') {
        const r = a.getBoundingClientRect()
        left = Math.max(left, r.left)
        right = Math.min(right, r.right)
      }
    }
    // Out to the page's main region (nothing beside it shares the text's rows: the header and the footer are above and
    // below), or the page itself for the footer's own words.
    for (let node: Element | null = el; node && node.parentElement && node !== document.body && node.tagName !== 'MAIN'; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling === node || sibling === follower?.el) continue
        const r = sibling.getBoundingClientRect()
        if (!r.width || !r.height || r.bottom <= rect.top || r.top >= rect.bottom) continue
        if (r.left >= rect.right - 1) right = Math.min(right, r.left - clear)
        else if (r.right <= rect.left + 1) left = Math.max(left, r.right + clear)
      }
    }
    return { left, right }
  }

  /** Reads the text at rest and sets up what the swell moves. False when there is nothing to move. */
  const measure = () => {
    const { rect, zoom } = frameOf()
    if (!rect.width || !rect.height) return false
    const local = (r: DOMRect): Box => ({ left: (r.left - rect.left) / zoom, top: (r.top - rect.top) / zoom, width: r.width / zoom, height: r.height / zoom })
    const style = getComputedStyle(el)
    // The layer is placed in the element's own box: an element placed some other way is left still.
    if (style.position !== 'static' && style.position !== 'relative') return false
    const fontSize = parseFloat(style.fontSize) || 16
    reach = REACH_EM * fontSize
    const align = style.textAlign
    anchor = align === 'right' || align === 'end' ? 'end' : align === 'center' ? 'center' : 'start'
    const viewport = document.documentElement.clientWidth
    const own = [...el.querySelectorAll<HTMLElement>('[data-dock-letter]')]

    if (own.length) {
      // The title's own letters, read with no transform or transition of their own (home.css gives them a hover rise).
      el.setAttribute('data-dock-active', '')
      const saved = own.map((l) => l.getAttribute('style'))
      for (const l of own) {
        l.style.transition = 'none'
        l.style.transform = 'none'
      }
      const found = own
        .map((l, i): Found & { el: HTMLElement } => ({ el: l, text: l.textContent ?? '', host: l, box: local(l.getBoundingClientRect()), style: saved[i], spot: NO_SPOT, fixed: false }))
        .filter((f) => f.box.width > 0)
      if (!found.length) {
        own.forEach((l, i) => restoreStyle(l, saved[i]))
        return false
      }
      ;({ grouped: lines, all: cells } = intoLines(found))
      measureInk()
      // Letters grow from their baseline, found once in the first letter (they all share the font).
      const below = (baselineOf(found[0].el) - found[0].el.getBoundingClientRect().top) / zoom
      for (const line of lines) {
        line.baseline = line.top + below
        line.inkTop = line.baseline - Math.max(...line.cells.map((c) => c.ascent))
        line.inkBottom = line.baseline + Math.max(...line.cells.map((c) => c.descent))
        for (const c of line.cells) c.el!.style.transformOrigin = `50% ${below.toFixed(3)}px`
      }
      rightLimit = (viewport - VIEWPORT_GUTTER - rect.left) / zoom
      gaps = lines.map(() => 0)
      peak = peakFor(rect, zoom, fontSize)
      return true
    }

    // Plain text: copies of it, laid out exactly as the text itself. What an earlier hover measured is used again
    // while the text is the same and still lies where it did (the first, middle and last of each line, checked).
    source = el.querySelector<HTMLElement>(':scope > .dock-title__text') ?? el
    const text = source.textContent ?? ''
    const size = `${el.offsetWidth} ${el.offsetHeight} ${fontSize} ${window.devicePixelRatio || 1}`
    const same = kept && kept.text === text && kept.size === size && kept.nodes.every((n) => source.contains(n)) ? kept : null
    if (same && inPlace(same.lines, same.nodes, local)) {
      ;({ nodes, cells, lines } = same)
      for (const c of cells) {
        c.scale = 1
        c.speed = 0
        c.hill = 0
        c.shift = 0
        c.transform = 'none'
      }
    } else {
      kept = null
      nodes = textNodes(source)
      const found = textBoxes(nodes, source, mode, local)
      if (!found.length) return false
      ;({ grouped: lines, all: cells } = intoLines(found))
      measureInk()
      // Each line's baseline (a text box starts its font's ascent above it), and its ink above and below.
      for (const line of lines) {
        line.baseline = line.cells[0].top + line.cells[0].fontAscent
        line.inkTop = line.baseline - Math.max(...line.cells.map((c) => c.ascent))
        line.inkBottom = line.baseline + Math.max(...line.cells.map((c) => c.descent))
      }
      kept = { text, size, nodes, cells, lines }
    }
    // Running text: the cells that grow towards the line's start (before a link; all of a line set from the right).
    for (const line of lines) line.pivot = line.fixedFrom >= 0 ? line.fixedFrom : anchor === 'end' ? line.cells.length : 0

    // Where the lines may reach, and the layer that draws them: the titles as since the dock arrived (a line may run on
    // to the viewport's edge; the layer reaches 2em past the title's start and clips at the viewport's edge), the rest
    // within the room beside them, the layer clipping just outside it.
    const lefts = Math.min(...lines.map((l) => l.left))
    const rights = Math.max(...lines.map((l) => l.right))
    layer = document.createElement('span')
    layer.className = 'dock-title__layer'
    layer.setAttribute('aria-hidden', 'true')
    layer.inert = true
    if (/flex/.test(style.display)) layer.setAttribute('data-flex', '')
    const box = { left: el.clientLeft, top: el.clientTop, right: el.clientLeft + el.clientWidth, bottom: el.clientTop + el.clientHeight }
    // TypeLine's bar stands just after the homepage line's last word, and moves along with it (so it is not in the way).
    const bar = el.nextElementSibling
    if (el.classList.contains('type-line__text') && bar instanceof HTMLElement && bar.classList.contains('type-line__cursor')) {
      follower = { el: bar, style: bar.getAttribute('style'), at: '', moved: false }
    }
    if (title) {
      leftLimit = -FAR
      rightLimit = (viewport - VIEWPORT_GUTTER - rect.left) / zoom
      gaps = lines.map(() => 0)
      layer.style.setProperty('--dock-out-right', `${Math.max(0, (viewport - rect.right) / zoom).toFixed(2)}px`)
    } else {
      const room = sideRoom(rect, SIDE_CLEARANCE_EM * fontSize * zoom)
      // Never inside the text's own rest place.
      leftLimit = Math.min(lefts, (room.left - rect.left) / zoom)
      rightLimit = Math.max(rights, (room.right - rect.left) / zoom)
      // Running text keeps its leading: the lines give way only by what the grown letters would overlap.
      gaps = lines.slice(1).map((line, i) => Math.max(0, line.inkTop - lines[i].inkBottom - CLEARANCE_EM * fontSize))
    }
    peak = peakFor(rect, zoom, fontSize)
    if (!title) {
      // The layer holds the swell (the ink's overhang on either side included) and nothing more: it clips there, so the
      // copies, each the whole text, never widen or lengthen the page.
      const tallest = Math.max(...cells.map((c) => c.ascent))
      const deepest = Math.max(...cells.map((c) => c.descent))
      const spare = 0.25 * fontSize
      const top = Math.min(0, lines[0].inkTop - (peak - 1) * tallest) - spare
      const bottom = Math.max(rect.height / zoom, lines[lines.length - 1].inkBottom + (peak - 1) * deepest) + spare
      const outRight = Math.min(rightLimit + spare, (viewport - rect.left) / zoom)
      layer.style.setProperty('--dock-out-top', `${(box.top - top).toFixed(2)}px`)
      layer.style.setProperty('--dock-out-bottom', `${(bottom - box.bottom).toFixed(2)}px`)
      layer.style.setProperty('--dock-out-left', `${(box.left - (leftLimit - spare)).toFixed(2)}px`)
      layer.style.setProperty('--dock-out-right', `${(outRight - box.right).toFixed(2)}px`)
    }
    // The text's own shadow (the homepage's lines keep a soft dark one over the film) goes to the copies.
    if (source === el) {
      const shadow = style.textShadow
      if (shadow && shadow !== 'none') layer.style.textShadow = shadow
    }
    copyIndent = 0
    const first = addCopy()
    el.append(layer)
    // From now the text's own words are drawn in no ink (dock-title.css); a DockTitle's text span is hidden instead.
    el.setAttribute('data-dock-active', '')
    if (source === el) el.setAttribute('data-dock-copies', '')

    // The copies must lay out exactly as the text (same lines, same places); if not, no effect this time. Something
    // the element draws before its words (About's label: its rule, a ::before) is not in a copy, which then starts its
    // words that much earlier: the copies leave the same room first.
    const copied = textNodes(first.el)
    if (copied.length !== nodes.length) return false
    const lead = lines[0].cells[0]
    const led = boxAt(copied, lead.spot, document.createRange(), local)
    if (led && Math.abs(lead.left - led.left) > 0.5 && Math.abs(lead.top - led.top) <= 0.5) {
      copyIndent = lead.left - led.left
      first.el.style.marginLeft = `${copyIndent.toFixed(3)}px`
    }
    if (!inPlace(lines, copied, local)) return false

    // Where one line's cells end and the next line's begin: halfway between the lower ink of the one and the upper ink
    // of the other, so descenders and ascenders keep their own line.
    const between = lines.slice(1).map((line, i) => (lines[i].inkBottom + line.inkTop) / 2)

    // Where two cells on a line meet. Letters: halfway across the gap between the ink of the one and the ink of the
    // other (not halfway between their boxes), so a serif reaching past its letter's box stays whole in its letter's
    // cell when the two sit at different sizes (the reviewer saw HARLIE's A lose the tip of its foot beside the R).
    // Words: halfway across the space between them.
    const meeting = (a: Cell, b: Cell) => {
      const at = mode === 'words' ? (a.left + a.width + b.left) / 2 : (a.left + a.inkRight + (b.left - b.inkLeft)) / 2
      return Math.min(b.centre, Math.max(a.centre, at))
    }

    // The cells: out to those meeting points with the neighbours on the line and to the boundaries with the lines
    // above and below, without limit at the text's outer edges, so together they tile the text. Their edges sit on
    // whole device pixels, so neighbouring cells meet without a faint anti-aliased seam. In the copies' own pixels:
    // a copy fills the element's padding box, and starts its words later by as much as the element does.
    const originX = box.left + copyIndent
    const originY = box.top
    const dpr = window.devicePixelRatio || 1
    const onPixel = (value: number, origin: number) => (Math.round((origin + value * zoom) * dpr) / dpr - origin) / zoom
    lines.forEach((line, i) => {
      line.clipTop = i === 0 ? -FAR : onPixel(between[i - 1], rect.top) - originY
      line.clipBottom = i === lines.length - 1 ? FAR : onPixel(between[i], rect.top) - originY
      line.cells.forEach((c, j) => {
        const before = line.cells[j - 1]
        const after = line.cells[j + 1]
        c.clipLeft = before ? onPixel(meeting(before, c), rect.left) - originX : -FAR
        c.clipRight = after ? onPixel(meeting(c, after), rect.left) - originX : FAR
        c.ox = c.centre - originX
        c.oy = line.baseline - originY
      })
    })

    // New words in the text (the contact form's sent line) would leave the copies behind: back to rest at once.
    observer = new MutationObserver((records) => {
      if (records.some((r) => !layer?.contains(r.target))) snap()
    })
    observer.observe(source, { childList: true, characterData: true, subtree: true })
    return true
  }

  /** One more copy of the text, hidden until a run of cells needs it. */
  function addCopy() {
    const node = document.createElement('span')
    node.className = 'dock-title__copy'
    for (const child of source.childNodes) if (child !== layer) node.append(child.cloneNode(true))
    for (const named of node.querySelectorAll('[id]')) named.removeAttribute('id')
    if (copyIndent) node.style.marginLeft = `${copyIndent.toFixed(3)}px`
    layer!.append(node)
    const copy: Copy = { el: node, transform: 'none', clip: '', shown: true }
    copies.push(copy)
    return copy
  }

  /** Back to exactly the rest state: the title's own letters as they were, the layer gone. */
  const rest = () => {
    cancelAnimationFrame(frame)
    frame = 0
    observer?.disconnect()
    observer = null
    for (const c of cells) if (c.el) restoreStyle(c.el, c.style)
    if (follower?.moved) restoreStyle(follower.el, follower.style)
    follower = null
    layer?.remove()
    layer = null
    copies = []
    // What was measured stays in `kept` for the next hover.
    cells = []
    lines = []
    nodes = []
    measured = false
    source = el
    el.removeAttribute('data-dock-active')
    el.removeAttribute('data-dock-copies')
    if (active) {
      active = false
      window.removeEventListener('scroll', wake, true)
      window.removeEventListener('resize', snap)
      window.removeEventListener('blur', leave)
      document.removeEventListener('selectionchange', onSelectionChange)
      document.fonts?.removeEventListener?.('loadingdone', snap)
      unsubscribeMotion?.()
      unsubscribeMotion = null
    }
  }

  /** The line under the pointer (the nearest one), or -1 when the pointer is off the text. */
  const lineAt = (y: number) => {
    if (!hovered) return -1
    let best = -1
    let distance = Infinity
    lines.forEach((line, i) => {
      const d = y < line.top ? line.top - y : y > line.bottom ? y - line.bottom : 0
      if (d < distance) {
        distance = d
        best = i
      }
    })
    return best
  }

  /**
   * How strongly a cell swells for the pointer at `x` on its line, 0 to 1: a smooth hill centred on the pointer. A
   * letter by its distance from its centre; a word by its distance from its nearest edge, so the word under the
   * pointer is the largest wherever the pointer is on it, and its neighbours grow as the pointer nears them.
   */
  const hillOf = (c: Cell, x: number) => {
    const d = mode === 'words' ? Math.max(0, Math.abs(x - c.centre) - c.width / 2) : Math.abs(x - c.centre)
    const distance = d / reach
    return distance >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * distance)
  }

  /*
   * Neighbouring cells that sit the same way (those still at rest before the swell, those slid along after it, whole
   * lines above and below it) are drawn by one copy clipped to their cells together; spare copies are hidden. A copy
   * is made when a frame first needs more of them than there are.
   */
  const drawCopies = () => {
    const runs: Run[] = []
    for (const line of lines) {
      const row = line.cells
      if (row.every((c) => c.transform === row[0].transform)) {
        const previous = runs[runs.length - 1]
        if (previous?.band && previous.transform === row[0].transform) previous.bottom = line.clipBottom
        else runs.push({ transform: row[0].transform, left: -FAR, right: FAR, top: line.clipTop, bottom: line.clipBottom, band: true })
        continue
      }
      for (let start = 0; start < row.length; ) {
        let end = start
        while (end + 1 < row.length && row[end + 1].transform === row[start].transform) end++
        runs.push({ transform: row[start].transform, left: row[start].clipLeft, right: row[end].clipRight, top: line.clipTop, bottom: line.clipBottom, band: false })
        start = end + 1
      }
    }
    runs.forEach((run, i) => {
      const copy = copies[i] ?? addCopy()
      const whole = run.left === -FAR && run.right === FAR && run.top === -FAR && run.bottom === FAR
      const [l, r, t, b] = [run.left, run.right, run.top, run.bottom].map((v) => v.toFixed(3))
      const clip = whole ? '' : `polygon(${l}px ${t}px, ${r}px ${t}px, ${r}px ${b}px, ${l}px ${b}px)`
      if (copy.clip !== clip) copy.el.style.clipPath = copy.clip = clip
      if (copy.transform !== run.transform) {
        copy.el.style.transform = run.transform === 'none' ? '' : run.transform
        copy.transform = run.transform
      }
      if (!copy.shown) {
        copy.el.style.visibility = ''
        copy.shown = true
      }
    })
    for (let i = runs.length; i < copies.length; i++) {
      if (!copies[i].shown) continue
      copies[i].el.style.visibility = 'hidden'
      copies[i].shown = false
    }
  }

  const tick = (now: number) => {
    frame = 0
    // A page change took the text away.
    if (!el.isConnected) {
      rest()
      return
    }
    // The first frame of a hover reads the text (not the pointer's own event, so a pointer passing over costs one
    // reading a frame at most); a pointer already gone leaves it unread.
    if (!measured) {
      if (!hovered) {
        rest()
        return
      }
      if (!measure()) {
        failed = true
        rest()
        return
      }
      measured = true
    }
    const seconds = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60)
    last = now
    const { rect, zoom } = frameOf()
    // A scroll can carry the text out from under a still pointer.
    if (hovered && (pointerX < rect.left || pointerX > rect.right || pointerY < rect.top || pointerY > rect.bottom)) hovered = false
    const x = (pointerX - rect.left) / zoom
    const at = lineAt((pointerY - rect.top) / zoom)

    // Where the swell is heading: the hill on the pointer's line (none on a link, which keeps its place). Running text
    // swells into the room on the side each cell grows to (towards the line's end; towards its start for the cells
    // before its pivot) and lower where that room is short; a line set about its centre, into the room on both sides.
    let toStart = peak - 1
    let toEnd = peak - 1
    if (at >= 0) {
      const row = lines[at]
      let needStart = 0
      let needEnd = 0
      for (const c of row.cells) {
        c.hill = c.index >= row.fixedFrom && c.index <= row.fixedTo ? 0 : hillOf(c, x)
        if (c.index < row.pivot) needStart += c.width * c.hill
        else needEnd += c.width * c.hill
      }
      if (!title) {
        const roomStart = row.left - Math.min(leftLimit, row.left)
        const roomEnd = Math.max(rightLimit, row.right) - row.right
        if (anchor === 'center' && row.fixedFrom < 0) {
          const room = 2 * Math.min(roomStart, roomEnd)
          if ((needStart + needEnd) * toEnd > room) toStart = toEnd = room / (needStart + needEnd)
        } else {
          if (needStart * toStart > roomStart) toStart = roomStart / needStart
          if (needEnd * toEnd > roomEnd) toEnd = roomEnd / needEnd
        }
      }
    }

    let moving = false
    for (const c of cells) {
      const target = c.line === at ? 1 + (c.index < lines[at].pivot ? toStart : toEnd) * c.hill : 1
      if (c.scale === target && c.speed === 0) continue
      for (let t = 0; t < seconds; t += STEP) {
        const h = Math.min(STEP, seconds - t)
        const force = -SPRING.stiffness * (c.scale - target) - SPRING.damping * c.speed
        c.speed += (force / SPRING.mass) * h
        c.scale += c.speed * h
      }
      if (Math.abs(c.scale - target) > REST_SCALE || Math.abs(c.speed) > REST_SPEED) moving = true
      else {
        c.scale = target
        c.speed = 0
      }
    }

    // The other lines give way: those above rise by what the grown ascenders below them would overlap, those below
    // drop by what the grown descenders above them would (a title's lines, set close, by the whole growth).
    const rise = lines.map((row) => Math.max(0, ...row.cells.map((c) => (c.scale - 1) * c.ascent)))
    const drop = lines.map((row) => Math.max(0, ...row.cells.map((c) => (c.scale - 1) * c.descent)))
    const up: number[] = []
    const down: number[] = []
    for (let p = 0; p < lines.length - 1; p++) {
      const need = Math.max(0, rise[p + 1] + drop[p] - gaps[p])
      up[p] = need > 0 ? (need * rise[p + 1]) / (rise[p + 1] + drop[p]) : 0
      down[p] = need - up[p]
    }

    lines.forEach((line, k) => {
      let dy = 0
      for (let p = 0; p < lines.length - 1; p++) dy += p < k ? down[p] : -up[p]
      // Each cell slides along by the extra width of those before it, and half its own (it grows from its centre).
      let before = 0
      let startward = 0
      for (const c of line.cells) {
        const extra = c.width * (c.scale - 1)
        c.shift = before + extra / 2
        before += extra
        if (c.index < line.pivot) startward += extra
      }
      let offset: number
      if (title) {
        // A title keeps its start (its end, set from the right) and gives way the other way only where it would pass
        // the viewport's edge; its start stays in bounds first.
        offset = anchor === 'end' ? -before : anchor === 'center' ? -before / 2 : 0
        const over = line.right + before + offset - Math.max(rightLimit, line.right)
        if (over > 0) offset -= over
        const under = Math.min(leftLimit, line.left) - (line.left + offset)
        if (under > 0) offset += under
      } else if (anchor === 'center' && line.fixedFrom < 0) offset = -before / 2
      // Other text never moves its pivot: its start, its end (set from the right) or the link on it.
      else offset = -startward
      for (const c of line.cells) {
        const shift = c.shift + offset
        let transform: string
        if (c.scale === 1 && Math.abs(shift) < 0.01 && Math.abs(dy) < 0.01) transform = 'none'
        else if (c.el) transform = `translate(${shift.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${c.scale.toFixed(4)})`
        else if (c.scale === 1) transform = `translate(${shift.toFixed(2)}px, ${dy.toFixed(2)}px)`
        // A copy grows about the cell's centre on the baseline (its transform-origin is its corner).
        else transform = `translate(${(shift + c.ox).toFixed(2)}px, ${(dy + c.oy).toFixed(2)}px) scale(${c.scale.toFixed(4)}) translate(${(-c.ox).toFixed(2)}px, ${(-c.oy).toFixed(2)}px)`
        if (c.el) {
          if (c.transform !== transform) c.el.style.transform = c.transform = transform
        } else c.transform = transform
      }
      if (follower && k === lines.length - 1) {
        const move = Math.abs(before + offset) < 0.01 && Math.abs(dy) < 0.01 ? '' : `${(before + offset).toFixed(2)}px ${dy.toFixed(2)}px`
        if (follower.at !== move) {
          follower.el.style.translate = follower.at = move
          follower.moved = true
        }
      }
    })
    if (layer) drawCopies()

    if (moving) frame = requestAnimationFrame(tick)
    else if (!hovered) rest()
  }

  function wake() {
    if (!active || frame) return
    last = 0
    frame = requestAnimationFrame(tick)
  }

  const selectionOnEl = () => {
    const selection = document.getSelection()
    return !!selection && !selection.isCollapsed && selection.containsNode(el, true)
  }

  // PORTFOLIO types itself in behind a clip (home.css type-reveal), which would cut the grown letters.
  const typing = () => el.getAnimations({ subtree: true }).some((a) => a.playState === 'running' && (a as CSSAnimation).animationName === 'type-reveal')

  function leave() {
    hovered = false
    waiting = false
    failed = false
    wake()
  }

  // A selection on the text: the letters settle, so the selection shows on the text itself.
  function onSelectionChange() {
    if (hovered && selectionOnEl()) leave()
  }

  // A new window size, a font arriving, new words or reduced motion turned on: straight back to rest (measured afresh
  // on the next move).
  function snap() {
    hovered = false
    waiting = false
    kept = null
    rest()
  }

  // The text is read at the first frame (tick), not here in the pointer's event.
  function begin() {
    if (!active) {
      if (failed) return
      waiting = typing()
      if (waiting) return
      active = true
      window.addEventListener('scroll', wake, { capture: true, passive: true })
      window.addEventListener('resize', snap)
      window.addEventListener('blur', leave)
      document.addEventListener('selectionchange', onSelectionChange)
      document.fonts?.addEventListener?.('loadingdone', snap)
      unsubscribeMotion = subscribeMotion(snap)
    }
    wake()
  }

  return {
    move(x, y, buttons) {
      if (motionReduced()) return
      // Pressing to select, or a selection already on the text: the letters settle.
      if (buttons !== 0 || selectionOnEl()) {
        leave()
        return
      }
      pointerX = x
      pointerY = y
      hovered = true
      begin()
    },
    leave,
    typed() {
      if (!waiting) return
      waiting = false
      if (hovered && el.matches(':hover') && !motionReduced() && !selectionOnEl()) begin()
    },
    snap,
  }
}

/**
 * Gives the title in `ref` the dock's letter magnification under a mouse or trackpad (DockTitle, TypeLine). Letters
 * the title already renders are marked data-dock-letter (TypeLine's); otherwise its text is drawn by copies while
 * hovered. The site's other text gets the same from dockText.ts.
 */
export function useDockTitle(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const title = ref.current
    if (!title) return
    const dock = createDock(title, { mode: 'letters', title: true })
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') dock.move(e.clientX, e.clientY, e.buttons)
    }
    const onLeave = () => dock.leave()
    // A pointer that came to rest on PORTFOLIO while it typed starts the swell as soon as the typing ends.
    const onTyped = (e: AnimationEvent) => {
      if (e.animationName === 'type-reveal') dock.typed()
    }
    // Marks the title for dock-title.css (PORTFOLIO's own letter rise gives way to the dock) and for dockText.ts.
    title.setAttribute('data-dock-title', '')
    title.addEventListener('pointermove', onMove)
    title.addEventListener('pointerdown', onLeave)
    title.addEventListener('pointerleave', onLeave)
    title.addEventListener('animationend', onTyped)
    return () => {
      title.removeEventListener('pointermove', onMove)
      title.removeEventListener('pointerdown', onLeave)
      title.removeEventListener('pointerleave', onLeave)
      title.removeEventListener('animationend', onTyped)
      dock.snap()
      title.removeAttribute('data-dock-title')
    }
  }, [ref])
}
