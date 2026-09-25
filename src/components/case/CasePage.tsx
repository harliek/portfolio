import '../../styles/case-v16.css'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { accentVars } from '../../content/accents'
import type { Project } from '../../content/projects'
import { usePageMeta } from '../../hooks/usePageMeta'
import { NextCase } from './NextCase'

/**
 * A case study (brief v16): consistency comes from the page margins, the
 * spacing scale, the type, the metadata treatment and the motion language
 * (src/styles/case-v16.css), never from one repeated layout. Each page
 * composes its own sequence from the pieces there (a hero, statements,
 * large visuals, a scroll-scrubbed demo, pinned sequences) and ends with
 * the next project, opened with the same expanding frame as the homepage.
 */
export function CasePage({ project, className, children }: { project: Project; className?: string; children: ReactNode }) {
  usePageMeta(project.seo.title, project.seo.description)
  const ref = useRef<HTMLElement>(null)

  // Elements marked data-reveal rise into place once, as they enter the view.
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.setAttribute('data-in', '')
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <article ref={ref} className={['cx', className].filter(Boolean).join(' ')} data-project={project.id} style={accentVars(project.accent) as CSSProperties}>
      {children}
      <NextCase current={project} />
    </article>
  )
}

/** The case title with its metadata (a short list of plain facts, set small). */
export function CaseTitle({ title, meta }: { title: string; meta: readonly string[] }) {
  return (
    <>
      <h1 className="cx-title" tabIndex={-1}>
        {title}
      </h1>
      <ul className="cx-meta" aria-label="Project details">
        {meta.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </>
  )
}
