import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { getImage, largestSrc, type ImageId } from '../../content/media'
import { closeOnCancel, closeWithFade } from './dialogExit'
import { CloseIcon } from './ExpandIcon'

export interface OpenOptions {
  /** The images to page through (pass `[id]` for a single image). */
  gallery: ImageId[]
}

interface DialogApi {
  open: (id: ImageId, trigger: HTMLElement, options: OpenOptions) => void
}

const ImageDialogContext = createContext<DialogApi | null>(null)

export function useImageDialog(): DialogApi {
  const ctx = useContext(ImageDialogContext)
  if (!ctx) throw new Error('useImageDialog must be used inside <ImageDialogProvider>')
  return ctx
}

/**
 * One shared native <dialog> for image enlargement.
 * - A visible, labelled Close button (focused on open); Escape and a click on
 *   the backdrop also close (native cancel event). It fades in and, on every
 *   one of these, fades out again (dialogExit.ts) before focus returns.
 * - showModal() contains focus; focus returns to the activating control.
 * - Page scrolling is locked while open.
 * - Previous/Next buttons and the arrow keys appear only when there is more
 *   than one image. On phones they are 44px arrows (their names kept for
 *   screen readers), so the bar stays one row with Close (components.css).
 * - The image is always shown whole, fitted to the screen (no "Actual size" view: Harlie's request, 2026-09-27).
 *   On a phone a wide screenshot opens at the view's full height instead and pans sideways: fitted to the width it
 *   was hardly larger than on the page (Harlie's brief, 2026-09-28).
 * - No caption and no status label (Harlie's request, 2026-09-28: "there should be no captions for any photos"); only
 *   the count when there are several pictures.
 */
export function ImageDialogProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [gallery, setGallery] = useState<ImageId[]>([])
  const [index, setIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback((id: ImageId, trigger: HTMLElement, { gallery: list }: OpenOptions) => {
    triggerRef.current = trigger
    setGallery(list.length ? list : [id])
    setIndex(Math.max(0, list.indexOf(id)))
    setIsOpen(true)
  }, [])

  const count = gallery.length
  const current = isOpen && count ? getImage(gallery[index]) : null

  // Browser Back or Forward with an image enlarged: the image goes with the page it belongs to (it stayed open over the
  // next page, still scroll-locked; bug fix approved by Harlie, 2026-09-29). The provider sits outside the keyed route,
  // so nothing else closes it. At once, without the fade: the page has already changed. onClose then lifts the scroll
  // lock and skips refocusing the gone trigger; RouteFocus (or the homepage's remembered tile) places focus. Declared
  // before the opening effect and keyed to the pathname only, so it never closes a dialog opening in the same commit.
  const { pathname } = useLocation()
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog?.open) dialog.close()
  }, [pathname])

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
    },
    [count],
  )

  const api = useMemo(() => ({ open }), [open])

  return (
    <ImageDialogContext.Provider value={api}>
      {children}
      <dialog
        ref={dialogRef}
        className="image-dialog"
        aria-label="Enlarged image"
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
              <p className="image-dialog__count t-small tabular">
                <span aria-live="polite">{count > 1 ? `${index + 1} / ${count}` : ''}</span>
              </p>
              <div className="image-dialog__controls">
                {count > 1 && (
                  <>
                    <button type="button" className="button button--secondary button--small image-dialog__step" onClick={() => go(-1)} disabled={index === 0}>
                      <span aria-hidden="true">←</span>
                      <span className="image-dialog__step-name">Previous image</span>
                    </button>
                    <button type="button" className="button button--secondary button--small image-dialog__step" onClick={() => go(1)} disabled={index >= count - 1}>
                      <span className="image-dialog__step-name">Next image</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </>
                )}
                <button ref={closeRef} type="button" className="button button--secondary button--small" onClick={close}>
                  <CloseIcon />
                  Close
                </button>
              </div>
            </div>
            <div className="image-dialog__stage" tabIndex={0} role="region" aria-label="Enlarged image" data-wide={current.width > current.height * 1.2 || undefined}>
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
          </div>
        )}
      </dialog>
    </ImageDialogContext.Provider>
  )
}
