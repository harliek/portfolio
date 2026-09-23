import { Link } from 'react-router-dom'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

export function NotFound() {
  usePageMeta('Page not found')
  return (
    <div className="shell not-found">
      <h1 className="t-display" tabIndex={-1}>
        Page not found
      </h1>
      <p className="t-body t-muted">This page is unavailable. You can return to the work or contact me directly.</p>
      <ul className="not-found__links">
        <li>
          <Link className="button" to="/">
            View work
          </Link>
        </li>
        <li>
          <a className="button button--quiet" href={SITE.emailHref}>
            Email Harlie
          </a>
        </li>
      </ul>
    </div>
  )
}
