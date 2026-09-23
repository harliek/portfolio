import { SITE } from '../../content/site'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div className="site-footer__top">
          <p className="site-footer__name">{SITE.name}</p>
          <nav aria-label="Contact and résumé">
            <ul>
              <li>
                <a href={SITE.emailHref}>Email</a>
              </li>
              <li>
                <a href={SITE.linkedin}>LinkedIn</a>
              </li>
              <li>
                <a href={SITE.resume} target="_blank" rel="noopener noreferrer" aria-label="Open résumé PDF in a new tab.">
                  Resume <span aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="site-footer__copy tabular">© {year} Harlie Katz</p>
      </div>
    </footer>
  )
}
