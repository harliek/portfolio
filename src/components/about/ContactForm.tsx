import { useState, type FormEvent } from 'react'
import { ABOUT } from '../../content/pages/about'
import { SITE } from '../../content/site'
import { StatefulIcons } from '../ui/Stateful'

/** The form's name at Netlify. index.html declares the same form, hidden, so Netlify finds its fields at deploy. */
const FORM = 'contact'

type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'preview'

/**
 * Get in touch (Harlie's request, 2026-09-27): a name, an email address and a message, sent with Netlify Forms (the
 * site is hosted there). Messages arrive in the site's Forms list at Netlify, which can forward each one by email.
 * The button shows the stateful loader while it sends, then its check; a line under it says the message was sent,
 * or, if it could not be, to write by email instead. The browser checks the fields (all three are required, the
 * email must look like one). A hidden field catches bots (Netlify's honeypot).
 *
 * Beside the button, at the left of its row, the direct ways to reach Harlie: the email address, LinkedIn and the
 * résumé (Harlie's request, 2026-09-28: "clearly visible near the contact section, not buried in very low-contrast
 * footer text", with restraint, and the form and its "Send message" kept). They come after the button in the source,
 * so Tab goes from the message to "Send message" first; CSS sets them at the left.
 *
 * Nothing here moves the page (Harlie's request, 2026-09-28: the contact section is the natural final state): sending
 * keeps the scroll position and focus on the button, and the line under it only appears or clears. That line has a
 * row of its own under the button and the links (about.css), so neither moves when it appears (2026-09-28 polish
 * pass: it used to join their wrapping row, which pushed "Send message" down or onto a new line). If the message
 * could not be sent, the line gives the site's email address as a link (from SITE, not typed out again).
 *
 * The local preview (npm run dev) has no Netlify behind it: the form behaves as on the site but sends nothing.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const { contact, links } = ABOUT

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (status === 'sending' || !form.reportValidity()) return
    setStatus('sending')
    const body = new URLSearchParams([...new FormData(form).entries()].map(([key, value]) => [key, String(value)]))
    try {
      if (import.meta.env.DEV) {
        setStatus('preview')
        return
      } else {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        })
        if (!response.ok) throw new Error(`Form submission failed: ${response.status}`)
      }
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  // Writing again after a message was sent (or could not be) clears the line under the button.
  const onInput = () => {
    if (status === 'sent' || status === 'failed' || status === 'preview') setStatus('idle')
  }

  return (
    <form className="about-contact__form" name={FORM} method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit} onInput={onInput}>
      <input type="hidden" name="form-name" value={FORM} />
      {/* Harlie's one-line invitation, first in the form's grid, in the Education paragraph's text style (about.css). */}
      <div className="about-school__text">
        <p>{contact.intro}</p>
      </div>
      <p className="about-contact__trap" hidden>
        <label>
          Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className="about-contact__row">
        <label className="about-contact__field">
          <span className="about-contact__label">{contact.name}</span>
          <input className="about-contact__input" name="name" type="text" autoComplete="name" required maxLength={200} />
        </label>
        <label className="about-contact__field">
          <span className="about-contact__label">{contact.email}</span>
          <input className="about-contact__input" name="email" type="email" autoComplete="email" required maxLength={320} />
        </label>
      </div>
      <label className="about-contact__field">
        <span className="about-contact__label">{contact.message}</span>
        <textarea className="about-contact__input about-contact__message" name="message" rows={4} required maxLength={5000} />
      </label>
      <div className="about-contact__foot">
        <button
          type="submit"
          className="about-contact__send stateful"
          data-state={status === 'sending' ? 'loading' : status === 'sent' ? 'done' : 'idle'}
          aria-disabled={status === 'sending' || undefined}
        >
          <StatefulIcons />
          {contact.send}
        </button>
        <p className="about-contact__status" role="status">
          {status === 'sent' && contact.sent}
          {status === 'preview' && <>Local preview cannot send messages. Your text remains in the form. <a className="about-contact__status-link" href={SITE.emailHref}>Send an email instead</a>.</>}
          {status === 'failed' && (
            <>
              {contact.failed}{' '}
              <a className="about-contact__status-link" href={SITE.emailHref}>
                {SITE.email}
              </a>
              .
            </>
          )}
        </p>
        <nav className="about-contact__links" aria-label={links.label}>
          <a className="about-contact__link" href={SITE.emailHref}>
            {links.email}
            <span className="visually-hidden"> ({SITE.email})</span>
          </a>
          <a className="about-contact__link" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
            {links.linkedin}
            <span className="about-contact__arrow" aria-hidden="true">
              ↗
            </span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <a className="about-contact__link" href={SITE.resume} target="_blank" rel="noopener noreferrer">
            {links.resume}
            <span className="about-contact__arrow" aria-hidden="true">
              ↗
            </span>
            <span className="visually-hidden"> (PDF, opens in a new tab)</span>
          </a>
        </nav>
      </div>
    </form>
  )
}

