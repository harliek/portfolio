import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getImage, largestSrc, PROVENANCE_LABEL, type ImageId } from '../../content/media'

export interface OpenOptions {
  /**
   * The images to page through. Defaults to every zoomable image on the page
   * (`[data-zoom-id]`, document order); pass `[id]` for a single image.
   */
  gallery?: ImageId[]
  /** Caption for the opened image (default: its manifest caption), e.g. the caption shown beside it on the page. */
  caption?: ReactNode
  /** The caption carries its own label (e.g. Illustrative conversation), so the manifest's provenance label is not added. */
  labelled?: boolean
  /** Opens in the actual-size view (e.g. a wide image on a phone, where fitting it would make it no larger). */
  detail?: boolean
}

interface DialogApi {
  open: (id: ImageId, trigger: HTMLElement, options?: OpenOptions) => void
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
 * - A visible, labelled Close button (focused on open); Escape and a click on
 *   the backdrop also close (native cancel event).
 * - showModal() contains focus; focus returns to the activating control.
 * - Page scrolling is locked while open.
 * - Previous/Next buttons and the arrow keys appear only when there is more
 *   than one image.
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
  const [override, setOverride] = useState<{ id: ImageId; caption: ReactNode; labelled: boolean } | null>(null)

  const open = useCallback((id: ImageId, trigger: HTMLElement, options?: OpenOptions) => {
    const list = options?.gallery ?? galleryFrom(trigger)
    triggerRef.current = trigger
    setOverride(options?.caption ? { id, caption: options.caption, labelled: Boolean(options.labelled) } : null)
    setGallery(list.length ? list : [id])
    setIndex(Math.max(0, list.indexOf(id)))
    setDetail(Boolean(options?.detail))
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
  const ownCaption = current && override && override.id === current.id ? override : null
  const label = current && !ownCaption?.labelled ? PROVENANCE_LABEL[current.provenance] : null

  return (
    <ImageDialogContext.Provider value={api}>
      {children}
      <dialog
        ref={dialogRef}
        className="image-dialog"
        aria-labelledby={current ? 'image-dialog-caption' : undefined}
        onClose={onClose}
        onKeyDown={(e) => {
          if (count < 2) return
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
                {count > 1 && (
                  <>
                    <button type="button" className="button button--secondary button--small" onClick={() => go(-1)} disabled={index === 0}>
                      <span aria-hidden="true">←</span> Previous image
                    </button>
                    <button type="button" className="button button--secondary button--small" onClick={() => go(1)} disabled={index >= count - 1}>
                      Next image <span aria-hidden="true">→</span>
                    </button>
                  </>
                )}
                <button type="button" className="button button--secondary button--small" onClick={() => setDetail((d) => !d)}>
                  {detail ? 'Fit to screen' : 'Actual size'}
                </button>
                <button ref={closeRef} type="button" className="button button--small" onClick={close}>
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path d="m3.5 3.5 9 9m0-9-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
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
                  data-transparent={current.transparent ? 'true' : undefined}
                  src={largestSrc(current, current.fallback)}
                  width={current.width}
                  height={current.height}
                  alt={current.alt}
                  decoding="async"
                />
              </picture>
            </div>
            <p id="image-dialog-caption" className="image-dialog__caption t-small">
              {label && (
                <>
                  <span className="provenance">{label}</span>
                  <span className="provenance-sep"> · </span>
                </>
              )}
              {ownCaption ? ownCaption.caption : (current.caption ?? current.alt)}
            </p>
          </div>
        )}
      </dialog>
    </ImageDialogContext.Provider>
  )
}
