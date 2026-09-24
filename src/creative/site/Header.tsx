import { Link, useLocation } from 'react-router-dom'

/*
  The original's one bar, restored.

  "Home" on the left, and inside a creative room the way back to the
  Creative hub beside it, named rather than "Back". On the right the three
  destinations of the original, mapped to this site: Professional is the
  professional homepage, About the professional About page.
*/

const NAV = [
  { label: 'Professional', to: '/', match: null },
  { label: 'Creative', to: '/creative', match: '/creative' },
  { label: 'About', to: '/about', match: '/about' },
] as const

export function Header() {
  const { pathname } = useLocation()
  const seg = pathname.split('/').filter(Boolean)
  const back = seg[0] === 'creative' && seg.length === 2 ? { to: '/creative', label: 'Creative work' } : null
  const here = (to: string | null) => to !== null && (pathname === to || pathname.startsWith(`${to}/`))

  return (
    <header className="hd" data-back={back ? '' : undefined}>
      <div className="hd-in">
        <span className="hd-left">
          <Link to="/" className="hd-link hd-home">
            Home
          </Link>
          {back && (
            <Link to={back.to} className="hd-back" aria-label={`Back to ${back.label}`}>
              <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true">
                <path d="M16 4.5H1M4.5 1L1 4.5 4.5 8" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span>{back.label}</span>
            </Link>
          )}
        </span>

        <nav className="hd-nav" aria-label="Main">
          {NAV.map((n) => {
            const on = here(n.match)
            return (
              <Link
                key={n.label}
                to={n.to}
                className="hd-link"
                data-on={on ? '' : undefined}
                aria-current={pathname === n.to ? 'page' : on ? 'true' : undefined}
              >
                {n.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
