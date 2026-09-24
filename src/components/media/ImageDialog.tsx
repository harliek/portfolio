import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { getImage, largestSrc, type ImageAsset, type ImageId } from '../../content/media'
import { closeOnCancel, closeWithFade } from './dialogExit'

/** A region in percent of the opened image (x, y from its top-left corner). */
export type Region = { x: number; y: number; w: number; h: number }

export interface OpenOptions {
  /**
   * The images to page through. Defaults to every zoomable image on the page
   * (`[data-zoom-id]`, document order); pass `[id]` for a single image.
   */
  gallery?: ImageId[]
  /**
   * A discreet media label for the opened image (e.g. Illustrative conversation), shown in the view's top bar. There is
   * no caption (brief-v8 section 8): without a label the view shows the image alone.
   */
  label?: string
  /** Opens in the actual-size view (e.g. a wide image on a phone, where fitting it would make it no larger). */
  detail?: boolean
  /** The actual-size view opens (and reopens after Fit to screen) centred on this region (default: the top left). */
  focus?: Region
  /** A region marked in the actual-size view, in the page's accent (read from the trigger), e.g. the section's highlight. */
  highlight?: Region
}

interface DialogApi {
  open: (id: ImageId, trigger: HTMLElement, options?: OpenOptions) => void
}

const ImageDialogContext = createContext<DialogApi | null>(null)

/** The largest variant's pixel size (what the actual-size view shows once it has loaded). */
function actualSize(asset: ImageAsset): CSSProperties {
  const w = asset.widths[asset.widths.length - 1] ?? asset.width
  return { width: w, height: Math.round((w * asset.height) / asset.width) }
}

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
 *   the backdrop also close (native cancel event). It fades in and, on every
 *   one of these, fades out again (dialogExit.ts) before focus returns.
 * - showModal() contains focus; focus returns to the activating control.
 * - Page scrolling is locked while open.
 * - Previous/Next buttons and the arrow keys appear only when there is more
 *   than one image.
 * - "Actual size" switches to a scrollable detail view for dense artifacts,
 *   centred on `focus` when given (e.g. the crop the visitor clicked), with
 *   `highlight` marked on the image there; "Fit to screen" shows it whole.
 * - No caption under the image (brief-v8 section 8); a visual's label (e.g.
 *   Illustrative conversation) sits in the top bar.
 */
export function ImageDialogProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [gallery, setGallery] = useState<ImageId[]>([])
  const [index, setIndex] = useState(0)
  const [detail, setDetail] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [override, setOverride] = useState<{ id: ImageId; label: string } | null>(null)
  /** Where the actual-size view of image `id` opens, and what it marks (with the page accent from the trigger). */
  const [spot, setSpot] = useState<{ id: ImageId; focus?: Region; highlight?: Region; accent: CSSProperties } | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const open = useCallback((id: ImageId, trigger: HTMLElement, options?: OpenOptions) => {
    const list = options?.gallery ?? galleryFrom(trigger)
    triggerRef.current = trigger
    setOverride(options?.label ? { id, label: options.label } : null)
    if (options?.focus || options?.highlight) {
      const css = getComputedStyle(trigger)
      const accent = { '--case-accent': css.getPropertyValue('--case-accent').trim() || undefined, '--case-accent-rgb': css.getPropertyValue('--case-accent-rgb').trim() || undefined } as CSSProperties
      setSpot({ id, focus: options.focus, highlight: options.highlight, accent })
    } else setSpot(null)
    setGallery(list.length ? list : [id])
    setIndex(Math.max(0, list.indexOf(id)))
    setDetail(Boolean(options?.detail))
    setIsOpen(true)
  }, [])

  const count = gallery.length
  const current = isOpen && count ? getImage(gallery[index]) : null
  const place = current && spot && spot.id === current.id ? spot : null

  /** Actual size: scroll the focus region to the middle of the view (the browser keeps it within the image). */
  const centre = useCallback(() => {
    const stage = stageRef.current
    const canvas = canvasRef.current
    const f = place?.focus
    if (!stage || !canvas || !f || stage.dataset.detail !== 'true') return
    // Layout offsets (the stage is the canvas's offset parent), unaffected by the dialog's opening scale.
    stage.scrollLeft = canvas.offsetLeft + ((f.x + f.w / 2) / 100) * canvas.offsetWidth - stage.clientWidth / 2
    stage.scrollTop = canvas.offsetTop + ((f.y + f.h / 2) / 100) * canvas.offsetHeight - stage.clientHeight / 2
  }, [place])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
      document.documentElement.classList.add('is-dialog-open')
      closeRef.current?.focus()
      centre()
    }
  }, [isOpen, centre])

  // Actual size chosen again (after Fit to screen): back to the focus region, before the frame is painted.
  useLayoutEffect(() => {
    if (detail && dialogRef.current?.open) centre()
  }, [detail, centre])

  const close = useCallback(() => {
    closeWithFade(dialogRef.current)
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

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => Math.min(count - 1, Math.max(0, i + delta)))
      setDetail(false)
    },
    [count],
  )

  const api = useMemo(() => ({ open }), [open])
  // A label appears only when the visual carries one, never a caption or provenance fallback.
  const ownLabel = current && override && override.id === current.id ? override.label : null

  return (
    <ImageDialogContext.Provider value={api}>
      {children}
      <dialog
        ref={dialogRef}
        className="image-dialog"
        aria-labelledby={ownLabel ? 'image-dialog-caption' : undefined}
        aria-label={ownLabel ? undefined : 'Enlarged image'}
        onClose={onClose}
        onCancel={closeOnCancel}
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
                {ownLabel && (
                  <span id="image-dialog-caption" className="cs-media-label">
                    {ownLabel}
                  </span>
                )}
                {ownLabel && count > 1 && ' · '}
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
              ref={stageRef}
              className="image-dialog__stage"
              style={{ position: 'relative' }}
              data-detail={detail}
              role={detail ? 'region' : undefined}
              tabIndex={detail ? 0 : undefined}
              aria-label={detail ? 'Scrollable detail view' : undefined}
            >
              {/* Actual size: the image's own box (its highlight is placed in percent of it); fit: no box of its own. */}
              <div ref={canvasRef} style={detail ? { position: 'relative', width: 'max-content', margin: 'auto' } : { display: 'contents' }}>
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
                    // Actual size has its final size before the file arrives, so the view opens on its focus at once.
                    style={detail ? actualSize(current) : undefined}
                  />
                </picture>
                {detail && place?.highlight && (
                  <span
                    className="cs-hl image-dialog__hl"
                    data-on=""
                    data-dim=""
                    aria-hidden="true"
                    style={{
                      ...place.accent,
                      left: `${place.highlight.x}%`,
                      top: `${place.highlight.y}%`,
                      width: `${place.highlight.w}%`,
                      height: `${place.highlight.h}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </ImageDialogContext.Provider>
  )
}
