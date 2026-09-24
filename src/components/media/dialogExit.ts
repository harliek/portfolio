import type { SyntheticEvent } from 'react'
import { prefersReducedMotion } from '../../hooks/useReducedMotion'

/** The larger views' exit (ms): their content and scrim fade out together (case.css .image-dialog[data-closing]). */
const EXIT_MS = 120

/**
 * Closes a larger view (image, recording or film) the way it opened: a short fade, then the native close, whose
 * 'close' event returns focus and restores the page as before. At once under reduced motion. Close, the
 * backdrop and Escape (closeOnCancel) all come here.
 */
export function closeWithFade(dialog: HTMLDialogElement | null) {
  if (!dialog?.open || dialog.dataset.closing !== undefined) return
  if (prefersReducedMotion()) {
    dialog.close()
    return
  }
  dialog.dataset.closing = ''
  const timer = window.setTimeout(() => dialog.close(), EXIT_MS)
  // However it closes (this timer, or the browser at once, e.g. a second Escape), the fade ends with it.
  dialog.addEventListener(
    'close',
    () => {
      window.clearTimeout(timer)
      delete dialog.dataset.closing
    },
    { once: true },
  )
}

/** The dialog's cancel event (Escape): the same fade. A cancel the browser does not let the page hold closes at once. */
export function closeOnCancel(e: SyntheticEvent<HTMLDialogElement>) {
  if (!e.cancelable) return
  e.preventDefault()
  closeWithFade(e.currentTarget)
}
