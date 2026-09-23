import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getImage, largestSrc, PROVENANCE_LABEL, type ImageId } from '../../content/media'

interface DialogApi {
  open: (id: ImageId, trigger: HTMLElement) => void
}

const ImageDialogContext = createContext<DialogApi | null>(null)

export function useImageDialog(): DialogApi {
  const ctx = useContext(ImageDialogContext)
  if (!ctx) throw new Error('useImageDialog must be used inside <ImageDialogProvider>')
  return ctx
}

/** Collects zoomable images on the current page, in document order. */
function galleryFrom(trigger: HTMLElement): ImageId[] {
  const scope = trigger.closest('main') ?? document
  const ids = Array.from(scope.querySelectorAll<HTMLElement>('[data-zoom-id]')).map((el) => el.dataset.zoomId as ImageId)
  return Array.from(new Set(ids))
}

/**
 * One shared native <dialog> for image enlargement.
 * - showModal() contains focus; Escape closes (native cancel event).
 * - Focus returns to the activating control on close.
 * - Page scrolling is locked while open.
 * - "Actual size" switches to a scrollable detail view for dense artifacts.
 */
export function ImageDialogProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [gallery, setGallery] = useState<ImageId[]>([])
  const [index, setIndex] = useState(0)
  const [detail, setDetail] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback((id: ImageId, trigger: HTMLElement) => {
    const list = galleryFrom(trigger)
    triggerRef.current = trigger
    setGallery(list.length ? list : [id])
    setIndex(Math.max(0, list.indexOf(id)))
    setDetail(false)
    setIsOpen(true)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
      document.documentElement.classList.add('is-dialog-open')
      closeRef.current?.focus()
    }
  }, [isOpen])

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // Runs for every close path: button, Escape, backdrop, route change.
  const onClose = useCallback(() => {
    setIsOpen(false)
    document.documentElement.classList.remove('is-dialog-open')
    const trigger = triggerRef.current
    triggerRef.current = null
    if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true })
  }, [])

  // Close if the page unmounts underneath the dialog.
  useEffect(() => () => document.documentElement.classList.remove('is-dialog-open'), [])

  const count = gallery.length
  const go = useCallback(
    (delta: number) => {
      setIndex((i) => Math.min(count - 1, Math.max(0, i + delta)))
      setDetail(false)
    },
    [count],
  )

  const api = useMemo(() => ({ open }), [open])
  const current = isOpen && count ? getImage(gallery[index]) : null
  const label = current ? PROVENANCE_LABEL[current.provenance] : null

  return (
    <ImageDialogContext.Provider value={api}>
      {children}
      <dialog
        ref={dialogRef}
        className="image-dialog"
        aria-labelledby={current ? 'image-dialog-caption' : undefined}
        onClose={onClose}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
          if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
        }}
        onClick={(e) => {
          // A click on the backdrop (the dialog box itself, outside its content) closes.
          if (e.target === dialogRef.current) close()
        }}
      >
        {current && (
          <div className="image-dialog__panel">
            <div className="image-dialog__bar">
              <p className="image-dialog__count t-small tabular" aria-live="polite">
                {count > 1 ? `${index + 1} / ${count}` : ''}
              </p>
              <div className="image-dialog__controls">
                <button type="button" className="button button--quiet" onClick={() => go(-1)} disabled={index === 0}>
                  <span aria-hidden="true">←</span> Previous image
                </button>
                <button type="button" className="button button--quiet" onClick={() => go(1)} disabled={index >= count - 1}>
                  Next image <span aria-hidden="true">→</span>
                </button>
                <button type="button" className="button button--quiet" onClick={() => setDetail((d) => !d)}>
                  {detail ? 'Fit to screen' : 'Actual size'}
                </button>
                <button ref={closeRef} type="button" className="button" aria-label="Close image" onClick={close}>
                  Close
                </button>
              </div>
            </div>
            <div
              className="image-dialog__stage"
              data-detail={detail}
              role={detail ? 'region' : undefined}
              tabIndex={detail ? 0 : undefined}
              aria-label={detail ? 'Scrollable detail view' : undefined}
            >
              <picture key={current.id}>
                <source type="image/avif" srcSet={largestSrc(current, 'avif')} />
                <source type="image/webp" srcSet={largestSrc(current, 'webp')} />
                <img
                  src={largestSrc(current, current.fallback)}
                  width={current.width}
                  height={current.height}
                  alt={current.alt}
                  decoding="async"
                />
              </picture>
            </div>
            <p id="image-dialog-caption" className="image-dialog__caption t-small">
              {label && <span className="provenance">{label}</span>}
              {current.caption ?? current.alt}
            </p>
          </div>
        )}
      </dialog>
    </ImageDialogContext.Provider>
  )
}
