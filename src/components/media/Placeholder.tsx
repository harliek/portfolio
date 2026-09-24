import '../../styles/placeholder.css'
import type { CSSProperties } from 'react'

/**
 * A missing visual that Harlie will supply. `id` matches the entry in
 * docs/asset-requests.md (and is the intended replacement filename's stem),
 * `ratio` is the intended aspect ratio (e.g. '16 / 10'), `label` is the one
 * concise sentence shown on the page, and `description` holds the fuller
 * brief for the asset-request document (not shown on the page).
 */
export interface PlaceholderSpec {
  id: string
  ratio: string
  label: string
  description: string
}

interface PlaceholderProps {
  spec: PlaceholderSpec
  /** Fill the parent box instead of sizing by the ratio (e.g. inside a fixed media frame). */
  fill?: boolean
  className?: string
}

/**
 * A deliberate draft placeholder at the intended size: a quiet dark gradient
 * surface with "Image to come" and one readable sentence. No dotted border,
 * no debug label, no empty box. Exposed to assistive technology as one image
 * whose name says what will be shown.
 */
export function Placeholder({ spec, fill = false, className }: PlaceholderProps) {
  const style = fill ? undefined : ({ aspectRatio: spec.ratio } as CSSProperties)
  return (
    <div
      className={['placeholder', className].filter(Boolean).join(' ')}
      data-fill={fill || undefined}
      data-asset-id={spec.id}
      data-asset-ratio={spec.ratio}
      style={style}
      role="img"
      aria-label={`Image to come. ${spec.label}`}
    >
      <div className="placeholder__text" aria-hidden="true">
        <span className="placeholder__kicker">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="m3.5 11.5 3-3.2 2.2 2.2 1.6-1.6 2.2 2.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx="10.6" cy="5.9" r="1.1" fill="currentColor" />
          </svg>
          Image to come
        </span>
        <span className="placeholder__label">{spec.label}</span>
      </div>
    </div>
  )
}
