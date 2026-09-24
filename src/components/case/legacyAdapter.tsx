import type { ReactNode } from 'react'
import type { ImageId, VideoId } from '../../content/media'
import type { Project } from '../../content/projects'
import type { CaseScrollProps, Rect, StorySection, Visual } from './CaseScroll'

/*
 * TEMPORARY (Task CASE): lets the case pages that have not moved to the
 * brief-v5 CaseScroll API yet (Spreadsheet Agent, AI Leasing Agent, Jumpstart
 * Finance) render with it from their old content objects, so their routes
 * keep working until their page tasks rewrite them. It flattens each old
 * section's blocks into one body, takes the first image a section brings as
 * its visual, and turns the old results into the outcome. Delete this file
 * once no page imports it.
 */

interface LegacyVisual {
  kind: string
  image?: ImageId
  caption?: ReactNode
  highlight?: Rect
  enlarge?: ImageId | false
  alt?: string
}

interface LegacySection {
  id: string
  title: string
  blocks: Array<{ id: string; body: ReactNode; visual?: LegacyVisual }>
}

interface LegacyContent {
  situation: ReactNode
  opening: LegacyVisual
  sections: LegacySection[]
  results: ReactNode
}

const toVisual = (v: LegacyVisual | undefined): Visual | undefined =>
  v && v.kind === 'image' && v.image ? { image: v.image, caption: v.caption, highlight: v.highlight, expandTo: v.enlarge || undefined, alt: v.alt } : undefined

export function legacyCaseProps(
  project: Project,
  content: unknown,
  media: { kind: 'video'; video: VideoId } | { kind: 'states'; frameRatio: string },
): Omit<CaseScrollProps, 'project'> {
  const c = content as LegacyContent
  const sections: StorySection[] = c.sections.map((s) => ({
    id: s.id,
    title: s.title,
    body: (
      <>
        {s.blocks.map((b) => (
          <div key={b.id} className="case-prose">
            {b.body}
          </div>
        ))}
      </>
    ),
    visual: toVisual(s.blocks.find((b) => toVisual(b.visual))?.visual),
  }))
  const opening = toVisual(c.opening)
  return {
    meta: [`${project.meta.company} · ${project.meta.dates}`, project.meta.role],
    summary: c.situation,
    media: media.kind === 'video' || !opening ? { kind: 'video', video: media.kind === 'video' ? media.video : 'merch-console' } : { kind: 'states', frameRatio: media.frameRatio, opening },
    sections,
    outcome: { id: 'outcome', title: 'Results', body: c.results },
  }
}
