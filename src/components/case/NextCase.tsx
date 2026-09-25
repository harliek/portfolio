import { useEffect, useRef, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FIELD } from '../../content/field'
import { projectById, projectPath, type Project } from '../../content/projects'
import { PlaneMedia } from '../home/PlaneMedia'
import { expandFrame } from '../transition/expandFrame'
import { isPlainClick, warmProject } from '../transition/projectTransition'

/**
 * The end of a case study (brief v18): a compact link, a small thumbnail
 * of the next project's cover, "Next project" and its title. Clicking
 * carries the thumbnail into that case study's hero, as on the homepage.
 */
export function NextCase({ current }: { current: Project }) {
  const navigate = useNavigate()
  const next = projectById(current.next)
  const item = FIELD.find((f) => f.id === next.id)
  const mediaRef = useRef<HTMLSpanElement>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const path = projectPath(next)

  // Footage loads and plays only while the frame is on screen.
  useEffect(() => {
    const frame = mediaRef.current
    if (!frame) return
    const io = new IntersectionObserver(([e]) => {
      const video = videoRef.current
      if (!video) return
      if (e.isIntersecting) {
        if (!video.getAttribute('src') && video.dataset.src) video.setAttribute('src', video.dataset.src)
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) void video.play().catch(() => {})
      } else video.pause()
    })
    io.observe(frame)
    return () => io.disconnect()
  }, [])

  if (!item) return null
  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return
    e.preventDefault()
    const link = e.currentTarget
    expandFrame({
      media: mediaRef.current,
      path,
      navigate,
      // The next project's own title and line fade first; only the frame travels.
      onStart: () => link.setAttribute('data-leaving', ''),
    })
  }

  return (
    <nav className="cx-next" aria-label="Next project">
      <a className="cx-next__link" href={path} onClick={open} onPointerEnter={() => warmProject(path)} onFocus={() => warmProject(path)}>
        <span className="cx-next__frame">
          <span ref={mediaRef} className="plane__media" data-kind={item.media.kind}>
            <PlaneMedia
              item={item}
              videoRef={(el) => {
                videoRef.current = el
              }}
            />
          </span>
        </span>
        <span className="cx-next__text">
          <span className="cx-next__kicker">Next project</span>
          <span className="cx-next__title">
            {item.title} <span className="cx-next__arrow" aria-hidden="true">→</span>
          </span>
        </span>
      </a>
    </nav>
  )
}
