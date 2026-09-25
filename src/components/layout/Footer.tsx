import { SITE } from '../../content/site'

/**
 * The end of every page (brief v18): one compact row. Harlie's name is the
 * contact link itself (mailto, with a label that says so), then LinkedIn
 * and the résumé (checked: no phone number in it), and the copyright. No
 * separate call to action, no repeated address, no second hero.
 */
export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-end">
      <div className="site-end__inner">
        <a className="site-end__name" href={SITE.emailHref} aria-label={`Email Harlie Katz at ${SITE.email}`}>
          {SITE.name}
        </a>
        <nav className="site-end__links" aria-label="Elsewhere">
          <a className="site-end__link" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
          </a>
          <a className="site-end__link" href={SITE.resume} target="_blank" rel="noopener noreferrer">
            Résumé<span className="visually-hidden"> (PDF, opens in a new tab)</span>
          </a>
        </nav>
        <p className="site-end__copy tabular">
          © {year} {SITE.name}
        </p>
      </div>
    </footer>
  )
}
