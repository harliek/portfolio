import { AboutContent } from '../components/about/AboutContent'
import { ABOUT } from '../content/pages/about'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * /about: the dedicated About page, opened from the carousel's About Me object and the header's About link.
 *
 * It no longer sets About's lavender accent (--accent): the page's links, focus edges and the "Watch on YouTube"
 * hover use the site's one blue violet, the statement colour (tokens.css; Harlie's standing rule, blue violet only,
 * 2026-09-28 polish pass).
 */
export default function About() {
  usePageMeta('About', ABOUT.description)
  return (
    <article className="page-about">
      <AboutContent />
    </article>
  )
}

