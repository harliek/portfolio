import { SITE } from '../../content/site'
import { useMotionPreference } from '../../hooks/useMotionPreference'

/**
 * The single contact area, at the end of every professional page
 * (`id="contact"`, the header's Contact target): email, LinkedIn and
 * "View résumé ↗" (opens the PDF in a new tab). Below it, the quiet,
 * persistent "Reduce motion" setting: a labelled switch that stops the
 * carousel, the background video, the pointer trail and transitions. Its
 * default follows the operating system setting.
 */
export function Footer() {
  const { reduced, setReduced } = useMotionPreference()
  const year = new Date().getFullYear()
  return (
    <footer id="contact" className="site-footer" aria-labelledby="contact-title">
      <div className="shell site-footer__inner">
        <div className="site-footer__contact">
          <h2 id="contact-title" className="site-footer__title">
            Contact
          </h2>
          <ul className="site-footer__links" role="list">
            <li>
              <a href={SITE.emailHref} className="text-link text-link--standalone site-footer__link">
                {SITE.email}
              </a>
            </li>
            <li>
              <a href={SITE.linkedin} className="text-link text-link--standalone site-footer__link" target="_blank" rel="noopener noreferrer">
                LinkedIn <span className="link-arrow" aria-hidden="true">↗</span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
          <a href={SITE.resume} className="button button--secondary site-footer__resume" target="_blank" rel="noopener">
            View résumé <span className="button__arrow" aria-hidden="true">↗</span>
            <span className="visually-hidden"> (PDF, opens in a new tab)</span>
          </a>
        </div>
        <div className="site-footer__base">
          <p className="site-footer__copy tabular">© {year} Harlie Katz</p>
          <button type="button" className="motion-toggle" aria-pressed={reduced} onClick={() => setReduced(!reduced)}>
            <span className="motion-toggle__track" aria-hidden="true">
              <span className="motion-toggle__knob" />
            </span>
            Reduce motion
          </button>
        </div>
      </div>
    </footer>
  )
}
