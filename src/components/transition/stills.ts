/**
 * Stills of the page's videos for the page change (pageChange.ts), in WebKit only. When WebKit pictures the page
 * being left, it can leave a <video> out of the picture for the first frames of the change: the homepage's film
 * showed its poster (another shot) and the tiles showed their dark ground, a flash of the wrong page right after a
 * tile click. So just before the page is pictured, each video in view is covered by a canvas holding its current
 * frame (drawn as the video shows it: covering its box, from its object-position), and the canvases go when the
 * change ends. Chrome pictures videos correctly and gets none.
 */

/** WebKit (Safari, and every browser on iOS), for its picturing quirks here and in pageChange.ts. */
export const isWebKit = () => /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg\//.test(navigator.userAgent)

/** A share (0 to 1) from a CSS position keyword or percentage; the middle otherwise. */
function share(value: string | undefined) {
  if (!value || value === 'center') return 0.5
  if (value === 'left' || value === 'top') return 0
  if (value === 'right' || value === 'bottom') return 1
  const percent = /^(-?[\d.]+)%$/.exec(value)
  return percent ? Number(percent[1]) / 100 : 0.5
}

/** Covers each video in view with a still of its frame; returns the canvases, to remove later. */
export function coverVideos(): HTMLCanvasElement[] {
  if (!isWebKit()) return []
  const stills: HTMLCanvasElement[] = []
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  for (const video of document.querySelectorAll<HTMLVideoElement>('video')) {
    const rect = video.getBoundingClientRect()
    const inView = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth
    if (!inView || !rect.width || !rect.height || video.readyState < 2 || !video.videoWidth || !video.parentElement) continue
    const style = getComputedStyle(video)
    if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') continue
    const canvas = document.createElement('canvas')
    const w = video.offsetWidth
    const h = video.offsetHeight
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    const context = canvas.getContext('2d')
    if (!context) continue
    // Covering the box (object-fit: cover), placed by object-position; a contained video is drawn whole and centred.
    const contain = style.objectFit === 'contain'
    const scale = (contain ? Math.min : Math.max)(canvas.width / video.videoWidth, canvas.height / video.videoHeight)
    const dw = video.videoWidth * scale
    const dh = video.videoHeight * scale
    const [px, py] = style.objectPosition.split(/\s+/)
    try {
      context.drawImage(video, (canvas.width - dw) * share(px), (canvas.height - dh) * share(py), dw, dh)
    } catch {
      continue
    }
    canvas.setAttribute('aria-hidden', 'true')
    canvas.className = 'pt-still'
    // Over the video, in the same place: its sibling, so both are placed from the same positioned ancestor.
    Object.assign(canvas.style, {
      position: 'absolute',
      left: `${video.offsetLeft}px`,
      top: `${video.offsetTop}px`,
      width: `${w}px`,
      height: `${h}px`,
      borderRadius: style.borderRadius,
      pointerEvents: 'none',
      zIndex: style.zIndex === 'auto' ? '' : style.zIndex,
    })
    video.after(canvas)
    stills.push(canvas)
  }
  return stills
}
