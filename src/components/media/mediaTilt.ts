import { prefersReducedMotion } from '../../hooks/useReducedMotion'

/**
 * The photographs and films that tilt, the pictures inside the pages only (Harlie's request, 2026-09-27: not the
 * homepage tiles or About's creative cards, which only grow): a case study's picture and Jumpstart's phones, Creative
 * Production's films and the About portrait. Each page's CSS draws the tilt next to its own hover enlargement
 * (case-v16.css, client-work.css, about.css: `[data-tilt]`).
 */
const MEDIA = '.story__screen, .story__phone .picture, .cw-frame, .about-portrait'

/** A little beyond the element's own box still counts as over it: its hover enlargement (at most 5%) reaches that far. */
const REACH = 0.05

interface Box {
  left: number
  top: number
  width: number
  height: number
  /** How far beyond it still counts as over it (a share of its size; REACH unless set). */
  reach?: number
}

/**
 * A 3D tilt on the pictures inside the pages (Harlie's requests, 2026-09-27: the About headshot, after 21st.dev's
 * "3D Tilt Card", then "the same tilt on all photos and videos", then only the images on the pages). Under a mouse or trackpad the one under the pointer
 * leans towards it (the side under the pointer tips away, as if pressed), and settles flat when the pointer leaves.
 * The lean is up to 15 degrees on a portrait-sized picture and less on larger ones (down to 6 on the widest), with
 * the perspective deepening to match, so every size moves alike. Its shadow moves with the tilt, as in the original:
 * offset by half the tilt, softer the further it leans.
 *
 * One listener for the whole site. While a picture is tilted, it follows it once a frame (a homepage tile keeps
 * drifting under a still pointer, a page can scroll) and lets go when the pointer is no longer over it. Positions are
 * measured from each element's untransformed box, so the tilt and the enlargement never feed back into themselves.
 * The page's CSS reads data-tilt with --tilt-x, --tilt-y, --tilt-p (perspective) and --tilt-sx, --tilt-sy,
 * --tilt-blur (the shadow). Touch screens and reduced motion: nothing tilts.
 */
function install() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  let current: HTMLElement | null = null
  let frame = 0
  let x = 0
  let y = 0
  /** The tilt last written (degrees) and its perspective: a frame that changes neither by more than 0.05deg writes nothing. */
  let drawn: { x: number; y: number; p: number } | null = null

  /**
   * Its box as laid out, without any transform of its own (offsets from its offset parent, which may be moved). A
   * picture in a case study's gallery is placed and scaled by its holder ([data-tilt-box], CaseStory), so its box is
   * the holder's as drawn.
   */
  const box = (el: HTMLElement): Box => {
    const holder = el.parentElement?.closest<HTMLElement>('[data-tilt-box]')
    if (holder) {
      const r = holder.getBoundingClientRect()
      // Exactly its own box: the gallery's pictures lie close together.
      return { left: r.left, top: r.top, width: r.width, height: r.height, reach: 0 }
    }
    const parent = el.offsetParent as HTMLElement | null
    const p = parent?.getBoundingClientRect() ?? { left: 0, top: 0 }
    return {
      left: p.left + (parent?.clientLeft ?? 0) + el.offsetLeft,
      top: p.top + (parent?.clientTop ?? 0) + el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    }
  }

  const over = (b: Box) => {
    const mx = b.width * (b.reach ?? REACH)
    const my = b.height * (b.reach ?? REACH)
    return x >= b.left - mx && x <= b.left + b.width + mx && y >= b.top - my && y <= b.top + b.height + my
  }

  /**
   * The picture under the pointer: the one it is over, or, through a case study's zoom button (a transparent button
   * laid over the held picture, CaseStory), the picture or phone beneath it (in a gallery, the button's own picture).
   */
  const pick = (target: Element | null): HTMLElement | null => {
    const own = target?.closest?.<HTMLElement>(MEDIA)
    if (own) return own
    const tile = target?.closest?.('[data-tilt-box]')?.querySelector<HTMLElement>(MEDIA)
    if (tile) return tile
    const stage = target?.closest?.('.story__zoom')?.closest('.story__stage')
    if (!stage) return null
    return [...stage.querySelectorAll<HTMLElement>(MEDIA)].find((el) => over(box(el))) ?? null
  }

  const release = () => {
    cancelAnimationFrame(frame)
    frame = 0
    if (current) delete current.dataset.tilt
    current = null
    drawn = null
  }

  const follow = () => {
    frame = 0
    const el = current
    if (!el) return
    const b = box(el)
    if (!el.isConnected || !over(b)) {
      release()
      return
    }
    const size = Math.max(b.width, b.height)
    const max = Math.min(15, Math.max(6, (15 * 430) / size))
    const clamp = (v: number) => Math.max(-1, Math.min(1, v))
    const tiltX = clamp((y - b.top - b.height / 2) / (b.height / 2)) * -max
    const tiltY = clamp((x - b.left - b.width / 2) / (b.width / 2)) * max
    const perspective = Math.round(Math.max(1000, size * 2.2))
    // Followed every frame, but restyled only when the lean has changed (Harlie's brief, 2026-09-28: a still pointer
    // over a picture wrote six properties a frame, restyling it for nothing).
    if (!drawn || Math.abs(tiltX - drawn.x) > 0.05 || Math.abs(tiltY - drawn.y) > 0.05 || perspective !== drawn.p) {
      drawn = { x: tiltX, y: tiltY, p: perspective }
      el.style.setProperty('--tilt-p', `${perspective}px`)
      el.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`)
      el.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`)
      el.style.setProperty('--tilt-sx', `${(tiltY * 0.5).toFixed(1)}px`)
      el.style.setProperty('--tilt-sy', `${(tiltX * 0.5).toFixed(1)}px`)
      el.style.setProperty('--tilt-blur', `${(40 + Math.abs(tiltX + tiltY) * 0.5).toFixed(1)}px`)
    }
    if (!('tilt' in el.dataset)) el.dataset.tilt = ''
    frame = requestAnimationFrame(follow)
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch' || prefersReducedMotion()) {
      release()
      return
    }
    x = e.clientX
    y = e.clientY
    if (current && over(box(current))) return
    const next = pick(e.target as Element | null)
    if (next === current) return
    release()
    current = next
    if (current) frame = requestAnimationFrame(follow)
  }
  const onOut = (e: MouseEvent) => {
    if (!e.relatedTarget) release()
  }

  document.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('mouseout', onOut)
  window.addEventListener('blur', release)
}

if (typeof window !== 'undefined') install()
