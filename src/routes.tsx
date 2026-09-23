import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { PageShell } from './components/layout/PageShell'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'

/**
 * Case-study and About chunks are loaded lazily. Loaders for each chunk are
 * exported so links can prefetch them on hover/focus (see prefetchRoute).
 */
export const routeChunks = {
  '/about': () => import('./pages/About'),
  '/work/planetart': () => import('./pages/work/PlanetArt'),
  '/work/valiance': () => import('./pages/work/Valiance'),
  '/work/spreadsheet-agent': () => import('./pages/work/SpreadsheetAgent'),
  '/work/jumpstart': () => import('./pages/work/Jumpstart'),
  '/work/shift': () => import('./pages/work/Shift'),
} as const

type ChunkPath = keyof typeof routeChunks

const prefetched = new Set<string>()

/** Starts downloading a route's chunk ahead of navigation (idempotent). */
export function prefetchRoute(path: string) {
  if (!(path in routeChunks) || prefetched.has(path)) return
  prefetched.add(path)
  void routeChunks[path as ChunkPath]().catch(() => prefetched.delete(path))
}

const lazyPage = (path: ChunkPath): RouteObject['lazy'] => async () => {
  const mod = await routeChunks[path]()
  return { Component: mod.default }
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PageShell,
    children: [
      { index: true, Component: Home },
      { path: 'about', lazy: lazyPage('/about') },
      { path: 'work/planetart', lazy: lazyPage('/work/planetart') },
      { path: 'work/valiance', lazy: lazyPage('/work/valiance') },
      { path: 'work/spreadsheet-agent', lazy: lazyPage('/work/spreadsheet-agent') },
      { path: 'work/jumpstart', lazy: lazyPage('/work/jumpstart') },
      { path: 'work/shift', lazy: lazyPage('/work/shift') },
      { path: '*', Component: NotFound },
    ],
  },
])
