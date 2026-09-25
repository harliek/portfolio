import { useEffect, useRef } from 'react'
import { SITE } from '../../content/site'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * The end of every page: a deliberate closing section (brief v17). A thin
 * divider and generous space, a serif invitation, a prominent Email Harlie
 * link with the address beside it as selectable text, LinkedIn and the
 * résumé (no phone number in it). Behind it, the opening film at another
 * moment (the figure standing in the dark; 10.8s to 16.4s), so the site
 * still ends where it began (brief v16).
 *
 * The excerpt is muted, loops, has no controls, loads only as the end
 * approaches and plays only while it is on screen; reduced motion shows its
 * still.
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
        <p className="site-end__name">{SITE.name}</p>
        <p className="site-end__invite" id="site-end-name">
          Let’s make complicated work easier.
        </p>
        <div className="site-end__links">
          <a className="site-end__action" href={SITE.emailHref}>
            Email Harlie <span aria-hidden="true">↗</span>
          </a>
          <p className="site-end__email">{SITE.email}</p>
          <a className="site-end__link" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn <span aria-hidden="true">↗</span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <a className="site-end__link" href={SITE.resume} target="_blank" rel="noopener noreferrer">
            Résumé <span className="site-end__small">PDF</span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>
        <p className="site-end__copy tabular">
          © {year} {SITE.name}
        </p>
      </div>
    </footer>
  )
}
