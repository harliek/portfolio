/*
 * A recording's own picture, for the film viewer (FilmDialog).
 *
 * Between play() and its first decoded frame, Chromium paints a playing <video> as a black box (the poster is
 * dropped at play()), so a recording that appears over its poster flashes black. The players keep the element
 * transparent until `onFramePresented` reports a frame on screen, then fade it in over the poster (case.css
 * .cs-video-dialog__video): poster to film is a short dissolve, never a black frame.
 */

/**
 * Calls `onFrame` once, when the video next puts a frame on screen (after a play() or a seek; a paused video
 * that has neither played nor sought shows its poster and never reports one). Returns a cleanup.
 */
export function onFramePresented(video: HTMLVideoElement, onFrame: () => void): () => void {
  let done = false
  // (Checked at run time: older browsers lack it.)
  if (typeof video.requestVideoFrameCallback === 'function') {
    const handle = video.requestVideoFrameCallback(() => {
      done = true
      onFrame()
    })
    return () => {
      if (!done) video.cancelVideoFrameCallback(handle)
    }
  }
  // Without requestVideoFrameCallback: the first frame is on screen by the frame after 'playing' or 'seeked'.
  let raf = 0
  const fire = () => {
    if (done) return
    done = true
    stop()
    raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(onFrame)
    })
  }
  const stop = () => {
    video.removeEventListener('playing', fire)
    video.removeEventListener('seeked', fire)
  }
  video.addEventListener('playing', fire)
  video.addEventListener('seeked', fire)
  return () => {
    stop()
    cancelAnimationFrame(raf)
  }
}

