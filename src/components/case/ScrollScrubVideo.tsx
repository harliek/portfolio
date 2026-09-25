import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { fallbackSrc, getImage, srcSet, type ImageId } from '../../content/media'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { ScrollTrigger } from '../../lib/gsap'

export interface ScrubMoment {
  /** Video seconds where the annotation appears and leaves. */
  start: number
  end: number
  /** A few words, set in small capitals beside the recording. */
  label: string
  /** At most one short sentence. */
  note?: string
  /** A still of this moment for phones and reduced motion. */
  still: ImageId
}

interface ScrollScrubVideoProps {
  /** A seek-friendly encode (see the note below). */
  src: string
  poster: string
  width: number
  height: number
  /** Length of the recording (s). */
  duration: number
  moments: readonly ScrubMoment[]
  /** Accessible description of the recording. */
  label: string
  /** Scroll distance per second of video (svh); the pinned section is duration × this. */
  svhPerSecond?: number
  className?: string
}

/**
 * A product demo the visitor plays with the scroll (brief v16, section 9).
 * The section pins while the recording's time follows scroll progress:
 * scroll slowly and it advances slowly, faster and it moves faster, back and
 * it runs backwards. Short annotations appear beside the picture at the
 * moments they describe; nothing covers the interface, and there are no
 * controls.
 *
 * Mechanics: ScrollTrigger maps progress 0..1 to a target time; one rAF
 * loop eases the video's currentTime toward it and never issues a new seek
 * while one is pending (`video.seeking`), so there is no seek queue, no
 * jitter and no forced layout per frame. The video stays paused, muted and
 * inline. Its file is requested only as the section approaches (metadata
 * first, then the whole file).
 *
 * ENCODING: seeking is smooth only when keyframes are close together. The
 * site's playback encodes have a keyframe every 6 to 8 seconds, which makes
 * every seek decode seconds of video (visible stutter, worst in Safari).
 * Scrub encodes use a keyframe every half second and no B-frames, e.g.
 *   ffmpeg -i source.mov -an -vf "fps=24,scale=1280:-2" -c:v libx264 -crf 28
 *     -tune stillimage -g 12 -keyint_min 12 -sc_threshold 0 -bf 0
 *     -movflags +faststart name-scrub-1280.mp4
 * (-g 6 halves the seek cost again at about twice the size.) For a short,
 * critical sequence an image sequence drawn to a canvas is smoother still,
 * at a much larger payload.
 *
 * Phones and reduced motion get the same moments as a quiet sequence of
 * stills with their annotations (no pinning, no scrubbing).
 */
export function ScrollScrubVideo({ src, poster, width, height, duration, moments, label, svhPerSecond = 7, className }: ScrollScrubVideoProps) {
  const reduced = useReducedMotion()
  const phone = useMediaQuery('(max-width: 699.98px)')
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [moment, setMoment] = useState(-1)
  const [near, setNear] = useState(false)
  const scrub = !reduced && !phone

  // Request the file only as the section approaches.
  useEffect(() => {
    const section = sectionRef.current
    if (!section || !scrub) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '120% 0px' })
    io.observe(section)
    return () => io.disconnect()
  }, [scrub])

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video || !scrub) return
    let target = 0
    let running = false
    let frame = 0
    let lastMoment = -2
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top+=61',
      end: 'bottom bottom',
      onUpdate: (self) => {
        target = self.progress * duration
      },
      onToggle: (self) => {
        running = self.isActive
        if (running) loop()
      },
      onRefresh: (self) => {
        target = self.progress * duration
      },
    })
    const loop = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(function tick() {
        if (video.readyState >= 1 && !video.seeking) {
          const diff = target - video.currentTime
          // Ease toward the scroll's time; small remainders snap (no endless tiny seeks).
          if (Math.abs(diff) > 1 / 48) video.currentTime = video.currentTime + diff * (Math.abs(diff) > 2 ? 0.5 : 0.3)
          else if (Math.abs(diff) > 0.004) video.currentTime = target
        }
        const t = video.currentTime
        const m = moments.findIndex((x) => t >= x.start && t < x.end)
        if (m !== lastMoment) {
          lastMoment = m
          setMoment(m)
        }
        if (running || Math.abs(target - video.currentTime) > 0.004) frame = requestAnimationFrame(tick)
      })
    }
    const onLoaded = () => ScrollTrigger.refresh()
    video.addEventListener('loadedmetadata', onLoaded)
    return () => {
      cancelAnimationFrame(frame)
      trigger.kill()
      video.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [scrub, duration, moments])

  if (!scrub) {
    return (
      <section className={['scrub scrub--stills', className].filter(Boolean).join(' ')} aria-label={label}>
        {moments.map((m) => {
          const img = getImage(m.still)
          return (
            <figure key={m.label} className="scrub__still">
              <picture>
                <source type="image/avif" srcSet={srcSet(img, 'avif')} sizes="(min-width: 700px) 80vw, 100vw" />
                <source type="image/webp" srcSet={srcSet(img, 'webp')} sizes="(min-width: 700px) 80vw, 100vw" />
                <img src={fallbackSrc(img, 1200)} srcSet={srcSet(img, 'jpg')} sizes="(min-width: 700px) 80vw, 100vw" alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" />
              </picture>
              <figcaption>
                <span className="scrub__label">{m.label}</span>
                {m.note && <span className="scrub__note">{m.note}</span>}
              </figcaption>
            </figure>
          )
        })}
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      className={['scrub', className].filter(Boolean).join(' ')}
      aria-label={label}
      style={{ '--scrub-length': `${Math.round(duration * svhPerSecond)}svh`, '--scrub-aspect': `${width} / ${height}` } as CSSProperties}
    >
      <div className="scrub__pin">
        <div className="scrub__frame">
          <video
            ref={videoRef}
            className="scrub__video"
            src={near ? src : undefined}
            poster={poster}
            width={width}
            height={height}
            muted
            playsInline
            preload={near ? 'auto' : 'none'}
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
        <ol className="scrub__moments">
          {moments.map((m, i) => (
            <li key={m.label} className="scrub__moment" data-active={i === moment || undefined}>
              <span className="scrub__index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="scrub__label">{m.label}</span>
              {m.note && <span className="scrub__note">{m.note}</span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
