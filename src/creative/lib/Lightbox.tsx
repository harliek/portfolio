import { createContext, useContext, useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * The element dialogs render into: a layer at the end of the creative root,
 * above the fixed header. (In the original the dialog rendered inside the
 * page and the header stayed on top of its backdrop.)
 */
export const LayerContext = createContext<HTMLElement | null>(null)

/*
  One dialog implementation for the creative pages, as in the original: focus
  moves in, the page behind stops scrolling, Escape and a click on the ground
  close it, and focus goes back to whatever opened it.

  Archive repairs: the close control is a visible, labelled "Close" button;
  Tab stays inside the dialog; Arrow keys call onStep (series navigation).
*/
export function Lightbox({
  open,
  onClose,
  label,
  onStep,
  returnFocus,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  /** Arrow Left / Right: -1 / +1 (only when the content has a sequence). */
  onStep?: (dir: -1 | 1) => void
  /** Where focus goes on close. Defaults to the element that opened the dialog. */
  returnFocus?: () => HTMLElement | null
  children: ReactNode
}) {
  const layer = useContext(LayerContext)
  const ref = useRef<HTMLDivElement>(null)
  // Latest callbacks, so the effect below runs once per opening.
  const handlers = useRef({ onClose, onStep, returnFocus })
  useEffect(() => {
    handlers.current = { onClose, onStep, returnFocus }
  })

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const box = ref.current
    box?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handlers.current.onClose()
        return
      }
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && handlers.current.onStep) {
        if (e.altKey || e.ctrlKey || e.metaKey) return
        e.preventDefault()
        handlers.current.onStep(e.key === 'ArrowLeft' ? -1 : 1)
        return
      }
      if (e.key !== 'Tab' || !box) return
      const items = Array.from(
        box.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'),
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || active === box)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !box.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      const target = handlers.current.returnFocus?.() ?? opener
      target?.focus()
    }
  }, [open])

  const onGround = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="lb" role="dialog" aria-modal="true" aria-label={label} onMouseDown={onGround}>
      <div className="lb-box" ref={ref} tabIndex={-1}>
        <button type="button" className="lb-x" onClick={onClose}>
          <span>Close</span>
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        {children}
      </div>
    </div>,
    layer ?? document.body,
  )
}
