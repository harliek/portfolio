import { useRef, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ACCENTS } from '../../content/accents'
import { projectById, projectPath, type ProjectId } from '../../content/projects'
import { ResponsiveImage } from '../media/ResponsiveImage'
import { isPlainClick, openProject, warmProject } from '../transition/projectTransition'

/** Thumbnail box (CSS px): the object is contained in it, so a monitor is about 104px across and a phone about 84px tall. */
const THUMB = { width: 104, height: 84 }

/**
 * The one next-project link after the story (brief-v5 section 30): a small
 * version of the next project's PNG object beside the live text "Next
 * project" and the project's name, all one link. The next projects follow
 * the homepage order (projects.ts `next`; About is not part of it).
 *
 * Hover and focus: the thumbnail grows 4% with a restrained alpha-aware glow
 * and the name takes the NEXT project's accent (case.css). A plain click or
 * Enter opens it through openProject with the thumbnail as the source
 * (`data-cover-source`), so the same PNG can move into the destination's
 * cover slot; modifier and middle clicks stay native.
 */
export function NextProject({ current }: { current: ProjectId }) {
  const navigate = useNavigate()
  const thumbRef = useRef<HTMLSpanElement>(null)
  const next = projectById(projectById(current).next)
  const path = projectPath(next)
  const accent = ACCENTS[next.accent]
  const split = next.name.lastIndexOf(' ') + 1
  const head = next.name.slice(0, split)
  const tail = next.name.slice(split)
  const style = { '--next-accent': accent.hex, '--next-accent-rgb': accent.rgb, '--thumb-w': `${THUMB.width}px`, '--thumb-h': `${THUMB.height}px` } as CSSProperties
  return (
    <nav className="next-project" aria-label="Next project">
      <Link
        to={path}
        className="next-project__link"
        style={style}
        onClick={(e) => {
          if (!isPlainClick(e)) return
          e.preventDefault()
          openProject({ path, source: thumbRef.current, navigate })
        }}
        onPointerEnter={() => warmProject(path)}
        onFocus={() => warmProject(path)}
      >
        <span ref={thumbRef} className="next-project__thumb" data-cover-source={next.accent}>
          <ResponsiveImage image={next.cover} sizes={`${THUMB.width}px`} fit="contain" decorative />
        </span>
        <span className="next-project__text">
          <span className="next-project__label">Next project</span>{' '}
          <span className="next-project__name">
            {head}
            {/* The last word and the arrow never separate when the name wraps. */}
            <span className="next-project__tail">
              {tail}
              <svg className="next-project__arrow" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </span>
      </Link>
    </nav>
  )
}
