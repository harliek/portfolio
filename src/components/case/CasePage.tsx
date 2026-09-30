import '../../styles/case-v16.css'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import type { Project } from '../../content/projects'
import { DockTitle } from '../ui/DockTitle'
import { usePageMeta } from '../../hooks/usePageMeta'
import { StageOnLeftContext, stageOnLeft } from './caseSide'

/**
 * A case study (brief v16): consistency comes from the page margins, the spacing scale, the type, the metadata
 * treatment and the motion language (src/styles/case-v16.css), never from one repeated layout. The told cases compose
 * their introduction, steps and held stage with CaseStory; Creative Production composes its films itself
 * (ClientWork.tsx); the footer carries the Previous and Next project buttons.
 *
 * Every other told case puts its stage on the left and its words on the right, by the project's order (caseSide.ts;
 * Harlie's request, 2026-09-30): the page passes that on to CaseStory.
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
    <article ref={ref} className={['cx', className].filter(Boolean).join(' ')} data-project={project.id}>
      <StageOnLeftContext value={stageOnLeft(project.order)}>{children}</StageOnLeftContext>
    </article>
  )
}

/**
 * The case title with its metadata (a short list of plain facts, set small). Its letters magnify under the pointer
 * (DockTitle).
 *
 * The title stays in its own column (Harlie's brief, 2026-09-28: content never escapes its grid or runs under the held
 * picture): where its longest word is wider than the column (Merchandising beside the picture at some widths), its
 * size is brought down just enough to fit (--title-fit, case-v16.css); every other title keeps the type scale's size.
 *
 * The fit is measured once per column width, with the title's transitions held (data-fitting, case-v16.css), and only
 * a change of the column's width measures again (Harlie's brief, 2026-09-28, item 13: no inconsistent settled states).
 * Measuring by the title's own size made a loop under reduced motion: the global 1ms transition left the old size in
 * place while the fit was taken away, so the title seemed to fit, grew, set its own observer off and shrank again,
 * every frame (the Merchandising title flickered between two sizes and moved the page, and WebKit could stop on the
 * unfitted size, past its column).
 */
export function CaseTitle({ title, meta }: { title: string; meta: readonly string[] }) {
  const metaRef = useRef<HTMLUListElement>(null)
  useLayoutEffect(() => {
    // The title is the details' heading, just before them (DockTitle keeps its own ref).
    const heading = metaRef.current?.previousElementSibling
    if (!(heading instanceof HTMLElement)) return
    let width = -1
    const fit = () => {
      heading.dataset.fitting = ''
      const was = heading.style.getPropertyValue('--title-fit')
      heading.style.removeProperty('--title-fit')
      const room = heading.clientWidth
      const need = heading.scrollWidth
      const next = room > 0 && need > room + 0.5 ? ((room / need) * 0.995).toFixed(4) : ''
      if (next) heading.style.setProperty('--title-fit', next)
      // The final size is laid out while transitions are still held, so letting them go starts none.
      if (next !== was) void heading.offsetWidth
      delete heading.dataset.fitting
      width = heading.clientWidth
    }
    fit()
    // Only the column's width can change the fit; the title's own height changes as it is fitted.
    const ro = new ResizeObserver(() => {
      if (heading.clientWidth !== width) fit()
    })
    ro.observe(heading)
    let live = true
    void document.fonts?.ready.then(() => live && fit())
    return () => {
      live = false
      ro.disconnect()
    }
  }, [title])

  // A details line breaks only between its " · " parts, and a "·" left at a line's end is hidden (kept in place, so
  // nothing reflows): on a phone "Student venture · 2024 · Reconstructed screen" ended its first line on a stray dot
  // (2026-09-29). Measured again only when the details' width changes. A part wider than the column wraps within
  // itself (case-v16.css, 2026-09-30), so the next part is on a new line only when it starts below the part's last line.
  useLayoutEffect(() => {
    const list = metaRef.current
    if (!list) return
    let width = -1
    const mark = () => {
      width = list.clientWidth
      for (const li of list.children) {
        const parts = [...li.querySelectorAll<HTMLElement>('.cx-meta__part')]
        parts.forEach((part, i) => {
          const next = parts[i + 1]
          if (next && next.offsetTop >= part.offsetTop + part.offsetHeight - 1) part.dataset.lineEnd = ''
          else delete part.dataset.lineEnd
        })
      }
    }
    mark()
    const ro = new ResizeObserver(() => {
      if (list.clientWidth !== width) mark()
    })
    ro.observe(list)
    let live = true
    void document.fonts?.ready.then(() => live && mark())
    return () => {
      live = false
      ro.disconnect()
    }
  }, [meta])

  return (
    <>
      <DockTitle className="cx-title" tabIndex={-1} text={title} />
      <ul ref={metaRef} className="cx-meta" aria-label="Project details">
        {meta.map((m) => {
          const parts = m.split(' · ')
          return (
            <li key={m}>
              {parts.map((part, i) => (
                <span key={i}>
                  <span className="cx-meta__part">
                    {part}
                    {i < parts.length - 1 && <span className="cx-meta__sep"> ·</span>}
                  </span>
                  {i < parts.length - 1 && ' '}
                </span>
              ))}
            </li>
          )
        })}
      </ul>
    </>
  )
}
