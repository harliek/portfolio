/**
 * Where a player's Expand control uses the browser's own full screen instead
 * of the larger-view dialog: on a phone or a touch screen the dialog would be
 * no larger than the inline player, while full screen can turn to landscape.
 */
export const NATIVE_FULLSCREEN = '(max-width: 599.98px), (pointer: coarse)'

/**
 * Puts the video element itself in full screen (on iPhone Safari, its native
 * player). Returns false when neither is available, so the caller can open
 * its dialog instead. Call it from the visitor's gesture.
 */
export function enterFullscreen(v: HTMLVideoElement & { webkitEnterFullscreen?: () => void }): boolean {
  try {
    if (document.fullscreenEnabled && typeof v.requestFullscreen === 'function') {
      v.requestFullscreen().catch(() => {})
      return true
    }
    if (typeof v.webkitEnterFullscreen === 'function') {
      v.webkitEnterFullscreen()
      return true
    }
  } catch {
    // Not allowed right now (e.g. no metadata yet on iPhone).
  }
  return false
}

/**
 * After a player's own full screen ends: focus goes back to its Expand control
 * when nothing else holds it (leaving full screen can drop focus to the page),
 * without scrolling.
 */
export function returnFocus(control: HTMLElement | null) {
  if (control && (!document.activeElement || document.activeElement === document.body)) control.focus({ preventScroll: true })
}
