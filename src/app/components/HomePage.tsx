import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type NavTile = {
  id: string;
  label: string;
  path: string;
  youtubeId?: string; // YouTube video ID (not full URL)
  fallbackImg: string; // only used when there is NO video (ex: Design for now)
};

function NavMediaTile({
  label,
  youtubeId,
  fallbackImg,
}: {
  label: string;
  youtubeId?: string;
  fallbackImg: string;
}) {
  const [ready, setReady] = useState(false);

  // If no YouTube video provided, show the actual image (Design tile for now).
  if (!youtubeId) {
    return (
      <img
        src={fallbackImg}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
    );
  }

  // Autoplay + muted + loop + minimal UI.
  // Loop requires playlist=<videoId>
  const embedSrc =
    `https://www.youtube.com/embed/${youtubeId}` +
    `?autoplay=1` +
    `&mute=1` +
    `&loop=1` +
    `&playlist=${youtubeId}` +
    `&controls=0` +
    `&modestbranding=1` +
    `&rel=0` +
    `&playsinline=1` +
    `&fs=0` +
    `&disablekb=1` +
    `&iv_load_policy=3`;

  // If load event is delayed, we still fade in after a short moment.
  // (Avoids staying “blank” forever if the browser doesn’t fire onLoad reliably.)
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* IMPORTANT: no fallback image while loading (prevents “background photo flash”).
          Instead, show a neutral dark poster so it feels intentional. */}
      <div
        className={`absolute inset-0 tile-poster transition-opacity duration-500 ${
          ready ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      />

      <iframe
        src={embedSrc}
        title={label}
        className={`yt-cover pointer-events-none transition-opacity duration-700 ${
          ready ? "opacity-100" : "opacity-0"
        }`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setReady(true)}
      />
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();

  // You said Film/Art were switched, so:
  // Film gets 4R6ptmrdATk
  // Art gets F6OdhvQRKAc
  const navigationTiles: NavTile[] = [
    {
      id: "film",
      label: "Film",
      youtubeId: "4R6ptmrdATk",
      fallbackImg: "/back.png", // not used while video exists
      path: "/films",
    },
    {
      id: "art",
      label: "Art",
      youtubeId: "F6OdhvQRKAc",
      fallbackImg: "/back1.png", // not used while video exists
      path: "/art",
    },
    {
      id: "design",
      label: "Design",
      // no youtubeId yet
      fallbackImg: "/top.png",
      path: "/designs",
    },
  ];

  const portfolioLetters = "PORTFOLIO".split("");

  return (
    <div className="min-h-screen pt-8 pb-16 px-12 relative z-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="w-full flex justify-start">
          <div className="w-[860px] max-w-full ml-6">
            {/* TITLE */}
            <div className="text-center relative mt-6 mb-8">
              <div className="flex items-center justify-center gap-5 mb-2">
                <div className="w-14 h-[2px] bg-red-600" />
                <div className="text-[15px] tracking-[0.45em] uppercase text-gray-800">
                  Creative
                </div>
                <div className="w-14 h-[2px] bg-red-600" />
              </div>

              <h1 className="editorial-heading text-[clamp(64px,6vw,104px)] inline-flex justify-center gap-1 leading-none">
                {portfolioLetters.map((letter, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.1, y: -4 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </h1>

              <div className="signature-script text-[clamp(52px,4.2vw,84px)] text-red-600 -mt-7 italic">
                Harlie Katz
              </div>
            </div>

            {/* VIDEO NAVIGATION */}
            <div className="grid grid-cols-3 gap-[8px] mb-10">
              {navigationTiles.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.6 }}
                  className="group"
                >
                  <motion.div
                    onClick={() => navigate(item.path)}
                    className="nav-tile cursor-pointer relative overflow-hidden aspect-[4/5] shadow-xl bg-black"
                    whileHover={{ scale: 1.025 }}
                    transition={{ duration: 0.12 }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Go to ${item.label}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate(item.path);
                    }}
                  >
                    <NavMediaTile
                      label={item.label}
                      youtubeId={item.youtubeId}
                      fallbackImg={item.fallbackImg}
                    />

                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-colors duration-500 pointer-events-none" />

                    <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
                      <div className="font-semibold tracking-[0.28em] text-[clamp(15px,1.8vw,28px)] drop-shadow">
                        {item.label.toUpperCase()}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* CONTACT */}
            <div className="text-center">
              <div className="w-20 h-[2px] bg-red-600 mx-auto mb-5" />
              <div className="text-sm tracking-widest text-red-600 mb-4">
                CONTACT
              </div>

              <div className="flex flex-col gap-2 text-[14.5px] tracking-wide text-gray-800">
                <a
                  href="mailto:harliekatz@berkeley.edu"
                  className="hover:text-red-600 transition"
                >
                  harliekatz@berkeley.edu
                </a>
                <a
                  href="tel:+18137652936"
                  className="hover:text-red-600 transition"
                >
                  +1 (813) 765-2936
                </a>
              </div>
            </div>

            <style>{`
              .nav-tile {
                transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
                will-change: transform;
              }

              /*
                Neutral poster while YouTube loads:
                eliminates the “background image flashes in tiles” effect.
              */
              .tile-poster {
                background:
                  radial-gradient(circle at 35% 30%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 28%, rgba(0,0,0,0) 60%),
                  linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.96) 100%);
                filter: saturate(110%);
              }

              /*
                Harder “cover” crop (zoom in more) so there are no top/bottom bars.
                If you STILL see bars on a specific tile, bump 230% -> 250%.
              */
              .yt-cover {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 230%;
                height: 230%;
                transform: translate(-50%, -50%);
                border: 0;
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}
