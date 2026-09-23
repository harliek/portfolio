import { Link, useRouteError } from 'react-router-dom'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * Shown when a route fails to render or its code chunk cannot be loaded
 * (for example after a deploy invalidates an old chunk, or when offline).
 * Rendered inside the normal page shell.
 */
export function RouteError() {
  const error = useRouteError()
  usePageMeta('Page unavailable')
  if (import.meta.env.DEV) console.error(error)
  return (
    <div className="shell not-found">
      <h1 className="t-display" tabIndex={-1}>
        Page unavailable
      </h1>
      <p className="t-body t-muted">This page could not be loaded. Reloading usually fixes it.</p>
      <ul className="not-found__links">
        <li>
          <button type="button" className="button" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </li>
        <li>
          <Link className="button button--quiet" to="/">
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
