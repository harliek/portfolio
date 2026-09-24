/*
 * A recording's own picture, for the players (DemoVideo, FilmPlayer) and their larger views.
 *
 * Between play() and its first decoded frame, Chromium paints a playing <video> as a black box (the poster is
 * dropped at play()), so a recording that appears over its poster flashes black. The players keep the element
 * transparent until `onFramePresented` reports a frame on screen, then fade it in over the poster (case.css
 * .cs-demo__video, client-work.css .fp-video): poster to film is a short dissolve, never a black frame.
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

/** What a larger view shows underneath its own copy until that copy has a frame: the inline frame or poster. */
export type Underlay = HTMLVideoElement | HTMLImageElement

/** Draws `source` into `canvas`, contained and centred (the canvas has the recording's size and ratio). */
export function drawUnderlay(canvas: HTMLCanvasElement, source: Underlay | null | undefined) {
  if (!source) return
  const sw = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth
  const sh = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx || !sw || !sh) return
  const scale = Math.min(canvas.width / sw, canvas.height / sh)
  const w = sw * scale
  const h = sh * scale
  try {
    ctx.drawImage(source, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
  } catch {
    // Not drawable (no frame yet): the view simply opens on its dark stage, as before.
  }
}
