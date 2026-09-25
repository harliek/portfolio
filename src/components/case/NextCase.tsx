import { useEffect, useRef, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { FIELD } from '../../content/field'
import { projectById, projectPath, type Project } from '../../content/projects'
import { PlaneMedia } from '../home/PlaneMedia'
import { expandFrame } from '../transition/expandFrame'
import { isPlainClick, warmProject } from '../transition/projectTransition'

/**
 * The end of a case study: the next project as a frame of its own work (the
 * homepage field's media), its title and one line. Clicking expands the
 * frame into that case study, as on the homepage.
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
    const title = e.currentTarget.querySelector<HTMLElement>('.cx-next__title')
    expandFrame({
      media: mediaRef.current,
      title: item.title,
      titleSize: title ? parseFloat(getComputedStyle(title).fontSize) : undefined,
      path,
      navigate,
    })
  }

  return (
    <nav className="cx-next" aria-label="Next project">
      <a className="cx-next__link" href={path} onClick={open} onPointerEnter={() => warmProject(path)} onFocus={() => warmProject(path)}>
        <span className="cx-next__kicker">Next project</span>
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
          <span className="cx-next__title">{item.title}</span>
          <span className="cx-next__line">{item.line}</span>
        </span>
      </a>
    </nav>
  )
}
