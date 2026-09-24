import { SITE } from '../../content/site'

/*
  The original's closing band: one rule, one heading, one sentence and two
  links, set on the same grid as the page above it.
*/
export function Contact() {
  return (
    <section className="ct" aria-labelledby="ct-h">
      <div className="ct-in lc-shell">
        <h2 className="ct-h" id="ct-h">
          Get in touch
        </h2>
        <p className="ct-p">I am open to early-career work in AI product, product management, and implementation strategy.</p>

        <p className="ct-acts">
          <a className="ct-act ct-act--go" href={SITE.emailHref}>
            {SITE.email}
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
              <path d="M.9 1.4h13.2v9.2H.9zM.9 1.9l6.6 4.6 6.6-4.6" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </a>
          <a className="ct-act" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </p>
      </div>
    </section>
  )
}
