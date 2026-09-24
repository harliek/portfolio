import '../../styles/creative.css'
import { Link, useLocation } from 'react-router-dom'
import { prefetchRoute } from '../../routes'

const ITEMS = [
  { to: '/art', label: 'Drawings' },
  { to: '/film', label: 'Films' },
] as const

/** Internal navigation of the art portfolio (Drawings ↔ Films), with a way back to About. */
export function CreativeNav() {
  const { pathname } = useLocation()
  return (
    <nav className="creative-nav" aria-label="Art portfolio">
      <Link to="/about" className="creative-nav__back">
        <span aria-hidden="true">←</span> About
      </Link>
      <ul className="creative-nav__list" role="list">
        {ITEMS.map((item) => {
          const current = pathname === item.to
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="creative-nav__link"
                aria-current={current ? 'page' : undefined}
                onPointerEnter={() => prefetchRoute(item.to)}
                onFocus={() => prefetchRoute(item.to)}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
