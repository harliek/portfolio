import { createDock, type Dock } from './dockLetters'

/*
 * The titles' dock on every text on the site (Harlie's requests, 2026-09-30: "Is there any way to do the cool effect
 * that's on the titles? on all of the text", "Like instead of it growing bigger, it would do that", "you dont have to
 * do every letter if thats easier", then "For the titles, do letter by letter, though. Like, including titles in the
 * sections"). One listener for the whole site: a mouse moving over one of the blocks below gives that block a dock
 * (dockLetters.ts) on its first move, and the block it leaves settles back to rest. Nothing is added to the pages'
 * markup, and nothing runs while the pointer is elsewhere or still.
 *
 * The blocks are the words of lift.css's units (which also turn the line's pale pink with the rose glow under the
 * pointer), each swelling on its own innermost block of words: a case study's step swells in its heading or in its
 * text, whichever the pointer is on, the school in the line under the pointer. The titles with their own dock
 * (PORTFOLIO, the case studies' titles, About's name: DockTitle, TypeLine) are left to it. Keep these lists in step
 * with lift.css. Left out, as there: links and buttons, the header and navigation, the homepage tiles and their
 * captions, the card-hover galleries, the recordings' controls, the held pictures and their labels, the contact form's
 * labels and fields, About's creative cards, the film viewer.
 */

/** Titles and headings: they swell letter by letter, as the titles do. */
const LETTERS = [
  // The name above PORTFOLIO (its typing line's text).
  '.home .hero__name .type-line__text',
  // Each case study step's heading, and Creative Production's films' names.
  '.cx .story__title',
  '.cw-text > .cw-name',
  // About's "About" label, numbered section labels, the school's name line and the cards' titles.
  '.about-content .about-label',
  '.about-content .about-section-label',
  '.about-content .about-school__name',
  '.about-content .about-work__title',
  // The not-found and route-error headings.
  '.not-found > h1',
].join(', ')

/** Running text: whole words swell, the word under the pointer the most. */
const WORDS = [
  '.home .hero__line .type-line__text',
  '.cx .cx-meta > li',
  '.cx .cx-lede > p',
  '.cx .cx-lede',
  '.cx .story__text',
  '.cw-text > .cx-body > p',
  '.cw-text > .cx-body',
  '.about-content .about-descriptor',
  '.about-content .about-hero__copy > p',
  '.about-content .about-school__credentials > li',
  '.about-content .about-school__coursework',
  // The Education paragraph, and the "Get in touch" invitation in the same style.
  '.about-content .about-school__text > p',
  '.about-content .about-contact__status',
  '.not-found > p',
  '.site-end__copy',
].join(', ')

const BLOCKS = `${LETTERS}, ${WORDS}`

const docks = new WeakMap<HTMLElement, Dock>()
/** The dock under the pointer, and the element it last moved over (a new one is looked up only when it changes). */
let current: Dock | null = null
let lastTarget: EventTarget | null = null
let lastBlock: HTMLElement | null = null

/** A block of words to swell: its text laid out in lines of its own (a lede's paragraphs, not the lede around them). */
function isTextBlock(el: HTMLElement) {
  if (!el.textContent?.trim()) return false
  if (/flex|grid/.test(getComputedStyle(el).display)) return true
  for (const child of el.children) {
    const s = getComputedStyle(child)
    if (s.display === 'none' || s.position === 'absolute' || s.position === 'fixed') continue
    if (!s.display.startsWith('inline')) return false
  }
  return true
}

/** The block of words the pointer is on, if any. */
function blockAt(target: EventTarget | null) {
  if (!(target instanceof Element)) return null
  const block = target.closest<HTMLElement>(BLOCKS)
  if (!block || block.closest('[data-dock-title]') || !isTextBlock(block)) return null
  return block
}

function dockOf(block: HTMLElement) {
  let dock = docks.get(block)
  if (!dock) {
    dock = createDock(block, { mode: block.matches(LETTERS) ? 'letters' : 'words' })
    docks.set(block, dock)
  }
  return dock
}

function onMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  if (e.target !== lastTarget) {
    lastTarget = e.target
    lastBlock = blockAt(e.target)
  }
  const dock = lastBlock ? dockOf(lastBlock) : null
  if (dock !== current) {
    current?.leave()
    current = dock
  }
  dock?.move(e.clientX, e.clientY, e.buttons)
}

// Pressing to select: the letters settle, so the selection shows on the text itself.
function onDown() {
  current?.leave()
}

// The pointer left the window.
function onOut(e: PointerEvent) {
  if (e.relatedTarget) return
  current?.leave()
  current = null
  lastTarget = lastBlock = null
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', onMove, { capture: true, passive: true })
  window.addEventListener('pointerdown', onDown, { capture: true, passive: true })
  document.addEventListener('pointerout', onOut, { passive: true })
  import.meta.hot?.dispose(() => {
    window.removeEventListener('pointermove', onMove, { capture: true })
    window.removeEventListener('pointerdown', onDown, { capture: true })
    document.removeEventListener('pointerout', onOut)
    current?.snap()
  })
}
