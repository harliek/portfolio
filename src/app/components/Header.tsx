import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const navLinkBase =
    "small-caps text-sm tracking-wider transition-colors duration-500 hover:text-[var(--accent-red)]";

  return (
    <header
      className="float-header fixed top-0 left-0 right-0 z-[9999] py-5 px-8 bg-black/45 text-white backdrop-blur-md border-b border-white/10"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        {/* Left: Back Button */}
        <motion.button
          onClick={handleBack}
          className="flex items-center gap-2 small-caps text-sm tracking-wider text-white hover:text-[var(--accent-red)] transition-colors duration-500 group"
          whileHover={{ x: -3 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="group-hover:underline underline-offset-4">Back</span>
        </motion.button>

        {/* Right: Navigation */}
        <nav className="flex items-center gap-8">
          <Link
            to="/"
            className={`${navLinkBase} ${
              isActive("/") ? "text-[var(--accent-red)]" : "text-white"
            }`}
          >
            Home
          </Link>

          <Link
            to="/films"
            className={`${navLinkBase} ${
              isActive("/films") ? "text-[var(--accent-red)]" : "text-white"
            }`}
          >
            Film
          </Link>

          <Link
            to="/art"
            className={`${navLinkBase} ${
              isActive("/art") ? "text-[var(--accent-red)]" : "text-white"
            }`}
          >
            Art
          </Link>

          <Link
            to="/designs"
            className={`${navLinkBase} ${
              isActive("/designs") ? "text-[var(--accent-red)]" : "text-white"
            }`}
          >
            Design
          </Link>

          <Link
            to="/about"
            className={`${navLinkBase} ${
              isActive("/about") ? "text-[var(--accent-red)]" : "text-white"
            }`}
          >
            About Me
          </Link>
        </nav>
      </div>
    </header>
  );
}
