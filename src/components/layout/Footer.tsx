import { useEffect, useRef } from 'react'
import { SITE } from '../../content/site'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * The end of every page (brief v16): not a footer but the film again, at a
 * different moment (the figure standing in the dark, red gloves; 10.8s to
 * 16.4s of the opening film), with HARLIE KATZ set like the opening's
 * PORTFOLIO and one restrained way to get in touch. The beginning and the
 * end share one visual language, so the site closes the circle.
 *
 * The excerpt is muted, loops, has no controls, loads only as the end
 * approaches and plays only while it is on screen; reduced motion shows its
 * still. No résumé link, no phone number.
 */
export function Footer() {
  const reduced = useReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)
  const year = new Date().getFullYear()

  useEffect(() => {
    const video = videoRef.current
    if (!video || reduced) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!video.getAttribute('src')) video.setAttribute('src', '/media/video/end-film-1280.mp4')
          void video.play().catch(() => {})
        } else video.pause()
      },
      { rootMargin: '25% 0px' },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [reduced])

  return (
    <footer className="site-end" aria-labelledby="site-end-name">
      <div className="site-end__film" aria-hidden="true">
        <video
          ref={videoRef}
          className="site-end__video"
          poster="/media/img/end-film-poster.jpg"
          width={1280}
          height={720}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
        />
        <div className="site-end__shade" />
      </div>
      <div className="site-end__content">
        <p className="site-end__name" id="site-end-name">
          {SITE.name}
        </p>
        <div className="site-end__contact">
          <a className="site-end__action" href={SITE.emailHref}>
            Get in touch
          </a>
          <a className="site-end__link" href={SITE.emailHref}>
            {SITE.email}
          </a>
          <a className="site-end__link" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
        <p className="site-end__copy tabular">
          © {year} {SITE.name}
        </p>
      </div>
    </footer>
  )
}
