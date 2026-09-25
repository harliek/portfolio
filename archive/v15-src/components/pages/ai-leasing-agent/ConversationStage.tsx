import { useId, useRef, useState, type CSSProperties } from 'react'
import { AI_LEASING_AGENT_REGIONS } from '../../../content/crops/ai-leasing-agent'
import { getImage, type ImageId } from '../../../content/media'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { ExpandIcon } from '../../media/ExpandIcon'
import { useImageDialog, type Region } from '../../media/ImageDialog'
import { ResponsiveImage } from '../../media/ResponsiveImage'

/*
 * ConversationStage: the AI Leasing Agent stage (CaseScroll `custom` media,
 * brief-v8 section 11). ONE large, legible conversation (the illustrative web
 * chat) with three identifiable moments: the prospective renter's question, the
 * assistant's answer, and a member of the leasing staff taking over. Each moment
 * carries a small role tag on its name row.
 *
 * Beside the story (sticky) the section being read brings its moment forward: an
 * accent frame glides to that message and a light veil softens the rest, which
 * stays readable, so the surrounding exchange is always in view and the image is
 * never replaced. Every change is one CSS transition of the frame's box, so
 * fast or backward scrolling simply retargets it (nothing is queued). The
 * opening and the outcome show the whole exchange with all three tags. Reduced
 * motion: the change is instant.
 *
 * Stacked: tablets show the same conversation with its three tags once, after
 * the opening; phones (below 600px), where the whole exchange would be too small
 * to read, show the three messages' text one after another with their tags,
 * each cut at the same scale so they read in place.
 *
 * The conversation is its own enlarge control (a real button over it, as on the
 * other case pages): a click or Enter opens the whole illustration at actual
 * size on the conversation, with the emphasised message marked; Escape or Close
 * returns focus. The expand glyph under it is a pointer shortcut. On phones a
 * visible button under the messages opens the conversation at actual size.
 */

export interface ConversationMoment {
  /** The role tag ('Prospective renter'). */
  tag: string
  /** The message (avatar, name and bubble), in percent of the conversation image. */
  rect: Region
  /** The tag's place: the middle of the message's name row (percent of the image height) and its right end (percent of the width from the right edge). */
  tagAt: { y: number; right: number }
  /** Phones: the message's text alone, which reads in place. */
  phone: ImageId
  /** The message bubble's own colour, around its phone crop (e.g. the renter's grey bubble). */
  paper: string
}

/** Which moment leads: an index into `moments`, or 'all' (the whole exchange, every tag, nothing emphasised). */
export type ConversationFocus = number | 'all'

interface ConversationStageProps {
  /** The conversation (a registered crop of `full`, AI_LEASING_AGENT_REGIONS). */
  image: 'ala-conversation'
  /** The whole illustration the enlarged view opens. */
  full: ImageId
  moments: ConversationMoment[]
  focus: ConversationFocus
  layout: 'sticky' | 'stacked'
  /** The discreet media label (Illustrative conversation). */
  label: string
}

const PHONE = '(max-width: 599.98px)'
/** The conversation's rendered width: the 645px desktop stage (52% of the 1240px grid), 47vw on narrower desktops, the stacked column. */
const SIZES = '(min-width: 1368px) 645px, (min-width: 960px) 47vw, calc(100vw - 40px)'
const PHONE_SIZES = 'calc(100vw - 40px)'

