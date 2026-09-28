import { PageLink } from '../components/transition/PageLink'
import { usePageMeta } from '../hooks/usePageMeta'

export function NotFound() {
  usePageMeta('Page not found')
  return (
    <div className="shell not-found">
      <h1 className="t-display" tabIndex={-1}>
        Page not found
      </h1>
      <ul className="not-found__links">
        <li>
          <PageLink className="button" to="/" direction="back">
            View work
          </PageLink>
        </li>
        <li>
          <PageLink className="button button--quiet" to="/about">
            About
          </PageLink>
        </li>
      </ul>
    </div>
  )
}
