import { useId } from 'react'
import { SITE } from '../../content/site'

interface ContactBlockProps {
  /** Optional line between the heading and the email address. */
  intro?: string
  /** Mark for the page's once-only section entrance (useReveal). */
  reveal?: boolean
  className?: string
}

/** Quiet contact ending: heading, email as the primary link, LinkedIn as secondary. */
export function ContactBlock({ intro, reveal = false, className }: ContactBlockProps) {
  const headingId = useId()
  return (
    <section
      className={['contact-block', className].filter(Boolean).join(' ')}
      aria-labelledby={headingId}
      data-reveal={reveal ? '' : undefined}
    >
      <h2 id={headingId} className="contact-block__heading t-section">
        Get in touch
      </h2>
      {intro && <p className="contact-block__intro">{intro}</p>}
      <ul className="contact-block__links">
        <li>
          <a className="contact-block__email prose-link t-sub" href={SITE.emailHref}>
            {SITE.email}
          </a>
        </li>
        <li>
          <a className="contact-block__secondary" href={SITE.linkedin}>
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>
    </section>
  )
}
