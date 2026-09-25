import '../../styles/pages/jumpstart-finance.css'
import { useLayoutEffect, useRef } from 'react'
import { CasePage, CaseTitle } from '../../components/case/CasePage'
import { ResponsiveImage } from '../../components/media/ResponsiveImage'
import { JUMPSTART as C } from '../../content/pages/jumpstart-finance'
import { projectById } from '../../content/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { gsap } from '../../lib/gsap'

const project = projectById('jumpstart-finance')

/** A phone's place: x in phone widths from the centre, scale, turn (deg), brightness, stacking. */
interface Pose {
  x: number
  s: number
  ry: number
  light: number
  z: number
}

/** The opening composition: Progress in front, Lessons and Community a step behind, turned slightly in. */
const BASE: Pose[] = [
  { x: -0.74, s: 0.82, ry: -14, light: 0.55, z: 1 },
  { x: 0, s: 1, ry: 0, light: 1, z: 3 },
  { x: 0.74, s: 0.82, ry: 14, light: 0.55, z: 2 },
]

/** Each screen's turn at the front; the others step back and dim, never blur. */
const FOCUS: Pose[][] = [
  [
    { x: -0.46, s: 1.08, ry: -3, light: 1, z: 4 },
    { x: 0.14, s: 0.8, ry: 0, light: 0.45, z: 2 },
    { x: 0.82, s: 0.72, ry: 14, light: 0.38, z: 1 },
  ],
  [
    { x: -0.82, s: 0.76, ry: -14, light: 0.4, z: 1 },
    { x: 0, s: 1.1, ry: 0, light: 1, z: 4 },
    { x: 0.82, s: 0.76, ry: 14, light: 0.4, z: 1 },
  ],
  [
    { x: -0.82, s: 0.72, ry: -14, light: 0.38, z: 1 },
    { x: -0.14, s: 0.8, ry: 0, light: 0.45, z: 2 },
    { x: 0.46, s: 1.08, ry: 3, light: 1, z: 4 },
  ],
]

const vars = (p: Pose) => ({ xPercent: -50 + p.x * 100, yPercent: -50, scale: p.s, rotationY: p.ry, filter: `brightness(${p.light})`, zIndex: p.z })

/**
 * Jumpstart Finance (brief v16): the three original prototype screens are
 * the storytelling system. One pinned composition opens with the title
 * beside the trio (Progress in front); scrolling brings Lessons toward the
 * viewer for Short lessons and returns it, then Progress for Visible
 * progress, then Community for Peer support; at the end all three return to
 * the opening composition beside the result. Scale, light and depth only:
 * no glow, no blur, no extra devices. Reduced motion: the composition stands
 * still and the story reads beside it in order.
 */
export default function JumpstartFinance() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return
    const ctx = gsap.context(() => {
      const phones = gsap.utils.toArray<HTMLElement>('.jf-phone')
      const panels = gsap.utils.toArray<HTMLElement>('.jf-panel')
      phones.forEach((el, i) => gsap.set(el, vars(BASE[i])))
      gsap.set(panels.slice(1), { autoAlpha: 0, y: 24 })
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut', duration: 1 },
        scrollTrigger: { trigger: root, start: 'top top+=61', end: 'bottom bottom', scrub: 0.5 },
      })
      // Moves never overlap on the same phone or panel, so scrubbing back and forth is exact.
      const pose = (poses: Pose[], at: number) => phones.forEach((el, i) => tl.to(el, { ...vars(poses[i]), duration: 0.8 }, at))
      const swap = (from: number, to: number, at: number) => {
        tl.to(panels[from], { autoAlpha: 0, y: -24, duration: 0.45 }, at)
        tl.to(panels[to], { autoAlpha: 1, y: 0, duration: 0.6 }, at + 0.35)
      }
      // Opening hold, then each screen's turn at the front, each returning to the opening composition before the next.
      pose(FOCUS[0], 0.8)
      swap(0, 1, 0.8)
      pose(BASE, 2.6)
      pose(FOCUS[1], 3.4)
      swap(1, 2, 3.0)
      pose(BASE, 5.2)
      pose(FOCUS[2], 6.0)
      swap(2, 3, 5.6)
      pose(BASE, 7.8)
      swap(3, 4, 7.8)
      tl.to({}, { duration: 1.2 }, 8.6)
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <CasePage project={project} className="page-jumpstart-finance">
      <section ref={rootRef} className="jf-story" data-reduced={reduced || undefined} aria-label="Jumpstart Finance, told through the prototype">
        <div className="jf-stage">
          <div className="jf-text">
            <header className="jf-panel jf-panel--intro">
              <CaseTitle title={C.title} meta={C.meta} />
              <div className="cx-lede">{C.summary}</div>
            </header>
            {C.steps.map((step, i) => (
              <section key={step.id} className="jf-panel" aria-labelledby={`jf-${step.id}`}>
                <p className="jf-panel__index">
                  {String(i + 1).padStart(2, '0')} <span>{C.phones[step.phone].name}</span>
                </p>
                <h2 className="jf-panel__title" id={`jf-${step.id}`}>
                  {step.title}
                </h2>
                <div className="cx-body">{step.body}</div>
              </section>
            ))}
            <section className="jf-panel jf-panel--result" aria-labelledby="jf-result">
              <p className="cx-kicker" id="jf-result">
                The result
              </p>
              <p className="jf-result__figure" aria-hidden="true">
                {C.result.figure}
                <span>{C.result.unit}</span>
              </p>
              <div className="cx-body">{C.result.body}</div>
            </section>
          </div>
          <figure className="jf-trio" aria-label={`${C.label}: lessons, progress and community screens`}>
            <div className="jf-trio__stage">
              {C.phones.map((p) => (
                <div key={p.image} className="jf-phone">
                  <ResponsiveImage image={p.image} sizes="(min-width: 1100px) 17vw, 34vw" />
                </div>
              ))}
            </div>
            <figcaption className="jf-trio__label">{C.label}</figcaption>
          </figure>
        </div>
      </section>
    </CasePage>
  )
}
