import type { MouseEvent } from 'react'
import { TRANSITION } from '../../config/transition'
import { fallbackSrc, getImage, srcSet, type ImageId } from '../../content/media'
import { projectForPath } from '../../content/projects'
import { prefetchRoute, routeChunks } from '../../routes'

/**
 * Getting a destination ready ahead of the click (hover, focus, touch start): the route's code and its opening media,
 * fetched and decoded, so the page change (pageChange.ts) starts at once and the new page's pictures are already there
 * as its pieces fly in.
 */

interface Warm {
  /** Kept so a detached image is never collected mid-load. */
  images: HTMLImageElement[]
  /** The opening media (projects.ts `hero`, or TRANSITION.openingMedia), decoded. */
  opening: Promise<void>
}

const warmed = new Map<string, Warm>()

/**
 * Fetches and decodes an image exactly as the page's ResponsiveImage will (a detached <picture> with the same AVIF/WebP
 * sources, fallback and `sizes`, so the browser picks the same file for this viewport). Unlike a <link rel="preload">,
 * it does not warn when nobody clicks.
 */
function warmImage(image: ImageId, sizes: string): { img: HTMLImageElement; ready: Promise<void> } {
  const asset = getImage(image)
  const picture = document.createElement('picture')
  for (const format of ['avif', 'webp'] as const) {
    const source = document.createElement('source')
    source.type = `image/${format}`
    source.srcset = srcSet(asset, format)
    source.sizes = sizes
    picture.appendChild(source)
  }
  // Inside the <picture> before any attribute is set, so only the chosen source is requested.
  const img = document.createElement('img')
  picture.appendChild(img)
  img.decoding = 'async'
  img.sizes = sizes
  img.srcset = srcSet(asset, asset.fallback)
  img.src = fallbackSrc(asset)
  return { img, ready: img.decode().catch(() => {}) }
}

/** Prepares a destination: its code and its opening media. Idempotent. */
export function warmProject(path: string) {
  prefetchRoute(path)
  if (warmed.has(path)) return
  const opening = TRANSITION.openingMedia[path] ?? projectForPath(path)?.hero ?? []
  const openings = opening.map(({ image, sizes }) => warmImage(image, sizes))
  warmed.set(path, { images: openings.map((w) => w.img), opening: Promise.all(openings.map((w) => w.ready)).then(() => {}) })
}

/** Resolves when the destination's opening media have decoded (or at once when nothing was warmed). */
export const openingReady = (path: string): Promise<void> => warmed.get(path)?.opening ?? Promise.resolve()

/** The route's code; resolves false when it failed to load (RouteError then handles it after navigating). */
export function loadChunk(path: string): Promise<boolean> {
  const load = (routeChunks as Record<string, (() => Promise<unknown>) | undefined>)[path]
  if (!load) return Promise.resolve(true)
  return load().then(
    () => true,
    () => false,
  )
}

/** A plain left click: modified and middle clicks stay native (a new tab or window). */
export const isPlainClick = (e: MouseEvent) => !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