export function ConversationStage({ image, full, moments, focus, layout, label }: ConversationStageProps) {
  const phone = useMediaQuery(PHONE)
  const dialog = useImageDialog()
  const labelId = useId()
  const zoomRef = useRef<HTMLButtonElement>(null)
  const asset = getImage(image)
  const r = asset.width / asset.height
  const shown: ConversationFocus = layout === 'stacked' ? 'all' : focus
  const lead = typeof shown === 'number' ? Math.min(moments.length - 1, Math.max(0, shown)) : -1
  // The frame stays where it last was while it fades out for the overview, so it never slides as it leaves.
  const [framed, setFramed] = useState(Math.max(0, lead))
  if (lead >= 0 && lead !== framed) setFramed(lead)
  const box = moments[framed]?.rect ?? moments[0].rect

  /** The whole illustration at actual size, centred on the conversation, with the emphasised message marked. */
  const open = (trigger: HTMLElement) => {
    const at = AI_LEASING_AGENT_REGIONS[image]
    const whole = getImage(full)
    const pct = (x: number, y: number, w: number, h: number): Region => ({ x: (x / whole.width) * 100, y: (y / whole.height) * 100, w: (w / whole.width) * 100, h: (h / whole.height) * 100 })
    const inWhole = (m: Region) => pct(at.x + (m.x / 100) * at.w, at.y + (m.y / 100) * at.h, (m.w / 100) * at.w, (m.h / 100) * at.h)
    if (window.matchMedia(PHONE).matches) {
      // A phone: the conversation itself at actual size, from its top left, where the renter's question starts (the whole
      // illustration would open smaller than the messages already are).
      dialog.open(image, trigger, { gallery: [image], label, detail: true })
      return
    }
    dialog.open(full, trigger, {
      gallery: [full],
      label,
      detail: true,
      focus: pct(at.x, at.y, at.w, at.h),
      highlight: lead >= 0 ? inWhole(moments[lead].rect) : undefined,
    })
  }

  if (layout === 'stacked' && phone) {
    return (
      <figure className="cs-figure ala-strips" data-variant="inline">
        <ol className="ala-strips__list">
          {moments.map((m) => (
            <li key={m.tag} className="ala-strip">
              <span className="ala-tag" data-on="">
                {m.tag}
              </span>
              <span className="ala-strip__text" style={{ '--paper': m.paper } as CSSProperties}>
                <ResponsiveImage image={m.phone} sizes={PHONE_SIZES} fit="contain" />
              </span>
            </li>
          ))}
        </ol>
        <div className="cs-figbar">
          <span id={labelId} className="cs-media-label">
            {label}
          </span>
          <button type="button" className="cs-expand" aria-label="Enlarge the conversation" aria-describedby={labelId} onClick={(e) => open(e.currentTarget)}>
            <ExpandIcon />
          </button>
        </div>
      </figure>
    )
  }

  const frame = { left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` } as CSSProperties
  return (
    <figure className="cs-figure ala-conv" data-variant={layout === 'sticky' ? 'sticky' : 'inline'} data-focus={String(shown)} style={{ '--stage-r': r } as CSSProperties}>
      <div className="cs-stage ala-conv__stage">
        <div className="cs-layer" data-state="shown">
          <div className="cs-canvas" style={{ '--r': r } as CSSProperties}>
            <ResponsiveImage image={image} sizes={SIZES} fit="contain" priority />
            <span className="ala-frame" data-on={lead >= 0 || undefined} style={frame} aria-hidden="true" />
            {moments.map((m, i) => (
              <span
                key={m.tag}
                className="ala-tag"
                data-on={shown === 'all' || i === lead || undefined}
                style={{ top: `${m.tagAt.y}%`, right: `${m.tagAt.right}%` } as CSSProperties}
                aria-hidden="true"
              >
                {m.tag}
              </span>
            ))}
          </div>
        </div>
        <span className="cs-zoomlayer">
          <button
            ref={zoomRef}
            type="button"
            className="cs-zoom"
            style={{ '--r': r } as CSSProperties}
            data-zoom-id={full}
            aria-label="Enlarge the conversation"
            aria-describedby={labelId}
            onClick={(e) => open(e.currentTarget)}
          />
        </span>
      </div>
      <div className="cs-figbar">
        <span id={labelId} className="cs-media-label">
          {label}
        </span>
        {/* A pointer and touch shortcut: the conversation above is the accessible control, and focus returns to it. */}
        <button type="button" className="cs-expand" tabIndex={-1} aria-hidden="true" onClick={(e) => open(zoomRef.current ?? e.currentTarget)}>
          <ExpandIcon />
        </button>
      </div>
    </figure>
  )
}
