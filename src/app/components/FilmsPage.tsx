import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Film = {
  id: string;
  title: string;
  youtubeId?: string;
  localVideo?: string;
  description?: string;
  awards?: string[];
  customThumbSrc?: string;
  thumbFit?: "cover" | "contain";
  thumbZoom?: number;
  thumbY?: number;
};

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

function ytModalSrc(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&loop=0&controls=1&rel=0&modestbranding=1&playsinline=1`;
}

function BackgroundVideo() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <video
        className="absolute inset-0 w-full h-full object-cover scale-[1.2]"
        src="/blackback2.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />
    </div>
  );
}

function FilmThumb({
  youtubeId,
  customSrc,
  fit = "cover",
  zoom = 1.35,
  y = 0,
}: {
  youtubeId?: string;
  customSrc?: string;
  fit?: "cover" | "contain";
  zoom?: number;
  y?: number;
}) {
  const src = customSrc ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  return (
    <motion.div className="w-full h-full" whileHover={{ scale: 1.05 }} transition={{ duration: 0.6 }}>
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
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    const prevBodyMargin = body.style.margin;
    const prevOverscroll = body.style.overscrollBehaviorY;

    html.style.backgroundColor = "transparent";
    body.style.backgroundColor = "transparent";
    body.style.margin = "0";
    body.style.overscrollBehaviorY = "none";

    return () => {
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
      body.style.margin = prevBodyMargin;
      body.style.overscrollBehaviorY = prevOverscroll;
    };
  }, []);

  const narrativeExperimental: Film[] = [
    {
      id: "1",
      title: "An Artistic End",
      youtubeId: extractYouTubeId("https://youtu.be/a2Vm1LFB_68"),
      description:
        "Writer, director, cinematographer, and editor of an experimental short exploring self-objectification, artistic identity, and existential isolation.",
      awards: ["All American Film Festival", "Jewish Film Festival"],
      customThumbSrc: "art.jpg",
      thumbZoom: 1,
    },
    {
      id: "2",
      title: "Before I Wilt",
      youtubeId: extractYouTubeId("https://youtu.be/vTHlWiKE-Pk"),
      description:
        "Director, cinematographer, and editor of a narrative short examining mortality, impermanence, and the acceptance of time.",
      customThumbSrc: "wilt.jpg",
      thumbZoom: 1,
    },
    {
      id: "3",
      title: "Velvet is Her Blood",
      youtubeId: extractYouTubeId("https://youtu.be/Rp-lu6UEQoY"),
      description:
        "Assistant editor on an experimental short following a detective and a seductive serial killer.",
      customThumbSrc: "blood.png",
      thumbZoom: 1,
    },
    {
      id: "4",
      title: "My World",
      youtubeId: extractYouTubeId("https://youtu.be/MWRcrSRHsbQ"),
      description:
        "Writer, director, and editor of a narrative short exploring grief, memory, and enduring love. Dedicated to Leonard Goldenberg.",
      customThumbSrc: "world.png",
      thumbZoom: 1.2,
      thumbY: 16,
    },
    {
      id: "5",
      title: "Alex",
      youtubeId: extractYouTubeId("https://youtu.be/mWz0WUNkB-E"),
      description:
        "Writer, director, and cinematographer of a narrative short examining sexuality, vulnerability, and fear of rejection.",
      awards: ["Younger Directors' Film Festival"],
      customThumbSrc: "shana.png",
      thumbZoom: 1.2,
      thumbY: 16,
    },
  ];

  const professionalWork: Film[] = [
    {
      id: "6",
      title: "Aristocracy",
      localVideo: "/Aristocracy.mp4",
      description:
        "On-set production and behind-the-scenes content for Aristocracy’s Manchester store launch campaign with SHIFT.",
      customThumbSrc: "aristo.jpg",
      thumbZoom: 1,
    },
    {
      id: "7",
      title: "Heck X Gymshark",
      youtubeId: extractYouTubeId("https://youtu.be/1zFdBhnlXpc"),
      description:
        "Videographer and production assistant for The Night Club Global Tour, sponsored by Gymshark and Heck Food.",
      customThumbSrc: "heck.png",
      thumbZoom: 1,
    },
    {
      id: "8",
      title: "Relay for Life",
      youtubeId: extractYouTubeId("https://youtu.be/jFiozBBbywc"),
      description:
        "Interviewed cancer survivors and produced an inspirational video to promote Relay for Life, raising funds for the American Cancer Society.",
      customThumbSrc: "hope.png",
      thumbZoom: 1,
    },
    {
      id: "9",
      title: "First Edition",
      youtubeId: extractYouTubeId("https://youtu.be/W4bSTrXk25A"),
      description:
        "Director and editor of a documentary client project on the world’s first solar-electric catamaran.",
      customThumbSrc: "peter.png",
      thumbZoom: 1.1,
    },
  ];

  const [activeFilm, setActiveFilm] = useState<Film | null>(null);
  const pageTitle = useMemo(() => "Short Films".split(""), []);

  const FilmGrid = ({ films, sectionLabel }: { films: Film[]; sectionLabel: string }) => (
    <section className="pt-8 pb-12">
      <div className="max-w-[1180px] mx-auto px-10 md:px-14">
        <div className="max-w-[980px] mx-auto">
          <div className="flex items-center gap-5 mb-6 group">
            <div className="h-[1px] w-14 bg-white/70" />
            <div className="text-[13px] tracking-[0.55em] uppercase text-white/85 group-hover:text-red-600 transition-colors duration-500">
              {sectionLabel}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
            {films.map((film) => (
              <motion.article
                key={film.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55 }}
                className="rounded-2xl border border-white/14 bg-white/5 overflow-hidden"
              >
                <button onClick={() => setActiveFilm(film)} className="group block w-full text-left">
                  <div className="aspect-[16/11] w-full overflow-hidden bg-black">
                    <FilmThumb
                      youtubeId={film.youtubeId}
                      customSrc={film.customThumbSrc}
                      fit={film.thumbFit ?? "cover"}
                      zoom={film.thumbZoom ?? 1.35}
                      y={film.thumbY ?? 0}
                    />
                  </div>

                  <div className="px-6 pt-5 pb-6">
                    <h3 className="editorial-heading text-xl mb-2 text-white group-hover:text-red-600 transition-colors duration-500">
                      {film.title}
                    </h3>

                    <p className="text-sm text-white/75 leading-relaxed group-hover:text-red-600 transition-colors duration-500">
                      {film.description}
                    </p>

                    {film.awards && (
                      <p className="mt-3 text-[11px] font-bold text-white/80 group-hover:text-red-600 transition-colors duration-500">
                        {film.awards.map((a) => `•${a}`).join(" ")}
                      </p>
                    )}
                  </div>
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-[100dvh] text-white relative bg-transparent">
      <BackgroundVideo />

      <section className="pt-12 pb-4">
        <div className="max-w-[1180px] mx-auto px-10 md:px-14">
          <div className="max-w-[980px] mx-auto">
            <div className="mb-5">
              <div className="text-[12px] tracking-[0.5em] uppercase text-white/80 hover:text-red-600 transition-colors duration-500">
                Harlie Katz
              </div>
            </div>

            <h1 className="editorial-heading text-[clamp(44px,5vw,64px)] leading-none hover:text-red-600 transition-colors duration-500">
              {pageTitle.map((letter, i) => (
                <motion.span key={i} className="inline-block">
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </h1>
          </div>
        </div>
      </section>

      <FilmGrid films={narrativeExperimental} sectionLabel="Narrative & Experimental" />
      <FilmGrid films={professionalWork} sectionLabel="Professional Work" />

      <AnimatePresence>
        {activeFilm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center px-5"
            onClick={() => setActiveFilm(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-[1100px]"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 16, scale: 0.985 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 16, scale: 0.985 }}
              transition={{ duration: 0.18 }}
            >
              {activeFilm.localVideo ? (
                <video
                  src={activeFilm.localVideo}
                  controls
                  autoPlay
                  playsInline
                  className="w-full aspect-video bg-black"
                />
              ) : (
                <iframe
                  src={ytModalSrc(activeFilm.youtubeId!)}
                  title={activeFilm.title}
                  className="w-full aspect-video"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}

              <div className="mt-3 text-center editorial-heading text-sm text-white/90 hover:text-red-600 transition-colors duration-500">
                {activeFilm.title}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}