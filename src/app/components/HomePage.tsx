import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

  if (isComingSoon) {
    return <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />;
  }

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
      {!loaded && <div className="absolute inset-0 bg-black z-20" />}

      <iframe
        src={embedSrc}
        title={label}
        className={`yt-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
        onLoad={() => setLoaded(true)}
      />

      <div className="absolute inset-0 z-10 bg-transparent pointer-events-auto" />
    </div>
  );
}

function HomeBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const fallbackYoutubeId = extractYouTubeId("https://youtu.be/zjcxYAodBFs");

  const fallbackSrc =
    `https://www.youtube-nocookie.com/embed/${fallbackYoutubeId}` +
    `?autoplay=1` +
    `&mute=1` +
    `&loop=1` +
    `&playlist=${fallbackYoutubeId}` +
    `&controls=0` +
    `&modestbranding=1` +
    `&rel=0` +
    `&playsinline=1` +
    `&fs=0` +
    `&disablekb=1` +
    `&iv_load_policy=3`;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {videoFailed && (
        <iframe
          src={fallbackSrc}
          title="Portfolio background"
          className="yt-bg-cover"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
        />
      )}

      <video
        className={`absolute inset-0 w-full h-full object-cover scale-[1.2] transition-opacity duration-700 ${
          videoLoaded && !videoFailed ? "opacity-100" : "opacity-0"
        }`}
        src="/home-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setVideoLoaded(true)}
        onCanPlay={() => setVideoLoaded(true)}
        onError={() => setVideoFailed(true)}
      />

      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
    </div>
  );
}

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

  const navigationTiles: NavTile[] = [
    { id: "film", label: "Film", youtubeId: "4R6ptmrdATk", path: "/films" },
    { id: "art", label: "Art", youtubeId: "F6OdhvQRKAc", path: "/art" },
    { id: "design", label: "Design", path: "/designs", isComingSoon: true },
  ];

  const titleLetters = useMemo(() => "PORTFOLIO".split(""), []);

  return (
    <div className="relative min-h-screen text-white">
      <HomeBackground />

      <div className="relative z-10">
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
                      className="relative aspect-[4/5] rounded-2xl border border-white/20 bg-white/6 shadow-2xl cursor-pointer"
                      {...tileHover}
                      style={{ transformOrigin: "center" }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Go to ${item.label}`}
                      onKeyDown={(e) => {
                        if (item.path && (e.key === "Enter" || e.key === " ")) {
                          navigate(item.path);
                        }
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

            .yt-bg-cover {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 220%;
              height: 220%;
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