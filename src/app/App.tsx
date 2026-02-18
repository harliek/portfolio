import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { AboutPage } from "./components/AboutPage";
import { ArtPage } from "./components/ArtPage";
import { FilmsPage } from "./components/FilmsPage";
import { DesignsPage } from "./components/DesignsPage";

/* ---------- Background Controller ---------- */
function Background() {
  const location = useLocation();

  const isHomeOrAbout = location.pathname === "/about";
  const backgroundImage = "/back.png"; // the photo you want for About (and Home)

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* base layer: photo on Home/About, black elsewhere */}
      {isHomeOrAbout ? (
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            transform: "translate3d(0,0,0)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black" />
      )}

      {/* grain */}
      <div className="grain-layer absolute inset-0 opacity-[0.06]" />

      {/* light leaks */}
      <div className="leak leak-a absolute -inset-[30%] opacity-[0.10]" />
      <div className="leak leak-b absolute -inset-[35%] opacity-[0.08]" />

      <style>{`
        .grain-layer {
          background-image:
            repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0.018) 0px,
              rgba(0,0,0,0.018) 1px,
              rgba(255,255,255,0.018) 2px,
              rgba(255,255,255,0.018) 3px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0,0,0,0.012) 0px,
              rgba(0,0,0,0.012) 1px,
              rgba(255,255,255,0.012) 2px,
              rgba(255,255,255,0.012) 3px
            );
          mix-blend-mode: multiply;
          filter: contrast(115%) brightness(103%);
          animation: grainDrift 22s linear infinite;
        }

        @keyframes grainDrift {
          0%   { transform: translate3d(0, 0, 0); }
          25%  { transform: translate3d(-10px, 8px, 0); }
          50%  { transform: translate3d(-18px, -12px, 0); }
          75%  { transform: translate3d(12px, -8px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        .leak {
          background:
            radial-gradient(
              circle at 30% 40%,
              rgba(239,68,68,0.20) 0%,
              rgba(239,68,68,0.10) 22%,
              rgba(255,255,255,0) 60%
            ),
            radial-gradient(
              circle at 70% 60%,
              rgba(255,150,120,0.14) 0%,
              rgba(255,150,120,0.08) 26%,
              rgba(255,255,255,0) 62%
            );
          mix-blend-mode: multiply;
          filter: blur(22px) saturate(115%);
        }

        .leak-a { animation: leakA 48s ease-in-out infinite; }
        .leak-b { animation: leakB 64s ease-in-out infinite; }

        @keyframes leakA {
          0%   { transform: translate3d(-6%, -3%, 0) scale(1.05); opacity: 0.06; }
          50%  { transform: translate3d(6%, 5%, 0) scale(1.12); opacity: 0.10; }
          100% { transform: translate3d(-6%, -3%, 0) scale(1.05); opacity: 0.06; }
        }

        @keyframes leakB {
          0%   { transform: translate3d(7%, 6%, 0) scale(1.08); opacity: 0.05; }
          50%  { transform: translate3d(-6%, -5%, 0) scale(1.10); opacity: 0.09; }
          100% { transform: translate3d(7%, 6%, 0) scale(1.08); opacity: 0.05; }
        }

        @media (prefers-reduced-motion: reduce) {
          .grain-layer, .leak-a, .leak-b { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  return (
    <Router>
      <Background />

      <div className="relative z-10 min-h-screen">
        <Header />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/art" element={<ArtPage />} />
          <Route path="/films" element={<FilmsPage />} />
          <Route path="/designs" element={<DesignsPage />} />
        </Routes>
      </div>
    </Router>
  );
}
