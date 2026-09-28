import { useLayoutEffect, type RefObject } from 'react'

/**
 * The space last added, for the window size it was measured at: set again as the page mounts (before the router
 * restores a scroll position), so coming back to About's end lands where it rested, not clamped short of it.
 */
let remembered: { size: string; rest: number } | null = null

const windowSize = () => `${window.innerWidth}x${window.innerHeight}`

/**
 * The floating pill's lower edge (px from the window's top; layout.css: 6px down, 48px tall). Not read from the
 * header, which may still be the full bar while the page is measured at its top.
 */
const PILL_BOTTOM = 54

/**
 * How far the pill may reach over a picture's top edge (px) at the end: a tablet's end otherwise had to choose between
 * the art strip's top 19px under the pill and about 500px of empty space under the form.
 */
const PICTURE_UNDER = 24

/** Document coordinates of a box (window rects plus the scroll). */
const docRect = (r: DOMRect) => ({ top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, left: r.left, right: r.right })

/**
 * Where About's end rests (Harlie's brief, 2026-09-28: no heading or line under the floating navigation at a settled
 * state; the contact section is the page's natural final state). Scrolled to the end, the window's top falls wherever
 * the content happens to end. Mostly that is fine (at 1440 × 900 the end shows "02 Creative work" and "03 Get in
 * touch" whole). But at 1920 × 1080 the Education lines ended under the navigation pill, on a 2560 × 1440 screen the
 * introduction did, and on a 375 × 667 phone "03 Get in touch" did.
 *
 * So the natural end is checked first: it stays as it is if it is clean, that is, no line of text is cut by the
 * window's top edge and none sits under the pill in the navigation's band (above --header-safe, where a scroll to a
 * section label stops: the label's scroll-margin-top, about.css). Otherwise the end moves down to the first clean
 * place, just past a line of text, adding the least space; or to a section's start (its label on the safe line, the
 * section before just out of view above) if one is clean within a quarter of the window beyond that, since a section's
 * start makes the more deliberate last screen. The space is added under the form as --about-rest (about.css). It never
 * goes past "Get in touch", whose gap above always clears the band (about.css), so the whole form stays in view: 03 on
 * a phone, 02 and 03 at 1920 × 1080, 01 to 03 at 2560 × 1440. Where even that does not fit (a phone on its side), the
 * page ends as it naturally would.
 *
 * The creative cards' pictures count too (Harlie's QA pass, 2026-09-28: the navigation never covers content at a
 * settled state); other pictures (the portrait, far above) never reach the end. The pill is centred and as wide as
 * Header.tsx measures it (--pill-w on the header), at most the window less 12px a side.
 *
 * Measured whenever the content or the window changes size (the film's "Watch on YouTube" link, the form's sent line,
 * fonts arriving, a phone's toolbar), but never while a page change is moving the pieces (html[data-shuffle],
 * pageChange.ts): their boxes are not where they rest until it ends, so it measures then (in the meantime the space
 * measured last time, at the same window size, stands). What changes above the end is taken out of the added space,
 * so the end of the page does not move under the reader.
 */
export function useRestingEnd(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const doc = document.documentElement
    let frame = 0
    if (remembered?.size === windowSize()) root.style.setProperty('--about-rest', `${remembered.rest}px`)

    const measure = () => {
      frame = 0
      const labels = [...root.querySelectorAll<HTMLElement>(':scope > section .about-section-label')]
      if (doc.hasAttribute('data-shuffle') || !labels.length) return
      const safe = parseFloat(getComputedStyle(labels[0]).scrollMarginTop) || 0
      const added = parseFloat(root.style.getPropertyValue('--about-rest')) || 0
      const view = window.innerHeight
      const width = doc.clientWidth
      // The document's end without the space added last time, and where the window's top would then rest.
      const end = doc.scrollHeight - added
      const naturalTop = Math.max(0, end - view)

      const header = document.querySelector<HTMLElement>('.site-header')
      const pillW = Math.min(parseFloat(header ? getComputedStyle(header).getPropertyValue('--pill-w') : '') || width, width - 24)
      const pill = { left: (width - pillW) / 2, right: (width + pillW) / 2 }

      // Every line of text in the page, in document coordinates.
      const lines: ReturnType<typeof docRect>[] = []
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
      const range = document.createRange()
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim()) continue
        range.selectNodeContents(node)
        for (const r of range.getClientRects()) if (r.width >= 2) lines.push(docRect(r))
      }
      // The creative cards' pictures, in document coordinates.
      const frames = [...root.querySelectorAll<HTMLElement>('.about-work__frame')].map((el) => docRect(el.getBoundingClientRect()))
      const across = (b: ReturnType<typeof docRect>, top: number, below: number) => b.bottom > top && b.top < top + below && b.right > pill.left && b.left < pill.right
      // A window top is clean when no line is cut by it and none in the band below it sits under the pill, and the pill
      // covers no more than an edge of a card's picture (PICTURE_UNDER; Harlie's QA pass, 2026-09-28: at 1366 × 768 and
      // 1280 × 800 the end rested with the pill over the cards' pictures). A picture cut by the window's top reads as
      // scrolling, a cut line as a mistake, so a picture may be cut there, clear of the pill.
      const clean = (top: number) =>
        !lines.some((l) => l.bottom > top && l.top < top + safe && (l.top < top || across(l, top, safe))) &&
        !frames.some((f) => across(f, top, PILL_BOTTOM - PICTURE_UNDER))

      let rest = 0
      if (!clean(naturalTop)) {
        // Section starts: the label on the safe line. Those the window can hold with everything after them come at or
        // below the natural end; "Get in touch" is the last, and the furthest the end may go.
        const starts = labels.map((label) => docRect(label.getBoundingClientRect()).top + (parseFloat(getComputedStyle(label).paddingTop) || 0) - safe)
        const last = starts[starts.length - 1]
        // Candidates: just past a line, a section's start, or a card's picture ending at the pill's lower edge.
        const tops = [...lines.map((l) => l.bottom), ...starts, ...frames.map((f) => f.bottom - PILL_BOTTOM)].filter((t) => t > naturalTop && t <= last).sort((a, b) => a - b)
        const first = tops.find(clean)
        if (first !== undefined) {
          // The least space added, or a section's start if one is clean within a quarter of the window beyond it.
          const start = starts.find((s) => s >= first && s - first <= view / 4 && clean(s))
          rest = Math.round((start ?? first) - naturalTop)
        }
      }
      if (rest !== added) root.style.setProperty('--about-rest', `${rest}px`)
      remembered = { size: windowSize(), rest }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const resized = new ResizeObserver(schedule)
    resized.observe(root)
    // A page change ending (its pieces now where they rest).
    const changed = new MutationObserver(schedule)
    changed.observe(doc, { attributes: true, attributeFilter: ['data-shuffle'] })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      resized.disconnect()
      changed.disconnect()
      // The space stays with the page as it leaves (its end does not shorten under the outgoing pieces).
      window.removeEventListener('resize', schedule)
    }
  }, [ref])
}
