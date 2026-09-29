import { useEffect } from 'react'
import { createBrowserRouter, Navigate, useLocation, type RouteObject } from 'react-router-dom'
import { PageShell } from './components/layout/PageShell'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { RouteError } from './pages/RouteError'

/**
 * Case-study and About chunks are loaded lazily. Loaders for each chunk are
 * exported so links can prefetch them on hover/focus (prefetchRoute) and the
 * project transition can wait for them.
 *
 * The restored creative portfolio is not part of this app: it is the original
 * static build at /creative/ (public/creative, served by vite.config.ts in
 * development and preview and by netlify.toml / public/_redirects in
 * production).
 */
export const routeChunks = {
  '/about': () => import('./pages/About'),
  '/work/cafepress-uk': () => import('./pages/work/CafePressUK'),
  '/work/merchandising-platform': () => import('./pages/work/MerchandisingPlatform'),
  '/work/spreadsheet-agent': () => import('./pages/work/SpreadsheetAgent'),
  '/work/valiance': () => import('./pages/work/AILeasingAgent'),
  '/work/jumpstart': () => import('./pages/work/JumpstartFinance'),
  '/work/creative-production': () => import('./pages/work/ClientWork'),
} as const

type ChunkPath = keyof typeof routeChunks

/** sessionStorage key of RouteError's one automatic reload after a failed chunk. */
export const CHUNK_RELOAD_KEY = 'hk-chunk-reload'

const prefetched = new Set<string>()

/** Starts downloading a route's chunk ahead of navigation (idempotent). */
export function prefetchRoute(path: string) {
  if (!(path in routeChunks) || prefetched.has(path)) return
  prefetched.add(path)
  void routeChunks[path as ChunkPath]().catch(() => prefetched.delete(path))
}

function clearChunkReload() {
  try {
    window.sessionStorage.removeItem(CHUNK_RELOAD_KEY)
  } catch {
    /* ignore */
  }
}

const lazyPage = (path: ChunkPath): RouteObject['lazy'] => async () => {
  const mod = await routeChunks[path]()
  clearChunkReload()
  return { Component: mod.default }
}

/** A preserved legacy URL: replaces itself with the current one, keeping any hash. */
function Legacy({ to }: { to: string }) {
  const { hash, search } = useLocation()
  return <Navigate to={{ pathname: to, search, hash }} replace />
}

/** The path this document was loaded at, i.e. the URL the server answered with this app. */
const DOCUMENT_PATH = window.location.pathname

/**
 * A URL that belongs to the separate creative site. A client-side navigation
 * to it (for example a router Link to /creative) loads that document in place
 * of the current history entry. If the server answered that very URL with
 * this app, reloading would loop, so the 404 page is shown instead.
 */
function CreativeDocument({ to }: { to?: string }) {
  const { pathname, search, hash } = useLocation()
  const target = to ?? pathname
  const servedHere = target === DOCUMENT_PATH
  useEffect(() => {
    if (!servedHere) window.location.replace(target + search + hash)
  }, [servedHere, target, search, hash])
  return servedHere ? <NotFound /> : null
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PageShell,
    // Rendered only while a directly loaded lazy route resolves.
    HydrateFallback: () => null,
    children: [
      {
        // Pathless layout: a failed page or chunk renders RouteError inside
        // the normal header/footer shell instead of the router's default.
        ErrorBoundary: RouteError,
        children: [
          { index: true, Component: Home },
          { path: 'about', lazy: lazyPage('/about') },
          { path: 'work/cafepress-uk', lazy: lazyPage('/work/cafepress-uk') },
          { path: 'work/merchandising-platform', lazy: lazyPage('/work/merchandising-platform') },
          { path: 'work/spreadsheet-agent', lazy: lazyPage('/work/spreadsheet-agent') },
          { path: 'work/valiance', lazy: lazyPage('/work/valiance') },
          { path: 'work/jumpstart', lazy: lazyPage('/work/jumpstart') },
          { path: 'work/creative-production', lazy: lazyPage('/work/creative-production') },
          // Creative Production was Client Work at /work/shift.
          { path: 'work/shift', element: <Legacy to="/work/creative-production" /> },
          // Legacy links: the PlanetArt case study became CafePress UK; the
          // previous portfolio's Merch Console URL.
          { path: 'work/planetart', element: <Legacy to="/work/cafepress-uk" /> },
          { path: 'work/planetart/console', element: <Legacy to="/work/merchandising-platform" /> },
          // The restored creative portfolio (a separate document) and its
          // earlier URLs. The server redirects these too; the routes only
          // cover client-side navigation.
          { path: 'creative/*', element: <CreativeDocument /> },
          { path: 'creative/film', element: <CreativeDocument to="/creative/films" /> },
          { path: 'films', element: <CreativeDocument to="/creative/films" /> },
          { path: 'film', element: <CreativeDocument to="/creative/films" /> },
          { path: 'art', element: <CreativeDocument to="/creative/art" /> },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
])
