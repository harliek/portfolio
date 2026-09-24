import { useId, type CSSProperties } from 'react'
import { getImage, type ImageId } from '../../../content/media'
import { useImageDialog } from '../../media/ImageDialog'
import { ResponsiveImage } from '../../media/ResponsiveImage'

/*
 * PhoneGroup: the Jumpstart Finance stage (CaseScroll `custom` media; motion-plan P4, the emphasis stack).
 * Three original 2024 prototype screens (lessons, progress, community) stand together on one floor, each in
 * its own place (Lessons left, Progress centre, Community right), so the reader learns where each screen is.
 * The phone that matches the section being read comes forward (larger, lower on the floor, frontal, in front,
 * with the page's featured light); the others step back and stay whole and readable behind it (smaller,
 * higher, turned slightly towards it, with a quieter light). Adapted, as principles only, from Beirne Relay
 * (https://beirne-websites.vercel.app/work/relay: one item of a visible group comes to the front per story
 * step, the stage releases into reading at the end, no ghosted large text) and Fancy Stacking Cards
 * (https://www.fancycomponents.dev/docs/components/blocks/stacking-cards: the others stay visible, reduced a
 * little; scale and position are the cues, never blur or heavy dimming).
 *
 * One depth value drives every phone: d = its index minus the lead's, a = |d|. From it come the scale, the
 * rise on the floor, the turn (towards the lead), the stacking order and the light level. The horizontal
 * places follow from the scales: the group is centred and neighbours overlap by a set share of the phone
 * behind, never more than its bezel and the screen's own white margin, so no screen content is ever covered
 * (also during a move, since the edges travel with the scales). Positions are in units of the phone's width,
 * so the composition is the same on every stage size; the phone width is the largest that lets the widest
 * state fill the stage (--jf-span, jumpstart-finance.css).
 *
 * Every change is one CSS transition of position, scale, turn, stacking and light together (--dur-3, the
 * arrive curve; jumpstart-finance.css): fast or backward scrolling simply retargets it, nothing is queued, and
 * the stacking swaps when the two phones are the same size, halfway through the move. Reduced motion: the
 * change is instant.
 *
 * Beside the story (sticky) the lead follows `focus`; the outcome shows the balanced group (every phone level),
 * and the stage then leaves with the outcome (CaseScroll), back to normal reading. Stacked (below 960px) the
 * group sits once after the opening, in natural flow, with a gentler depth; the phone of the section being read
 * is still indicated (its light, and its name marked in a small index under the phones).
 *
 * Each phone is its own enlarge control (a real button over its silhouette): a click or Enter opens the shared
 * image dialog on that screen, with the other two a step away, labelled with the group's label; Escape or
 * Close returns focus to the phone. Hover and keyboard focus give a phone the active light only: its place and
 * size follow the story, not the pointer.
 */

export interface GroupPhone {
  image: ImageId
  /** Short screen name, for the enlarge control and the stacked index ('Lessons'). */
  name: string
}

/** Which phone leads: an index into `phones`, or 'all' for the balanced group. */
export type PhoneFocus = number | 'all'

type Level = 'lead' | 'near' | 'far' | 'even'

/** One phone's place: x (centre, in phone widths from the stage centre), rise (share of the phone height), scale, turn (deg), stacking, light. */
interface Pose {
  x: number
  rise: number
  s: number
  ry: number
  z: number
  level: Level
}

/** Depth by level a = |d|: scale, rise (share of the phone height) and turn (deg). */
interface Depth {
  s: readonly [number, number, number]
  rise: readonly [number, number, number]
  turn: readonly [number, number, number]
  /**
   * Overlap between neighbours, as a share of the phone behind (the smaller one). Each canvas has 1.3% of clear
   * margin per side, so 0.085 covers about 6% of the back phone's body: its bezel and the screen's own white
   * margin, never content (the screens' content starts 8.4% in at the least, on Community's left side).
   */
  overlap: number
  /** The balanced group: the centre phone, the outer two, their turn. */
  even: { centre: number; side: number; turn: number; rise: number }
}

const DEPTH: Record<'sticky' | 'stacked', Depth> = {
  sticky: {
    s: [1, 0.82, 0.72],
    rise: [0, 0.03, 0.055],
    turn: [0, 8, 12],
    overlap: 0.085,
    even: { centre: 0.9, side: 0.86, turn: 6, rise: 0.015 },
  },
  // Stacked: gentler depth in the narrow column; the lead is still clearly the larger, frontal, lit one.
  stacked: {
    s: [1, 0.88, 0.8],
    rise: [0, 0.02, 0.035],
    turn: [0, 6, 9],
    overlap: 0.085,
    even: { centre: 0.94, side: 0.9, turn: 5, rise: 0.012 },
  },
}

const LEVELS: readonly Level[] = ['lead', 'near', 'far']

/**
 * Centres for phones of these scales (in phone widths from the stage centre), the group centred, each pair of
 * neighbours overlapping by `overlap` of the smaller one's width. Both edges of a pair move linearly with the
 * scales, so the overlap stays within that band during a move too.
 */
function centres(scales: number[], overlap: number) {
  const overlaps = scales.slice(1).map((s, i) => overlap * Math.min(s, scales[i]))
  const span = scales.reduce((sum, s) => sum + s, 0) - overlaps.reduce((sum, o) => sum + o, 0)
  let edge = -span / 2
  return scales.map((s, i) => {
    const x = edge + s / 2
    edge += s - (overlaps[i] ?? 0)
    return x
  })
}

