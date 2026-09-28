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
