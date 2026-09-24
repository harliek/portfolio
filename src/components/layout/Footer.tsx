import { SITE } from '../../content/site'
import { useMotionPreference } from '../../hooks/useMotionPreference'

/**
 * Footer on every page. `id="contact"` is the header's Contact target:
 * email, LinkedIn and the résumé download. The understated "Reduce motion"
 * toggle is the site-wide, persistent way to stop automatic movement (the
 * carousel, the background video, the pointer trail, transitions). Its
 * default follows the operating system setting.
 */
export function Footer() {
  const { reduced, setReduced } = useMotionPreference()
  const year = new Date().getFullYear()
  return (
    <footer id="contact" className="site-footer" tabIndex={-1} aria-labelledby="footer-contact-title">
      <div className="shell site-footer__inner">
        <div className="site-footer__contact">
          <h2 id="footer-contact-title" className="site-footer__title">
            Contact
          </h2>
          <ul className="site-footer__links" role="list">
            <li>
              <a href={SITE.emailHref} className="site-footer__link">
                {SITE.email}
              </a>
            </li>
            <li>
              <a href={SITE.linkedin} className="site-footer__link">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={SITE.resume} download={SITE.resumeDownloadName} className="site-footer__link">
                Download resume
              </a>
            </li>
          </ul>
        </div>
        <div className="site-footer__base">
          <p className="site-footer__copy tabular">© {year} Harlie Katz</p>
          <button type="button" className="motion-toggle" aria-pressed={reduced} onClick={() => setReduced(!reduced)}>
            <span className="motion-toggle__box" aria-hidden="true" />
            Reduce motion
          </button>
        </div>
      </div>
    </footer>
  )
}
