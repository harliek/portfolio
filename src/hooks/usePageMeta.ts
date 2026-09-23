import { useEffect } from 'react'
import { SITE, pageTitle } from '../content/site'

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

/**
 * Updates the document title and description for client-side navigation.
 * Note: crawlers that do not run JavaScript only see index.html's defaults;
 * per-route social previews would need prerendering (see README).
 */
export function usePageMeta(title: string | undefined, description: string = SITE.description) {
  useEffect(() => {
    const full = pageTitle(title)
    document.title = full
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', full)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
  }, [title, description])
}
