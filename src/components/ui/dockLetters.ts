import './dock-title.css'
import { useEffect, type RefObject } from 'react'

/**
 * Dock-style magnification on a title's letters (Harlie's request: "use the
 * hover aspect of this effect on title letters", pointing at Aceternity's
 * Floating Dock). As the pointer moves along a title, each letter grows with
 * its closeness to the pointer: largest right under it, easing back to its
 * normal size about one and a half letters' height either side. The reach is
 * in ems, so the huge PORTFOLIO and a smaller case title feel alike. The
 * letters after a grown one step along so nothing overlaps, and everything
 * moves on the dock's own spring (mass 0.1, stiffness 150, damping 12),
 * settling back to rest when the pointer leaves.
 *
 * Transforms only: letters grow from their baseline and slide sideways by the
 * extra width of the letters before them, so nothing reflows and the lines
 * wrap exactly as before. The site's titles are left-aligned, so each line
 * keeps its start on the column and widens to the right (giving way leftwards
 * only where it would pass the viewport's edge). A wrapped title swells on
 * the line under the pointer, and its other lines give way vertically the
 * same way: the lines above rise by as much as the swell's ascenders grow and
 * the lines below drop by as much as its descenders grow, so a swell never
 * runs into another line. The swell also stops short of whatever sits just
 * above or below the title (the homepage's HARLIE KATZ label, a case study's
 * details, the site's header): where the room is tight, the peak is a little
 * lower.
 *
 * At rest the title is untouched: same markup, same layout, no transforms.
 * A title made of plain text (a case study's, About's name) keeps its text,
 * with its kerning, selection, find-in-page and screen-reader name. Only
 * while it is hovered is it drawn by a layer laid exactly over it, hidden
 * from screen readers: copies of its text, each clipped to one letter's cell,
 * so at rest the copies add up to the text pixel for pixel in every engine
 * (a lone letter drawn by itself lands a pixel off in WebKit, and loses the
 * kerning with its neighbours). Neighbouring letters that sit the same way
 * share one copy, so a frame draws a copy per letter in the swell and about
 * two more per line. A title already made of letters (PORTFOLIO, TypeLine's
 * data-dock-letter spans) has those letters moved directly.
 *
 * One animation frame loop per title, only while it is hovered or settling;
 * nothing re-renders. Mouse and trackpad only: nothing on touch screens and
 * nothing under reduced motion. While a selection is on the title, or
 * PORTFOLIO is still typing itself in, the letters stay at rest (a pointer
 * already resting on PORTFOLIO starts the swell as the typing ends).
 */

/** Size of the letter right under the pointer (the brief: up to about 1.5×), where there is room for it. */
const PEAK_SCALE = 1.45
/** Space the grown letters keep from the content above and below the title, in ems of its font size. */
const CLEARANCE_EM = 0.03
/** How far the swell reaches either side of the pointer, in ems of the title's font size. */
const REACH_EM = 1.45
/** The Floating Dock's spring (framer-motion's useSpring in the demo). */
const SPRING = { mass: 0.1, stiffness: 150, damping: 12 }
/** Integration step of the spring, in seconds: stable for this stiffness at any frame rate. */
const STEP = 1 / 240
/** Close enough to rest to stop the loop. */
const REST_SCALE = 0.0005
const REST_SPEED = 0.01
/** Space kept clear at the viewport's right edge when a line grows towards it, in pixels. */
const VIEWPORT_GUTTER = 16
/** Far enough to stand for "no limit" on a cell's outer edges. */
const FAR = 1e5

interface Cell {
  left: number
  right: number
  top: number
  bottom: number
}

interface Letter {
  el: HTMLElement
  /** The character it stands for (a drawn copy's letter). */
  ch: string
  /** The letter's rest box across its line, in the title's own (unscaled) pixels. */
  left: number
  width: number
  centre: number
  line: number
  /** How far the letter's ink reaches above and below its baseline at rest, in the title's pixels. */
  ascent: number
  descent: number
  /** The style attribute one of the title's own letters had before (restored exactly at rest). */
  style: string | null
  scale: number
  speed: number
  /** A drawn copy's cell (its letter's share of the title), in the copy's own pixels. */
  cell: Cell | null
  /** What was last written, so a frame only touches what changed. */
  transform: string
  clip: string
  shown: boolean
}

