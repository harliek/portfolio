import { useId, type CSSProperties } from 'react'
import { getImage, type ImageId } from '../../../content/media'
import { useImageDialog } from '../../media/ImageDialog'
import { ResponsiveImage } from '../../media/ResponsiveImage'

/*
 * PhoneGroup: the Jumpstart Finance stage (CaseScroll `custom` media, brief-v8
 * section 14). Three original 2024 prototype screens (lessons, progress,
 * community) stand together on one floor with modest depth and controlled
 * overlap. The phone that matches the section being read is larger, a little
 * lower (nearer) and in front; the others step back, turn slightly towards it
 * and dim a little, and stay whole enough to recognise. Every change is one CSS
 * transition of position, scale, turn and light (jumpstart-finance.css), so
 * fast or backward scrolling simply retargets it: nothing is replaced, nothing
 * is queued, and there is no blur. Reduced motion: the change is instant.
 *
 * Beside the story (sticky) the emphasis follows `focus`; stacked (below
 * 960px) the group sits once after the opening, before the story, so it shows
 * its balanced overview instead.
 *
 * Each phone is its own enlarge control (a real button over its silhouette):
 * a click or Enter opens the shared image dialog on that screen, with the
 * other two a step away, labelled with the group's label; Escape or Close
 * returns focus to the phone.
 */

export interface GroupPhone {
  image: ImageId
  /** Short screen name, for the enlarge control ('Lessons'). */
  name: string
}

/** Which phone leads: an index into `phones`, or 'all' for the balanced overview. */
export type PhoneFocus = number | 'all'

/** One phone's place: x (centre, % of the group's width), y (% of its height, negative = farther back), scale, turn (deg), stacking, light. */
interface Pose {
  x: number
  y: number
  s: number
  ry: number
  z: number
  lit: number
}

/*
 * Poses for three phones, designed for a phone width of 37% of the group (the
 * CSS caps it there; on a shorter stage the phones are smaller and the gaps a
 * little wider). Overlaps are about 2.5% of the group's width, so each phone
 * behind keeps its screen content in view. The lead phone is in front (z 3), its
 * neighbour next (z 2), a far phone last (z 1).
 */
const NEAR = 0.8
const FAR = 0.7
const POSES: Record<'0' | '1' | '2' | 'all', Pose[]> = {
  '0': [
    { x: 24.75, y: 0, s: 1, ry: 0, z: 3, lit: 1 },
    { x: 55.55, y: -2, s: NEAR, ry: -9, z: 2, lit: 0 },
    { x: 80.8, y: -3.5, s: FAR, ry: -13, z: 1, lit: 0 },
  ],
  '1': [
    { x: 19.2, y: -2, s: NEAR, ry: 9, z: 2, lit: 0 },
    { x: 50, y: 0, s: 1, ry: 0, z: 3, lit: 1 },
    { x: 80.8, y: -2, s: NEAR, ry: -9, z: 2, lit: 0 },
  ],
  '2': [
    { x: 19.2, y: -3.5, s: FAR, ry: 13, z: 1, lit: 0 },
    { x: 44.45, y: -2, s: NEAR, ry: 9, z: 2, lit: 0 },
    { x: 75.25, y: 0, s: 1, ry: 0, z: 3, lit: 1 },
  ],
  all: [
    { x: 20.8, y: -1, s: 0.84, ry: 7, z: 2, lit: 0.6 },
    { x: 50, y: 0, s: 0.9, ry: 0, z: 3, lit: 0.8 },
    { x: 79.2, y: -1, s: 0.84, ry: -7, z: 2, lit: 0.6 },
  ],
}

const poseFor = (focus: PhoneFocus, i: number): Pose => {
  const key = focus === 'all' ? 'all' : (String(Math.min(2, Math.max(0, focus))) as '0' | '1' | '2')
  return POSES[key][i] ?? POSES.all[1]
}

interface PhoneGroupProps {
  /** Exactly three screens, in reading order (lessons, progress, community). */
  phones: GroupPhone[]
  focus: PhoneFocus
  layout: 'sticky' | 'stacked'
  /** A discreet media label under the group (e.g. 'Original 2024 prototype'). */
  label: string
}

/** Each phone's rendered width: 37% of the stage (52% of the 1240px grid on desktop) or of the stacked column. */
const PHONE_SIZES = '(min-width: 1368px) 240px, (min-width: 960px) 18vw, 37vw'

export function PhoneGroup({ phones, focus, layout, label }: PhoneGroupProps) {
  const dialog = useImageDialog()
  const labelId = useId()
  const descId = useId()
  const shown: PhoneFocus = layout === 'stacked' ? 'all' : focus
  const gallery = phones.map((p) => p.image)
  const lead = shown === 'all' ? -1 : shown

  return (
    <figure className="jf-group" data-layout={layout} data-focus={String(shown)}>
      <div className="jf-floor">
        {phones.map((phone, i) => {
          const pose = poseFor(shown, i)
          const style = {
            '--x': pose.x,
            '--y': pose.y,
            '--s': pose.s,
            '--ry': `${pose.ry}deg`,
            '--lit': pose.lit,
            zIndex: pose.z,
          } as CSSProperties
          const asset = getImage(phone.image)
          return (
            <div key={phone.image} className="jf-phone" data-lead={i === lead || undefined} style={style}>
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
      </div>
      <figcaption id={labelId} className="cs-media-label jf-group__label">
        {label}
      </figcaption>
    </figure>
  )
}
