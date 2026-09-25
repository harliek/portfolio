import { AboutContent } from '../components/about/AboutContent'
import { accentVars } from '../content/accents'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * /about: the dedicated About page, opened from the carousel's About Me
 * object and the header's About link. Its accent is About's lavender
 * (link and focus states, the creative cards' edges, the pointer's light).
 */
export default function About() {
  usePageMeta('About', 'About Harlie Katz, with education, creative work, and a short film.')
  return (
    <article className="page-about" style={accentVars('about')}>
      <AboutContent />
    </article>
  )
}
