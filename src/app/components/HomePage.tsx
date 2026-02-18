import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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

function ytModalSrc(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&loop=0&controls=1&rel=0&modestbranding=1&playsinline=1`;
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
  if (isComingSoon) {
    return <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />;
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
    <div className="absolute inset-0 overflow-hidden">
      {/* Removed poster/backdrop layer behind the video */}
      <iframe
        src={embedSrc}
        title={label}
        className="yt-cover pointer-events-none"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen={false}
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

  const navigationTiles: NavTile[] = [
    { id: "film", label: "Film", youtubeId: "4R6ptmrdATk", path: "/films" },
    { id: "art", label: "Art", youtubeId: "F6OdhvQRKAc", path: "/art" },
    { id: "design", label: "Design", isComingSoon: true },
  ];

  const titleLetters = useMemo(() => "PORTFOLIO".split(""), []);

  return (
    <div className="relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 scale-[1.2]">
          <iframe
            src={ytHeroSrc(HOME_BG_YT_ID)}
            className="absolute inset-0 w-full h-full pointer-events-none"
            allow="autoplay; encrypted-media; picture-in-picture"
            title="Home Background"
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
                        "border border-white/20 bg-white/6 shadow-2xl",
                        item.isComingSoon ? "cursor-default" : "cursor-pointer",
                      ].join(" ")}
                      {...tileHover}
                      style={{ transformOrigin: "center" }}
                      role="button"
                      tabIndex={item.isComingSoon ? -1 : 0}
                      aria-label={`Go to ${item.label}`}
                      onKeyDown={(e) => {
                        if (
                          !item.isComingSoon &&
                          item.path &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
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

/* -------------------------------------------------------
   FILMS PAGE
-------------------------------------------------------- */

type Film = {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
  awards?: string[];
  thumbFit?: "cover" | "contain";
  thumbZoom?: number;
  thumbY?: number;
};

const FILMS_HERO_YT_ID = "8rEWAHXr_6I";
const THUMB_ASPECT = "5/4";

function YouTubeThumb({
  youtubeId,
  fit = "cover",
  zoom = 1.16,
  y = 0,
}: {
  youtubeId: string;
  fit?: "cover" | "contain";
  zoom?: number;
  y?: number;
}) {
  const src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  return (
    <motion.div
      className="w-full h-full"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 140, damping: 20, mass: 1.0 }}
    >
      <img
        src={src}
        className={`w-full h-full ${fit === "cover" ? "object-cover" : "object-contain bg-black"}`}
        style={fit === "cover" ? { transform: `scale(${zoom}) translateY(${y}px)` } : undefined}
        draggable={false}
        alt=""
      />
    </motion.div>
  );
}

export function FilmsPage() {
  const narrativeExperimental: Film[] = [
    {
      id: "1",
      title: "An Artistic End",
      youtubeId: extractYouTubeId("https://youtu.be/a2Vm1LFB_68"),
      description:
        "Writer, director, cinematographer, and editor of an experimental short exploring self-objectification, artistic identity, and existential isolation.",
      awards: ["All American Film Festival", "Jewish Film Festival"],
      thumbZoom: 1.18,
    },
    {
      id: "2",
      title: "Before I Wilt",
      youtubeId: extractYouTubeId("https://youtu.be/vTHlWiKE-Pk"),
      description:
        "Director, cinematographer, and editor of a narrative short examining mortality, impermanence, and the acceptance of time.",
      thumbZoom: 1.16,
    },
    {
      id: "3",
      title: "Velvet is Her Blood",
      youtubeId: extractYouTubeId("https://youtu.be/Rp-lu6UEQoY"),
      description: "Assistant editor on an experimental short following a detective and a seductive serial killer.",
      thumbZoom: 1.16,
    },
    {
      id: "4",
      title: "My World",
      youtubeId: extractYouTubeId("https://youtu.be/MWRcrSRHsbQ"),
      description:
        "Writer, director, and editor of a narrative short exploring grief, memory, and enduring love. Dedicated to Leonard Goldenberg.",
      thumbZoom: 1.16,
    },
    {
      id: "5",
      title: "Alex",
      youtubeId: extractYouTubeId("https://youtu.be/mWz0WUNkB-E"),
      description:
        "Writer, director, and cinematographer of a narrative short examining sexuality, vulnerability, and fear of rejection.",
      awards: ["Younger Directors' Film Festival"],
      thumbZoom: 1.16,
    },
  ];

  const professionalWork: Film[] = [
    {
      id: "6",
      title: "Heck X Gymshark",
      youtubeId: extractYouTubeId("https://youtu.be/1zFdBhnlXpc"),
      description:
        "Videographer and production assistant for The Night Club Global Tour, sponsored by Gymshark and Heck Food.",
      thumbZoom: 1.16,
    },
    {
      id: "7",
      title: "Relay for Life",
      youtubeId: extractYouTubeId("https://youtu.be/jFiozBBbywc"),
      description: "Director and interviewer for a documentary produced for the American Cancer Society.",
      thumbFit: "cover",
      thumbZoom: 1.16,
    },
    {
      id: "8",
      title: "First Edition",
      youtubeId: extractYouTubeId("https://youtu.be/W4bSTrXk25A"),
      description:
        "Director and editor of a documentary client project on the world’s first solar-electric catamaran.",
      thumbZoom: 1.16,
    },
  ];

  const [activeFilm, setActiveFilm] = useState<Film | null>(null);
  const pageTitle = useMemo(() => "FILM".split(""), []);

  const cardHover = {
    whileHover: { scale: 1.08, y: -10 },
    transition: { type: "spring" as const, stiffness: 120, damping: 18, mass: 1.15 },
  };

  const FilmGrid = ({
    films,
    sectionLabel,
    overlap = false,
  }: {
    films: Film[];
    sectionLabel: string;
    overlap?: boolean;
  }) => (
    <section className={`relative bg-black ${overlap ? "-mt-28 pt-6" : "pt-6"} pb-20`}>
      <div className="max-w-[1180px] mx-auto px-10 md:px-14">
        <div className="max-w-[980px] mx-auto">
          <div className="flex items-center gap-5 mb-8">
            <div className="h-[1px] w-14 bg-white/70" />
            <div className="text-[14px] tracking-[0.55em] uppercase text-white/90">{sectionLabel}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
            {films.map((film) => (
              <motion.article
                key={film.id}
                className="relative"
                style={{ zIndex: 0 }}
                whileHover={{ zIndex: 50 }}
              >
                <motion.div
                  className="rounded-2xl border border-white/15 bg-white/5 overflow-hidden"
                  {...cardHover}
                >
                  <button onClick={() => setActiveFilm(film)} className="block w-full text-left">
                    <div className={`aspect-[${THUMB_ASPECT}] overflow-hidden bg-black`}>
                      <YouTubeThumb
                        youtubeId={film.youtubeId}
                        fit={film.thumbFit ?? "cover"}
                        zoom={film.thumbZoom ?? 1.16}
                        y={film.thumbY ?? 0}
                      />
                    </div>

                    <div className="px-6 pt-5 pb-6">
                      <motion.h3
                        className="editorial-heading text-xl mb-2 inline-block origin-left will-change-transform"
                        whileHover={{ scale: 1.35, y: -4 }}
                        transition={{ type: "spring", stiffness: 150, damping: 18, mass: 1.05 }}
                      >
                        {film.title}
                      </motion.h3>

                      <p className="text-sm text-white/75 leading-relaxed">{film.description}</p>

                      {film.awards && (
                        <p className="mt-3 text-[11px] font-bold text-white/85">
                          {film.awards.map((a) => `•${a}`).join(" ")}
                        </p>
                      )}
                    </div>
                  </button>
                </motion.div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="relative min-h-screen text-white">
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 scale-[1.2]">
          <iframe
            src={ytHeroSrc(FILMS_HERO_YT_ID)}
            className="absolute inset-0 w-full h-full pointer-events-none"
            allow="autoplay; encrypted-media; picture-in-picture"
            title="Films Hero"
          />
        </div>

        <div className="absolute left-[8%] top-[38%] -translate-y-1/2 z-10 max-w-[720px]">
          <div className="flex items-center gap-5 mb-6">
            <div className="h-[1px] w-14 bg-white/70" />
            <div className="text-[12px] tracking-[0.5em] uppercase text-white/85">Harlie Katz</div>
          </div>

          <motion.h1
            className="editorial-heading text-[clamp(96px,12vw,160px)] leading-none"
            whileHover={{ scale: 1.12 }}
            transition={{ type: "spring", stiffness: 160, damping: 18, mass: 1.0 }}
          >
            {pageTitle.map((letter, i) => (
              <motion.span key={i} className="inline-block">
                {letter}
              </motion.span>
            ))}
          </motion.h1>
        </div>
      </section>

      <FilmGrid films={narrativeExperimental} sectionLabel="Narrative & Experimental" overlap />
      <FilmGrid films={professionalWork} sectionLabel="Professional Work" />

      <AnimatePresence>
        {activeFilm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-5"
            onClick={() => setActiveFilm(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-[1100px]"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 18, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 18, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, mass: 1.0 }}
            >
              <iframe
                src={ytModalSrc(activeFilm.youtubeId)}
                title={activeFilm.title}
                className="w-full aspect-video"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
