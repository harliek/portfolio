/*
 * The active section of a two-column story with ONE sticky media region
 * (CaseScroll and the Creative Production FilmScroll share it).
 *
 * The active section is the last one whose top has passed an activation line
 * at 40% of the viewport, read from the scroll position (rAF-throttled). It is
 * an external store: scroll updates never set state inside an effect, and the
 * snapshot changes only when the active section changes, so fast or backward
 * scrolling lands on the same state without a queue.
 *
 * The end of the story (desktop, when the media column is attached):
 * - The sticky region leaves with its column once the column's bottom reaches
 *   it. On a short viewport (a laptop) the region is usually taller than the
 *   last section, so without help it would start to leave while the last
 *   section is still low on the screen, and at the page end it would sit
 *   partly under the header beside text that is still being read. When the
 *   region cannot stay in full view down to the page end, the text column
 *   gets a tail (--cs-tail) of the region's height minus the last section's:
 *   the region stays pinned until the last section's top has reached the
 *   region's top, and then both leave together.
 * - When the region stays in view to the page end, there is no tail; the
 *   line moves down gradually near the end (never above 40%, at most to 75%
 *   of the viewport), so the last section still becomes active LAST_DWELL of
 *   the viewport before the region starts to move (or before the page end).
 *   The line is a pure function of the scroll position.
 */

/** Share of the viewport height where a section becomes active. */
const ACTIVATION_LINE = 0.4
/** The last section is active for at least this share of the viewport height before the region moves (or the page ends). */
const LAST_DWELL = 0.22
/** The lowest the activation line may move near the end (share of the viewport). */
const MAX_LINE = 0.75
/** The line moves down over RAMP × the distance it moves, so the sections before the last keep most of their time. */
const RAMP = 3

export class StoryTracker {
  private els: Array<HTMLElement | null> = []
  private grid: HTMLElement | null = null
  private column: HTMLElement | null = null
  private sticky: HTMLElement | null = null
  private body: HTMLElement | null = null
  private active = -1
  private frame = 0
  private listeners = new Set<() => void>()
  private ro: ResizeObserver | null = null
  /** Layout values that do not change with scrolling are re-read after a resize or a content change. */
  private dirty = true
  private stickyTop = 0
  private tail = 0

  setEl(i: number, el: HTMLElement | null) {
    this.els[i] = el
    this.relayout()
  }

  /** Drops elements beyond the current section count. */
  setCount(n: number) {
    this.els.length = n
  }

  /** Ref callback for the media column (desktop only): its grid, sticky region and text column are found from it. Stable identity. */
  attachMedia = (column: HTMLElement | null) => {
    if (column === this.column) return
    this.setTail(0)
    this.column = column
    this.grid = column?.parentElement ?? null
    this.sticky = column?.querySelector<HTMLElement>('.cs-sticky') ?? null
    this.body = this.grid?.querySelector<HTMLElement>(':scope > .cs-body') ?? null
    this.relayout()
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    if (this.listeners.size === 1) {
      window.addEventListener('scroll', this.schedule, { passive: true })
      window.addEventListener('resize', this.relayout)
      this.ro = new ResizeObserver(this.relayout)
      this.ro.observe(document.body)
      this.schedule()
    }
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size) return
      window.removeEventListener('scroll', this.schedule)
      window.removeEventListener('resize', this.relayout)
      this.ro?.disconnect()
      this.ro = null
      cancelAnimationFrame(this.frame)
      this.frame = 0
    }
  }

  getSnapshot = () => this.active

  private schedule = () => {
    if (!this.frame && this.listeners.size) this.frame = requestAnimationFrame(this.measure)
  }

  private relayout = () => {
    this.dirty = true
    this.schedule()
  }

  private setTail(px: number) {
    this.tail = px
    if (px > 0) this.grid?.style.setProperty('--cs-tail', `${px}px`)
    else this.grid?.style.removeProperty('--cs-tail')
  }

  /**
   * The tail under the last section. None of these values depends on the tail
   * itself (the content after the grid, the region's and the last section's
   * heights), so setting it never feeds back into the next measurement.
   */
  private updateTail(vh: number, sticky: HTMLElement, lastEl: HTMLElement) {
    const style = getComputedStyle(sticky)
    this.stickyTop = Number.parseFloat(style.top) || 0
    const header = Number.parseFloat(style.getPropertyValue('--header-height')) || 0
    const region = sticky.offsetHeight
    const grid = this.grid!
    // Where the grid's bottom sits at the page end: above the next-project link and the footer.
    const after = document.documentElement.scrollHeight - (grid.getBoundingClientRect().bottom + window.scrollY)
    const endBottom = vh - after
    // The region may rise into the gap above it and still be in full view; any more and it would slide under the header.
    const fits = endBottom - region >= header
    const tail = fits ? 0 : Math.max(0, Math.ceil(region - lastEl.getBoundingClientRect().height))
    if (Math.abs(tail - this.tail) > 1) this.setTail(tail)
  }

  /** The activation line (px from the viewport top) at the current scroll position. */
  private line(vh: number) {
    const base = vh * ACTIVATION_LINE
    const lastEl = this.els[this.els.length - 1]
    const { column, sticky } = this
    if (!lastEl || !column || !sticky || !this.body) return base
    if (this.dirty) {
      this.dirty = false
      this.updateTail(vh, sticky, lastEl)
    }
    const y = window.scrollY
    const region = this.stickyTop + sticky.offsetHeight
    const dwell = vh * LAST_DWELL
    const lastTop = lastEl.getBoundingClientRect().top + y
    // The scroll position where the region starts to leave with its column, or the page end if that comes first.
    const unpin = column.getBoundingClientRect().bottom + y - region
    const end = Math.min(unpin, document.documentElement.scrollHeight - vh) - dwell
    const shift = Math.min(Math.max(lastTop - end - base, 0), vh * (MAX_LINE - ACTIVATION_LINE))
    if (!shift) return base
    // Never before arrival, so the opening visual always has its turn.
    const start = Math.max(0, end - RAMP * shift)
    const progress = end > start ? Math.min(Math.max((y - start) / (end - start), 0), 1) : y >= end ? 1 : 0
    return base + shift * progress
  }

  private measure = () => {
    this.frame = 0
    const line = this.line(window.innerHeight)
    let active = -1
    for (let i = 0; i < this.els.length; i++) {
      const el = this.els[i]
      if (!el) continue
      if (el.getBoundingClientRect().top <= line) active = i
      else break
    }
    if (active !== this.active) {
      this.active = active
      this.listeners.forEach((l) => l())
    }
  }
}
