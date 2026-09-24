import { useEffect } from 'react'
import { Link, useLocation, useRouteError } from 'react-router-dom'
import { SITE } from '../content/site'
import { usePageMeta } from '../hooks/usePageMeta'
import { CHUNK_RELOAD_KEY } from '../routes'

/** A route's code chunk could not be loaded (an old tab after a deploy, a dev-server restart, offline). */
function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error)
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Failed to fetch/i.test(message)
}

/**
 * Reload once, automatically, for a failed chunk. The guard (sessionStorage,
 * keyed by path) prevents a reload loop; it is cleared when any route chunk
 * loads successfully (routes.tsx).
 */
function shouldReload(error: unknown, pathname: string) {
  if (!isChunkLoadError(error)) return false
  try {
    return window.sessionStorage.getItem(CHUNK_RELOAD_KEY) !== pathname
  } catch {
    return false
  }
}

/**
 * Shown when a route fails to render or its code chunk cannot be loaded.
 * A failed chunk first reloads the page once by itself. Rendered inside the
 * normal page shell.
 */
export function RouteError() {
  const error = useRouteError()
  const { pathname } = useLocation()
  const reloading = shouldReload(error, pathname)
  usePageMeta('Page unavailable')
  useEffect(() => {
    if (!reloading) return
    try {
      window.sessionStorage.setItem(CHUNK_RELOAD_KEY, pathname)
    } catch {
      return
    }
    window.location.reload()
  }, [reloading, pathname])
  if (import.meta.env.DEV && !reloading) console.error(error)
  if (reloading) return <div className="shell not-found" aria-busy="true" />
  return (
    <div className="shell not-found">
      <h1 className="not-found__title" tabIndex={-1}>
        Page unavailable
      </h1>
      <p className="t-body t-muted">This page could not be loaded. Reloading usually fixes it.</p>
      <ul className="not-found__links" role="list">
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
