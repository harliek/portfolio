import { Link } from 'react-router-dom'
import { SITE } from '../../content/site'

/* The original footer, with its links mapped to this site. */
export function Foot() {
  return (
    <footer className="ft lc-shell">
      <div className="ft-in">
        <p className="ft-name lc-serif">Harlie Katz</p>
        <nav className="ft-nav" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/">Professional</Link>
          <Link to="/creative">Creative</Link>
          <Link to="/about">About</Link>
          <a href={SITE.emailHref}>Email</a>
          <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </nav>
      </div>
      <p className="ft-fine">Reconstructions on this site are marked where they appear, and use synthetic data.</p>
    </footer>
  )
}
