import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();

  const navLinkBase =
    "small-caps text-sm tracking-wider transition-colors duration-500 hover:text-[var(--accent-red)]";

  const linkClass = (path: string) =>
    `${navLinkBase} ${
      location.pathname === path
        ? "text-[var(--accent-red)]"
        : "text-white"
    }`;

  return (
    <header
      className="float-header fixed left-0 right-0 top-0 z-[9999] border-b border-white/10 px-8 py-5 text-white backdrop-blur-md"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
    >
      <div className="mx-auto flex max-w-[1800px] items-center justify-between">
        <Link to="/" className={linkClass("/")}>
          Home
        </Link>

        <nav className="flex items-center gap-8">
          <Link to="/films" className={linkClass("/films")}>
            Film
          </Link>

          <Link to="/art" className={linkClass("/art")}>
            Art
          </Link>

          <Link to="/designs" className={linkClass("/designs")}>
            About Me
          </Link>
        </nav>
      </div>
    </header>
  );
}