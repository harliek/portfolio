import { useState, type MouseEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { ContactBlock } from '../components/work/ContactBlock'
import { WorkCarousel, readWorkSelection, rememberWorkSelection } from '../components/work/WorkCarousel'
import { WorkIndex } from '../components/work/WorkIndex'
import { PROJECTS, projectBySlug, type ProjectId } from '../content/projects'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/** Case studies link back with state { selectProject }; accept only known ids. */
function selectedFromState(state: unknown): ProjectId | undefined {
  if (!state || typeof state !== 'object' || !('selectProject' in state)) return undefined
  const id = (state as { selectProject?: unknown }).selectProject
  return PROJECTS.find((p) => p.id === id)?.id
}

/**
 * Opening a project from the homepage remembers it for Back navigation. Bubble
 * phase on purpose: clicks the carousel swallows (the end of a drag, a second
 * click while a project is opening) never get here, and modified clicks or
 * new-tab links open elsewhere, so they must not change the selection.
 */
function rememberOpenedProject(e: MouseEvent<HTMLElement>) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  if (!(e.target instanceof Element)) return
  const link = e.target.closest<HTMLAnchorElement>('a[href^="/work/"]')
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return
  const project = projectBySlug(link.pathname.split('/')[2])
  if (project) rememberWorkSelection(project.id)
}

export function Home() {
  usePageMeta(undefined, SITE.description)
  const { state } = useLocation()
  // Back/Forward restores the selection remembered on this history entry;
  // otherwise an "All work" link's selectProject; otherwise the first project.
  const [initialProjectId] = useState(() => readWorkSelection() ?? selectedFromState(state))

  return (
    <div className="home" onClick={rememberOpenedProject}>
      <div className="shell home-intro" data-transition-fade>
        <h1 className="home-intro__name t-display" tabIndex={-1}>
          {SITE.name}
        </h1>
        <p className="home-intro__descriptor t-sub">{SITE.descriptor}</p>
      </div>

      {/* Header "Work" link scrolls to and focuses this region. */}
      <section id="work" className="home-work" tabIndex={-1} aria-labelledby="work-heading">
        <WorkCarousel headingId="work-heading" initialProjectId={initialProjectId} />
      </section>

      <div className="shell home-index" data-transition-fade>
        <WorkIndex />
      </div>

      <div className="shell home-contact" data-transition-fade>
        <ContactBlock />
      </div>
    </div>
  )
}
