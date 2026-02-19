import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/* -------------------------------------------------------
   Shared helpers
-------------------------------------------------------- */

function extractYouTubeId(urlOrId: string): string {
  try {
    if (!urlOrId.includes("http")) return urlOrId.trim();
    const u = new URL(urlOrId);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "").trim();
    if (u.hostname.includes("youtube.com")) return (u.searchParams.get("v") || "").trim();
    return urlOrId.trim();
  } catch {
    return urlOrId.trim();
  }
}

function ytHeroSrc(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1`;
}

/* -------------------------------------------------------
   HOME PAGE
-------------------------------------------------------- */

type NavTile = {
  id: string;
  label: string;
  path?: string;
  youtubeId?: string;
  isComingSoon?: boolean;
};

function NavMediaTile({
  label,
  youtubeId,
  isComingSoon,
}: {
  label: string;
  youtubeId?: string;
  isComingSoon?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  // If you ever want a "coming soon" overlay again:
  if (isComingSoon) {
    return <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />;
  }

  // If no youtubeId is provided, just show a tasteful glass layer (no video)
  if (!youtubeId) {
    return <div className="absolute inset-0 bg-white/8 backdrop-blur-[1px]" />;
  }

  const embedSrc =
    `https://www.youtube-nocookie.com/embed/${youtubeId}` +
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

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {!loaded && <div className="absolute inset-0 bg-black z-10" />}

      <iframe
        src={embedSrc}
        title={label}
        className={`yt-cover pointer-events-none transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

/**
 * UPDATED HOME BACKGROUND:
 * https://youtu.be/zjcxYAodBFs
 */
const HOME_BG_YT_ID = extractYouTubeId("https://youtu.be/zjcxYAodBFs");

/**
 * Hover behavior (medium-big, slightly slow)
 * Applies to ALL tiles including "Design"
 */
const tileHover = {
  whileHover: { scale: 1.14, y: -8 },
  transition: {
    type: "spring" as const,
    stiffness: 120,
    damping: 18,
    mass: 1.15,
  },
};

const tileTitleHover = {
  whileHover: { scale: 1.45, y: -5 },
  transition: {
    type: "spring" as const,
    stiffness: 150,
    damping: 18,
    mass: 1.05,
  },
};

export function HomePage() {
  const navigate = useNavigate();
  const [bgLoaded, setBgLoaded] = useState(false);

  const navigationTiles: NavTile[] = [
    { id: "film", label: "Film", youtubeId: "4R6ptmrdATk", path: "/films" },
    { id: "art", label: "Art", youtubeId: "F6OdhvQRKAc", path: "/art" },
    { id: "design", label: "Design", path: "/designs" }, // ✅ now navigates
  ];

  const titleLetters = useMemo(() => "PORTFOLIO".split(""), []);

  return (
    <div className="relative min-h-screen text-white">
      {/* HERO BACKGROUND (no spinner flash) */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
        {!bgLoaded && <div className="absolute inset-0 bg-black z-10" />}

        <div className="absolute inset-0 scale-[1.2]">
          <iframe
            src={ytHeroSrc(HOME_BG_YT_ID)}
            className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500 ${
              bgLoaded ? "opacity-100" : "opacity-0"
            }`}
            allow="autoplay; encrypted-media; picture-in-picture"
            title="Home Background"
            onLoad={() => setBgLoaded(true)}
          />
        </div>
      </div>

      <div className="relative z-10">
        {/* hero height reduced so tiles sit higher */}
        <section className="relative h-[84vh] w-full">
          <div className="absolute left-[8%] top-[40%] -translate-y-1/2 max-w-[820px]">
            <div className="flex items-center gap-5 mb-6">
              <div className="h-[1px] w-14 bg-white/70" />
              <div className="text-[12px] tracking-[0.5em] uppercase text-white/85">
                HARLIE KATZ
              </div>
            </div>

            <h1 className="editorial-heading text-[clamp(64px,8.8vw,126px)] leading-none">
              {titleLetters.map((letter, i) => (
                <motion.span
                  key={i}
                  whileHover={{ y: -6, scale: 1.06 }}
                  transition={{ duration: 0.18 }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </h1>
          </div>
        </section>

        <section className="relative pb-24">
          <div className="h-4" />

          <div className="max-w-[1180px] mx-auto px-10 md:px-14">
            <div className="max-w-[980px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {navigationTiles.map((item) => (
                  <motion.div
                    key={item.id}
                    className="relative"
                    style={{ zIndex: 0 }}
                    whileHover={{ zIndex: 50 }}
                  >
                    <motion.div
                      onClick={() => item.path && navigate(item.path)}
                      className={[
                        "relative aspect-[4/5] rounded-2xl",
                        "border border-white/20 bg-white/6 shadow-2xl cursor-pointer",
                      ].join(" ")}
                      {...tileHover}
                      style={{ transformOrigin: "center" }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Go to ${item.label}`}
                      onKeyDown={(e) => {
                        if (item.path && (e.key === "Enter" || e.key === " ")) navigate(item.path);
                      }}
                    >
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <NavMediaTile
                          label={item.label}
                          youtubeId={item.youtubeId}
                          isComingSoon={item.isComingSoon}
                        />
                        <div className="absolute inset-0 tile-edge pointer-events-none" />
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <motion.div
                          className="font-semibold tracking-[0.28em] text-[clamp(16px,1.8vw,26px)] text-white origin-center will-change-transform"
                          initial={false}
                          {...tileTitleHover}
                        >
                          {item.label.toUpperCase()}
                        </motion.div>

                        {item.isComingSoon && (
                          <div className="mt-2 text-[11px] tracking-[0.35em] text-white/80">
                            COMING SOON
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            .yt-cover {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 230%;
              height: 230%;
              transform: translate(-50%, -50%);
              border: 0;
            }

            .tile-edge {
              background:
                radial-gradient(ellipse at center, rgba(255,255,255,0.00) 0%, rgba(0,0,0,0.14) 92%);
              opacity: 0.9;
            }
          `}</style>
        </section>

        <div className="h-24" />
      </div>
    </div>
  );
}