interface Line {
  letters: Letter[]
  top: number
  bottom: number
  right: number
  baseline: number
}

type Box = { left: number; top: number; width: number; height: number }

/**
 * Gives the title in `ref` the dock's letter magnification under a mouse or
 * trackpad. Letters the title already renders are marked data-dock-letter
 * (TypeLine's); otherwise its text is drawn by per-letter copies while hovered.
 */
export function useDockTitle(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const title = ref.current
    if (!title) return
    return attachDock(title)
  }, [ref])
}

function attachDock(title: HTMLElement) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  let letters: Letter[] = []
  let lines: Line[] = []
  let layer: HTMLElement | null = null
  let active = false
  let hovered = false
  let pointerX = 0
  let pointerY = 0
  let reach = 1
  /** The largest size a letter grows to on this title (PEAK_SCALE, or less where the room around the title is tight). */
  let peak = PEAK_SCALE
  /** A pointer arrived while PORTFOLIO was still typing: the swell starts when the typing ends. */
  let waiting = false
  /** How far a line may grow to the right before the viewport's edge, in the title's pixels. */
  let viewportRight = FAR
  let frame = 0
  let last = 0

  /** The title's box on screen and how much its ancestors scale it (the homepage's opening, a tile opening). */
  const frameOfTitle = () => {
    const rect = title.getBoundingClientRect()
    // offsetWidth is rounded to whole pixels, so within a pixel of it the title is not scaled.
    const width = title.offsetWidth
    const zoom = width > 0 && Math.abs(rect.width - width) > 1 ? rect.width / width : 1
    return { rect, zoom: zoom > 0 ? zoom : 1 }
  }

  /** Each visible character's box in the laid-out text under `root`, in the title's pixels. */
  const characterBoxes = (root: Node, local: (r: DOMRect) => Box) => {
    const range = document.createRange()
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    const boxes: { ch: string; box: Box }[] = []
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      const text = node.data
      for (let i = 0; i < text.length; ) {
        const ch = String.fromCodePoint(text.codePointAt(i) ?? 32)
        if (ch.trim()) {
          range.setStart(node, i)
          range.setEnd(node, i + ch.length)
          const r = range.getClientRects()[0]
          if (r && r.width > 0) boxes.push({ ch, box: local(r) })
        }
        i += ch.length
      }
    }
    return boxes
  }

  /** Groups boxes into lines by their vertical middle, top to bottom, each line's letters left to right. */
  const intoLines = (found: { el: HTMLElement; ch: string; box: Box; style: string | null }[]) => {
    const grouped: Line[] = []
    const all: Letter[] = []
    for (const { el, ch, box, style } of found) {
      const middle = box.top + box.height / 2
      let line = grouped.find((l) => Math.abs((l.top + l.bottom) / 2 - middle) < box.height / 2)
      if (!line) {
        line = { letters: [], top: box.top, bottom: box.top + box.height, right: box.left + box.width, baseline: 0 }
        grouped.push(line)
      }
      const letter: Letter = { el, ch, left: box.left, width: box.width, centre: box.left + box.width / 2, line: 0, ascent: 0, descent: 0, style, scale: 1, speed: 0, cell: null, transform: '', clip: '', shown: true }
      line.letters.push(letter)
      line.right = Math.max(line.right, box.left + box.width)
      all.push(letter)
    }
    grouped.sort((a, b) => a.top - b.top)
    grouped.forEach((line, i) => {
      line.letters.sort((a, b) => a.left - b.left)
      for (const l of line.letters) l.line = i
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

  /**
   * Each character's ink around its origin in the title's font, from the canvas's glyph metrics, in the title's
   * pixels: how far it reaches left and right of where it starts, and above and below the baseline.
   */
  const inkMeasurer = (style: CSSStyleDeclaration) => {
    const context = document.createElement('canvas').getContext('2d')
    const fontSize = parseFloat(style.fontSize) || 16
    const upper = style.textTransform === 'uppercase'
    // PORTFOLIO is thickened by a fine outline (home.css), which adds half its width to the ink on every side.
    const stroke = (parseFloat(style.getPropertyValue('-webkit-text-stroke-width')) || 0) / 2
    if (context) context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    return (ch: string) => {
      const metrics = context?.measureText(upper ? ch.toUpperCase() : ch)
      return {
        left: (metrics?.actualBoundingBoxLeft ?? 0) + stroke,
        right: (metrics?.actualBoundingBoxRight ?? fontSize * 0.6) + stroke,
        ascent: (metrics?.actualBoundingBoxAscent ?? fontSize * 0.75) + stroke,
        descent: Math.max(0, (metrics?.actualBoundingBoxDescent ?? 0) + stroke),
      }
    }
  }

  /**
   * The nearest content above and below the title that shares its columns (the homepage's HARLIE KATZ label over
   * PORTFOLIO, a case study's details under its title, the site's header), as screen edges: found among the
   * earlier and later elements beside the title and beside each of its ancestors, out to the page's main region.
   */
  const neighbours = (inkTop: number, inkBottom: number, left: number, right: number) => {
    let above = -Infinity
    let below = Infinity
    const shares = (r: DOMRect) => r.width > 0 && r.height > 0 && r.left < right && r.right > left
    for (let node: Element | null = title; node && node !== document.body && node.tagName !== 'MAIN'; node = node.parentElement) {
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

  /** The title's peak for the room around it: its tallest ascender and deepest descender, grown, stay clear of its neighbours. */
  const peakFor = (rect: DOMRect, zoom: number, fontSize: number) => {
    const first = lines[0]
    const final = lines[lines.length - 1]
    const tallest = Math.max(...letters.map((l) => l.ascent))
    const deepest = Math.max(...letters.map((l) => l.descent))
    const inkTop = first.baseline - Math.max(...first.letters.map((l) => l.ascent))
    const inkBottom = final.baseline + Math.max(...final.letters.map((l) => l.descent))
    // The letters' span across the page, with the room a swell takes to the right.
    const left = rect.left + Math.min(...letters.map((l) => l.left)) * zoom
    const right = rect.left + (Math.max(...lines.map((line) => line.right)) + reach) * zoom
    const { above, below } = neighbours(rect.top + inkTop * zoom, rect.top + inkBottom * zoom, left, right)
    const clearance = CLEARANCE_EM * fontSize
    const roomAbove = (rect.top - above) / zoom + inkTop - clearance
    const roomBelow = (below - rect.top) / zoom - inkBottom - clearance
    let most = PEAK_SCALE
    if (tallest > 0) most = Math.min(most, 1 + roomAbove / tallest)
    if (deepest > 0) most = Math.min(most, 1 + roomBelow / deepest)
    return Math.max(1, most)
  }

  /** Reads the title's letters at rest and sets up what the swell moves. False when there is nothing to move. */
  const measure = () => {
    const { rect, zoom } = frameOfTitle()
    const local = (r: DOMRect): Box => ({ left: (r.left - rect.left) / zoom, top: (r.top - rect.top) / zoom, width: r.width / zoom, height: r.height / zoom })
    const own = [...title.querySelectorAll<HTMLElement>('[data-dock-letter]')]
    const style = getComputedStyle(title)
    const fontSize = parseFloat(style.fontSize) || 16
    reach = REACH_EM * fontSize
    viewportRight = (document.documentElement.clientWidth - VIEWPORT_GUTTER - rect.left) / zoom
    title.setAttribute('data-dock-active', '')

    if (own.length) {
      // The title's own letters, read with no transform or transition of their own (home.css gives them a hover rise).
      const saved = own.map((el) => el.getAttribute('style'))
      for (const el of own) {
        el.style.transition = 'none'
        el.style.transform = 'none'
      }
      const found = own.map((el, i) => ({ el, ch: el.textContent ?? '', box: local(el.getBoundingClientRect()), style: saved[i] })).filter((f) => f.box.width > 0)
      if (!found.length) {
        own.forEach((el, i) => (saved[i] === null ? el.removeAttribute('style') : el.setAttribute('style', saved[i]!)))
        return false
      }
      ;({ grouped: lines, all: letters } = intoLines(found))
      const ink = inkMeasurer(style)
      for (const l of letters) ({ ascent: l.ascent, descent: l.descent } = ink(l.ch))
      // Letters grow from their baseline, found once in the first letter (they all share the font).
      const below = (baselineOf(found[0].el) - found[0].el.getBoundingClientRect().top) / zoom
      for (const line of lines) {
        line.baseline = line.top + below
        for (const l of line.letters) l.el.style.transformOrigin = `50% ${below.toFixed(3)}px`
      }
      peak = peakFor(rect, zoom, fontSize)
      return true
    }

    // A plain-text title: one copy of its text per letter, laid out exactly as the text itself.
    const source = title.querySelector<HTMLElement>('.dock-title__text') ?? title
    const chars = characterBoxes(source, local)
    if (!chars.length) return false
    layer = document.createElement('span')
    layer.className = 'dock-title__layer'
    layer.setAttribute('aria-hidden', 'true')
    // The layer clips what the copies spill (each is the whole title, scaled), out to the viewport's right edge, so the page never grows wider.
    layer.style.setProperty('--dock-out-right', `${Math.max(0, (document.documentElement.clientWidth - rect.right) / zoom).toFixed(2)}px`)
    const found = chars.map(({ ch, box }) => {
      const el = document.createElement('span')
      el.className = 'dock-title__copy'
      for (const node of source.childNodes) el.append(node.cloneNode(true))
      layer!.append(el)
      return { el, ch, box, style: null }
    })
    title.append(layer)
    ;({ grouped: lines, all: letters } = intoLines(found))

    // The copies must lay out exactly as the text (same lines, same places); if not, no effect this time.
    const copy = characterBoxes(found[0].el, local)
    if (copy.length !== chars.length || copy.some((c, i) => Math.abs(c.box.left - chars[i].box.left) > 0.5 || Math.abs(c.box.top - chars[i].box.top) > 0.5)) return false

    // Each line's baseline: an empty box at the end of a copy sits on the last line's, and every line has the same metrics.
    const below = (baselineOf(found[0].el) - rect.top) / zoom - lines[lines.length - 1].top
    for (const line of lines) line.baseline = line.top + below

    // Each letter's own ink (read from the font), for where the cells meet and how far a swell reaches up and down.
    const ink = inkMeasurer(style)
    const inks = letters.map((l) => ink(l.ch))
    letters.forEach((l, i) => ({ ascent: l.ascent, descent: l.descent } = inks[i]))
    const inkOf = new Map(letters.map((l, i) => [l, inks[i]]))
    peak = peakFor(rect, zoom, fontSize)

    // Where one line's letters end and the next line's begin: halfway between the lower ink of the one and the
    // upper ink of the other, so descenders and ascenders keep their own line.
    const lineInk = lines.map((line) => ({
      top: line.baseline - Math.max(...line.letters.map((l) => l.ascent)),
      bottom: line.baseline + Math.max(...line.letters.map((l) => l.descent)),
    }))
    const between = lines.slice(1).map((_, i) => (lineInk[i].bottom + lineInk[i + 1].top) / 2)

    // Where two letters on a line meet: halfway across the gap between the ink of the one and the ink of the other
    // (not halfway between their boxes), so a serif reaching past its letter's box stays whole in its letter's cell
    // when the two sit at different sizes (the reviewer saw HARLIE's A lose the tip of its foot beside the R).
    const meeting = (a: Letter, b: Letter) => {
      const at = (a.left + inkOf.get(a)!.right + (b.left - inkOf.get(b)!.left)) / 2
      return Math.min(b.centre, Math.max(a.centre, at))
    }

    // The cells: out to those meeting points with the neighbours on the line and to the boundaries with the lines
    // above and below, without limit at the title's outer edges, so together they tile the title. Their edges sit
    // on whole device pixels, so neighbouring cells meet without a faint anti-aliased seam.
    const edgeX = title.clientLeft
    const edgeY = title.clientTop
    const dpr = window.devicePixelRatio || 1
    const onPixel = (value: number, origin: number) => (Math.round((origin + value * zoom) * dpr) / dpr - origin) / zoom
    lines.forEach((line, i) => {
      const top = i === 0 ? -FAR : onPixel(between[i - 1], rect.top) - edgeY
      const bottom = i === lines.length - 1 ? FAR : onPixel(between[i], rect.top) - edgeY
      line.letters.forEach((l, j) => {
        const before = line.letters[j - 1]
        const after = line.letters[j + 1]
        const left = before ? onPixel(meeting(before, l), rect.left) - edgeX : -FAR
        const right = after ? onPixel(meeting(l, after), rect.left) - edgeX : FAR
        l.cell = { left, right, top, bottom }
        l.el.style.transformOrigin = `${(l.centre - edgeX).toFixed(3)}px ${(line.baseline - edgeY).toFixed(3)}px`
      })
      // From the first frame, each line is drawn by one copy.
      drawCopies(line, line.letters.map(() => 'none'))
    })
    return true
  }

  /** Back to exactly the rest state: the title's own letters as they were, the layer gone. */
  const rest = () => {
    cancelAnimationFrame(frame)
    frame = 0
    if (!layer) {
      for (const letter of letters) {
        // Cleared through the CSSOM first, so no empty style="" is left behind.
        letter.el.style.cssText = ''
        if (letter.style === null) letter.el.removeAttribute('style')
        else letter.el.setAttribute('style', letter.style)
      }
    }
    layer?.remove()
    layer = null
    letters = []
    lines = []
    title.removeAttribute('data-dock-active')
    active = false
    window.removeEventListener('scroll', wake, true)
  }

  /** The line under the pointer (the nearest one), or -1 when the pointer is off the title. */
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

  /** The size a letter is heading for: a smooth hill centred on the pointer, on the pointer's line only. */
  const targetOf = (letter: Letter, x: number, line: number) => {
    if (letter.line !== line) return 1
    const distance = Math.abs(x - letter.centre) / reach
    if (distance >= 1) return 1
    return 1 + (peak - 1) * (0.5 + 0.5 * Math.cos(Math.PI * distance))
  }

  const write = (letter: Letter, transform: string) => {
    if (letter.transform !== transform) letter.el.style.transform = letter.transform = transform
  }

  /*
   * Neighbouring letters that sit the same way (those still at rest before
   * the swell, those slid along after it) are drawn by one copy clipped to
   * their cells together; the other copies are hidden.
   */
  function drawCopies(line: Line, transforms: string[]) {
    const row = line.letters
    for (let start = 0; start < row.length; ) {
      let end = start
      while (end + 1 < row.length && transforms[end + 1] === transforms[start]) end++
      const lead = row[start]
      const first = row[start].cell!
      const final = row[end].cell!
      const [l, r, t, b] = [first.left, final.right, first.top, first.bottom].map((v) => v.toFixed(3))
      const clip = `polygon(${l}px ${t}px, ${r}px ${t}px, ${r}px ${b}px, ${l}px ${b}px)`
      if (lead.clip !== clip) lead.el.style.clipPath = lead.clip = clip
      write(lead, transforms[start])
      for (let j = start; j <= end; j++) {
        const shown = j === start
        if (row[j].shown !== shown) {
          row[j].el.style.visibility = shown ? '' : 'hidden'
          row[j].shown = shown
        }
      }
      start = end + 1
    }
  }

  const tick = (now: number) => {
    frame = 0
    const seconds = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60)
    last = now
    const { rect, zoom } = frameOfTitle()
    // A scroll can carry the title out from under a still pointer.
    if (hovered && (pointerX < rect.left || pointerX > rect.right || pointerY < rect.top || pointerY > rect.bottom)) hovered = false
    const x = (pointerX - rect.left) / zoom
    const line = lineAt((pointerY - rect.top) / zoom)

    let moving = false
    for (const letter of letters) {
      const target = targetOf(letter, x, line)
      for (let t = 0; t < seconds; t += STEP) {
        const h = Math.min(STEP, seconds - t)
        const force = -SPRING.stiffness * (letter.scale - target) - SPRING.damping * letter.speed
        letter.speed += (force / SPRING.mass) * h
        letter.scale += letter.speed * h
      }
      if (Math.abs(letter.scale - target) > REST_SCALE || Math.abs(letter.speed) > REST_SPEED) moving = true
      else {
        letter.scale = target
        letter.speed = 0
      }
    }

    // The other lines give way: each rises by as much as the ascenders on the lines below it have grown, and drops
    // by as much as the descenders on the lines above it have grown (Harlie's wrapped titles set their lines close).
    const rise = lines.map((row) => Math.max(0, ...row.letters.map((l) => (l.scale - 1) * l.ascent)))
    const drop = lines.map((row) => Math.max(0, ...row.letters.map((l) => (l.scale - 1) * l.descent)))
    const offsets = lines.map((_, k) => {
      let offset = 0
      for (let j = 0; j < lines.length; j++) offset += j < k ? drop[j] : j > k ? -rise[j] : 0
      return offset
    })

    for (const [index, row] of lines.entries()) {
      const dy = offsets[index]
      // Each letter slides along by the extra width of the letters before it, and half its own (it grows from its centre).
      let before = 0
      const shifts = row.letters.map((l) => {
        const extra = l.width * (l.scale - 1)
        const shift = before + extra / 2
        before += extra
        return shift
      })
      // The line keeps its start on the column; only a line that would pass the viewport's edge gives way leftwards.
      const held = Math.max(0, row.right + before - Math.max(viewportRight, row.right))
      const transforms = row.letters.map((l, i) => {
        const shift = shifts[i] - held
        return l.scale === 1 && Math.abs(shift) < 0.01 && Math.abs(dy) < 0.01 ? 'none' : `translate(${shift.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${l.scale.toFixed(4)})`
      })
      if (layer) drawCopies(row, transforms)
      else row.letters.forEach((l, i) => write(l, transforms[i]))
    }

    if (moving) frame = requestAnimationFrame(tick)
    else if (!hovered) rest()
  }

  function wake() {
    if (!active || frame) return
    last = 0
    frame = requestAnimationFrame(tick)
  }

  const selectionOnTitle = () => {
    const selection = document.getSelection()
    return !!selection && !selection.isCollapsed && selection.containsNode(title, true)
  }

  // PORTFOLIO types itself in behind a clip (home.css type-reveal), which would cut the grown letters.
  const typing = () => title.getAnimations({ subtree: true }).some((a) => a.playState === 'running' && (a as CSSAnimation).animationName === 'type-reveal')

  function onLeave() {
    hovered = false
    waiting = false
    wake()
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || reducedMotion.matches) return
    // Pressing to select, or a selection already on the title: the letters settle, so the selection shows on the text itself.
    if (e.buttons !== 0 || selectionOnTitle()) {
      onLeave()
      return
    }
    pointerX = e.clientX
    pointerY = e.clientY
    hovered = true
    begin()
  }

  function begin() {
    if (!active) {
      waiting = typing()
      if (waiting) return
      if (!measure()) {
        rest()
        return
      }
      active = true
      window.addEventListener('scroll', wake, { capture: true, passive: true })
    }
    wake()
  }

  // A pointer that came to rest on PORTFOLIO while it typed starts the swell as soon as the typing ends.
  const onTyped = (e: AnimationEvent) => {
    if (e.animationName !== 'type-reveal' || !waiting) return
    waiting = false
    if (hovered && title.matches(':hover') && !reducedMotion.matches && !selectionOnTitle()) begin()
  }

  const onSelectionChange = () => {
    if (active && hovered && selectionOnTitle()) onLeave()
  }

  // A new window size, a font arriving or reduced motion turned on: straight back to rest (measured afresh on the next move).
  const snap = () => {
    hovered = false
    if (active) rest()
  }

  // Marks the title for dock-title.css (PORTFOLIO's own letter rise gives way to the dock).
  title.setAttribute('data-dock-title', '')
  title.addEventListener('pointermove', onMove)
  title.addEventListener('pointerdown', onLeave)
  title.addEventListener('pointerleave', onLeave)
  title.addEventListener('animationend', onTyped)
  window.addEventListener('blur', onLeave)
  window.addEventListener('resize', snap)
  document.addEventListener('selectionchange', onSelectionChange)
  reducedMotion.addEventListener('change', snap)
  document.fonts?.addEventListener?.('loadingdone', snap)

  return () => {
    title.removeEventListener('pointermove', onMove)
    title.removeEventListener('pointerdown', onLeave)
    title.removeEventListener('pointerleave', onLeave)
    title.removeEventListener('animationend', onTyped)
    window.removeEventListener('blur', onLeave)
    window.removeEventListener('resize', snap)
    document.removeEventListener('selectionchange', onSelectionChange)
    reducedMotion.removeEventListener('change', snap)
    document.fonts?.removeEventListener?.('loadingdone', snap)
    rest()
    title.removeAttribute('data-dock-title')
  }
}