/** The group's width in phone widths for this state. */
const spanOf = (poses: Pose[]) => Math.max(...poses.map((p) => p.x + p.s / 2)) - Math.min(...poses.map((p) => p.x - p.s / 2))

function posesFor(focus: PhoneFocus, count: number, layout: 'sticky' | 'stacked'): Pose[] {
  const D = DEPTH[layout]
  if (focus === 'all') {
    const mid = (count - 1) / 2
    const scales = Array.from({ length: count }, (_, i) => (i === mid ? D.even.centre : D.even.side))
    const xs = centres(scales, D.overlap)
    return scales.map((s, i) => ({
      x: xs[i],
      rise: i === mid ? 0 : D.even.rise,
      s,
      ry: Math.sign(mid - i) * D.even.turn,
      z: i === mid ? 3 : 2,
      level: 'even',
    }))
  }
  const lead = Math.min(count - 1, Math.max(0, focus))
  const depth = Array.from({ length: count }, (_, i) => i - lead)
  const scales = depth.map((d) => D.s[Math.min(2, Math.abs(d))])
  const xs = centres(scales, D.overlap)
  return depth.map((d, i) => {
    const a = Math.min(2, Math.abs(d))
    return {
      x: xs[i],
      rise: D.rise[a],
      s: scales[i],
      // Turned towards the lead: a phone on its right faces left (negative), on its left faces right.
      ry: -Math.sign(d) * D.turn[a],
      z: 3 - a,
      level: LEVELS[a],
    }
  })
}

/** The widest state of a layout (in phone widths): the phone width is sized so that one fits the stage. */
const SPAN_MAX = {
  sticky: Math.max(spanOf(posesFor('all', 3, 'sticky')), ...[0, 1, 2].map((f) => spanOf(posesFor(f, 3, 'sticky')))),
  stacked: Math.max(spanOf(posesFor('all', 3, 'stacked')), ...[0, 1, 2].map((f) => spanOf(posesFor(f, 3, 'stacked')))),
}

const round = (n: number) => Math.round(n * 1e4) / 1e4

interface PhoneGroupProps {
  /** Exactly three screens, in reading order (lessons, progress, community). */
  phones: GroupPhone[]
  focus: PhoneFocus
  layout: 'sticky' | 'stacked'
  /** A discreet media label under the group (e.g. 'Original 2024 prototype'). */
  label: string
}

/** Each phone's rendered width: about 38% of the stage (the 645px media column on desktop) or of the stacked column. */
const PHONE_SIZES = '(min-width: 1368px) 250px, (min-width: 960px) 19vw, 37vw'

export function PhoneGroup({ phones, focus, layout, label }: PhoneGroupProps) {
  const dialog = useImageDialog()
  const labelId = useId()
  const descId = useId()
  // Both layouts follow the section being read (the page maps the opening to the first phone).
  const poses = posesFor(focus, phones.length, layout)
  const lead = poses.findIndex((p) => p.level === 'lead')
  const gallery = phones.map((p) => p.image)

  return (
    <figure
      className="jf-group"
      data-layout={layout}
      data-focus={String(focus)}
      style={{ '--jf-span': round(SPAN_MAX[layout]) } as CSSProperties}
    >
      <div className="jf-floor">
        {phones.map((phone, i) => {
          const pose = poses[i]
          const style = {
            '--x': round(pose.x),
            '--rise': round(pose.rise),
            '--s': pose.s,
            '--ry': `${round(pose.ry)}deg`,
            zIndex: pose.z,
          } as CSSProperties
          const asset = getImage(phone.image)
          return (
            <div key={phone.image} className="jf-phone" data-level={pose.level} data-lead={i === lead || undefined} style={style}>
              <span className="jf-phone__spill" aria-hidden="true" />
              <span className="jf-phone__shadow" aria-hidden="true" />
              <div className="jf-phone__body">
                <ResponsiveImage image={phone.image} sizes={PHONE_SIZES} fit="contain" decorative priority={i === 0} loading="eager" />
                <button
                  type="button"
                  className="jf-phone__zoom"
                  data-zoom-id={phone.image}
                  aria-label={`Enlarge the ${phone.name.toLowerCase()} screen`}
                  aria-describedby={`${descId}-${i} ${labelId}`}
                  onClick={(e) => dialog.open(phone.image, e.currentTarget, { gallery, label })}
                />
                <span id={`${descId}-${i}`} className="visually-hidden">
                  {asset.alt}
                </span>
              </div>
            </div>
          )
        })}
        {layout === 'stacked' && (
          // The stacked index: each screen's name under its phone, the one being read marked (Beirne's step row).
          // Decorative for assistive technology: each enlarge control already carries the name.
          <div className="jf-index" aria-hidden="true">
            {phones.map((phone, i) => (
              <span
                key={phone.image}
                className="jf-index__name"
                data-lead={i === lead || undefined}
                style={{ '--x': round(poses[i].x) } as CSSProperties}
              >
                {phone.name}
              </span>
            ))}
          </div>
        )}
      </div>
      <figcaption id={labelId} className="cs-media-label jf-group__label">
        {label}
      </figcaption>
    </figure>
  )
}
