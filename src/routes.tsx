import { createBrowserRouter, Navigate, useLocation, type RouteObject } from 'react-router-dom'
import { PageShell } from './components/layout/PageShell'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { RouteError } from './pages/RouteError'

/** The restored creative portfolio's layout (its own header, contact band and footer). */
const creativeLayout = () => import('./creative/CreativeLayout')

/**
 * Case-study, About and creative chunks are loaded lazily. Loaders for each
 * chunk are exported so links can prefetch them on hover/focus
 * (prefetchRoute) and the project transition can wait for them. A creative
 * page's loader also fetches the creative layout.
 */
export const routeChunks = {
  '/about': () => import('./pages/About'),
  '/creative': () => Promise.all([creativeLayout(), import('./creative/pages/CreativeHub')]).then(([, m]) => m),
  '/creative/art': () => Promise.all([creativeLayout(), import('./creative/pages/ArtPage')]).then(([, m]) => m),
  '/creative/film': () => Promise.all([creativeLayout(), import('./creative/pages/FilmPage')]).then(([, m]) => m),
  '/work/cafepress-uk': () => import('./pages/work/CafePressUK'),
  '/work/merchandising-platform': () => import('./pages/work/MerchandisingPlatform'),
  '/work/spreadsheet-agent': () => import('./pages/work/SpreadsheetAgent'),
  '/work/valiance': () => import('./pages/work/AILeasingAgent'),
  '/work/jumpstart': () => import('./pages/work/JumpstartFinance'),
  '/work/shift': () => import('./pages/work/ClientWork'),
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
          { path: 'work/shift', lazy: lazyPage('/work/shift') },
          // Legacy links: the PlanetArt case study became CafePress UK; the
          // previous portfolio's Merch Console URL.
          { path: 'work/planetart', element: <Legacy to="/work/cafepress-uk" /> },
          { path: 'work/planetart/console', element: <Legacy to="/work/merchandising-platform" /> },
          { path: '*', Component: NotFound },
        ],
      },
    ],
  },
  {
    // The restored creative portfolio, at its original URLs, outside the
    // professional shell (no background video, header, footer or pointer
    // trail). A failed page or chunk renders RouteError on its own.
    path: '/creative',
    HydrateFallback: () => null,
    ErrorBoundary: RouteError,
    lazy: async () => {
      const mod = await creativeLayout()
      clearChunkReload()
      return { Component: mod.default }
    },
    children: [
      { index: true, lazy: lazyPage('/creative') },
      { path: 'art', lazy: lazyPage('/creative/art') },
      { path: 'film', lazy: lazyPage('/creative/film') },
    ],
  },
  // The interim professional /art and /film pages: now the creative ones.
  { path: '/art', element: <Legacy to="/creative/art" /> },
  { path: '/film', element: <Legacy to="/creative/film" /> },
])
