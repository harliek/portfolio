import { useLocation } from 'react-router-dom'
import { ContactBlock } from '../components/work/ContactBlock'
import { WorkCarousel } from '../components/work/WorkCarousel'
import { WorkIndex } from '../components/work/WorkIndex'
import { PROJECTS, type ProjectId } from '../content/projects'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/** Case studies link back with state { selectProject }; accept only known ids. */
function selectedFromState(state: unknown): ProjectId | undefined {
  if (!state || typeof state !== 'object' || !('selectProject' in state)) return undefined
  const id = (state as { selectProject?: unknown }).selectProject
  return PROJECTS.find((p) => p.id === id)?.id
}

export function Home() {
  usePageMeta(undefined, SITE.description)
  const { state } = useLocation()
  const initialProjectId = selectedFromState(state)

  return (
    <div className="home">
      <div className="shell home-intro">
        <h1 className="home-intro__name t-display" tabIndex={-1}>
          {SITE.name}
        </h1>
        <p className="home-intro__descriptor t-sub">{SITE.descriptor}</p>
      </div>

      {/* Header "Work" link scrolls to and focuses this region. */}
      <section id="work" className="home-work" tabIndex={-1} aria-labelledby="work-heading">
        <WorkCarousel headingId="work-heading" initialProjectId={initialProjectId} />
      </section>

      <div className="shell home-index">
        <WorkIndex />
      </div>

      <div className="shell home-contact">
        <ContactBlock />
      </div>
    </div>
  )
}
