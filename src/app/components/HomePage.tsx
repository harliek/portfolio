import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

type NavTile = {
  id: string;
  label: string;
  path: string;
  videoSrc?: string;
  imageSrc?: string;
};

function NavMediaTile({
  videoSrc,
  imageSrc,
}: {
  videoSrc?: string;
  imageSrc?: string;
}) {
  if (videoSrc) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        <div className="pointer-events-none absolute inset-0 bg-black/10" />
      </div>
    );
  }

  if (imageSrc) {
    return (
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img
          src={imageSrc}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-black/20" />
      </div>
    );
  }

  return <div className="absolute inset-0 bg-white/8" />;
}

function HomeBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={`${import.meta.env.BASE_URL}home-bg.mp4`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      <div className="pointer-events-none absolute inset-0 bg-black/10" />
    </div>
  );
}

const tileHover = {
  whileHover: {
    scale: 1.14,
    y: -8,
  },
  transition: {
    type: "spring" as const,
    stiffness: 120,
    damping: 18,
    mass: 1.15,
  },
};

const tileTitleHover = {
  whileHover: {
    scale: 1.45,
    y: -5,
  },
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
    {
      id: "film",
      label: "Film",
      videoSrc: `${import.meta.env.BASE_URL}film-tile.mp4`,
      path: "/films",
    },
    {
      id: "about",
      label: "About Me",
      imageSrc: `${import.meta.env.BASE_URL}about-me.jpg`,
      path: "/about",
    },
    {
      id: "art",
      label: "Art",
      videoSrc: `${import.meta.env.BASE_URL}art-tile.mp4`,
      path: "/art",
    },
  ];

  const titleLetters = useMemo(() => "PORTFOLIO".split(""), []);

  return (
    <div className="relative min-h-screen text-white">
      <HomeBackground />

      <div className="relative z-10">
        <section className="relative h-[84vh] w-full">
          <div className="absolute left-[8%] top-[40%] max-w-[820px] -translate-y-1/2">
            <div className="mb-6 flex items-center gap-5">
              <div className="h-[1px] w-14 bg-white/70" />

              <div className="text-[12px] tracking-[0.5em] uppercase text-white/85">
                HARLIE KATZ
              </div>
            </div>

            <h1 className="editorial-heading text-[clamp(64px,8.8vw,126px)] leading-none">
              {titleLetters.map((letter, index) => (
                <motion.span
                  key={index}
                  whileHover={{
                    y: -6,
                    scale: 1.06,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
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

          <div className="mx-auto max-w-[1180px] px-10 md:px-14">
            <div className="mx-auto max-w-[980px]">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {navigationTiles.map((item) => (
                  <motion.div
                    key={item.id}
                    className="relative"
                    style={{ zIndex: 0 }}
                    whileHover={{ zIndex: 50 }}
                  >
                    <motion.div
                      onClick={() => navigate(item.path)}
                      className="relative aspect-[4/5] cursor-pointer rounded-2xl border border-white/20 bg-white/6 shadow-2xl"
                      {...tileHover}
                      style={{ transformOrigin: "center" }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Go to ${item.label}`}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          navigate(item.path);
                        }
                      }}
                    >
                      <div className="absolute inset-0 overflow-hidden rounded-2xl">
                        <NavMediaTile
                          videoSrc={item.videoSrc}
                          imageSrc={item.imageSrc}
                        />

                        <div className="tile-edge pointer-events-none absolute inset-0" />
                      </div>

                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
                        <motion.div
                          className="origin-center text-center text-[clamp(15px,1.7vw,24px)] font-semibold tracking-[0.25em] text-white will-change-transform"
                          initial={false}
                          {...tileTitleHover}
                        >
                          {item.label.toUpperCase()}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <style>{`
            .tile-edge {
              background: radial-gradient(
                ellipse at center,
                rgba(255, 255, 255, 0) 0%,
                rgba(0, 0, 0, 0.14) 92%
              );
              opacity: 0.9;
            }
          `}</style>
        </section>

        <div className="h-24" />
      </div>
    </div>
  );
}