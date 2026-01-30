import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Film = {
  id: string;
  title: string;
<<<<<<< HEAD
  youtubeId: string;
=======
  youtubeId?: string;
>>>>>>> 1cb55ac (Update film page layout and hero titles)
  description?: string;
  awards?: string[];
};

const HERO_YT_ID = "30uO6rqCjIw";

function extractYouTubeId(urlOrId: string): string {
  try {
    if (!urlOrId.includes("http")) return urlOrId.trim();
    const u = new URL(urlOrId);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "").trim();
<<<<<<< HEAD
    if (u.hostname.includes("youtube.com")) return (u.searchParams.get("v") || "").trim();
=======
    if (u.hostname.includes("youtube.com"))
      return (u.searchParams.get("v") || "").trim();
>>>>>>> 1cb55ac (Update film page layout and hero titles)
    return urlOrId.trim();
  } catch {
    return urlOrId.trim();
  }
}

function ytThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

function ytEmbedSrc(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1`;
}

export function FilmsPage() {
  const films: Film[] = useMemo(
    () => [
      {
        id: "film-1",
        title: "An Artistic End",
        youtubeId: extractYouTubeId("https://youtu.be/a2Vm1LFB_68"),
        description:
          "An experimental short reflecting on memory, time, and artistic becoming through contemplative imagery.",
        awards: ["All American Film Festival", "Jewish Film Festival"],
      },
      {
        id: "film-2",
        title: "Before I Wilt",
        youtubeId: extractYouTubeId("https://youtu.be/vTHlWiKE-Pk"),
        description:
          "A meditation on mortality and impermanence, learning to live within transience rather than resist it.",
      },
      {
        id: "film-3",
        title: "Velvet is Her Blood",
        youtubeId: extractYouTubeId("https://youtu.be/Rp-lu6UEQoY"),
        description:
          "A female detective and a femme fatale serial killer begin an unconventional flirtation as a trail of bodies unfolds.",
      },
    ],
    []
  );

  const [activeFilm, setActiveFilm] = useState<Film | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveFilm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pageTitle = "FILM".split("");

  return (
<<<<<<< HEAD
    <div className="relative min-h-screen text-white bg-black">
=======
    <div className="relative min-h-screen text-white">
>>>>>>> 1cb55ac (Update film page layout and hero titles)
      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 scale-[1.2]">
          <iframe
            src={ytEmbedSrc(HERO_YT_ID)}
            className="absolute inset-0 w-full h-full pointer-events-none"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen={false}
<<<<<<< HEAD
            title="Films Hero"
          />
        </div>

        {/* Title */}
=======
          />
        </div>

        {/* CINEMATIC TITLE — NO OVERLAY */}
>>>>>>> 1cb55ac (Update film page layout and hero titles)
        <div className="absolute left-[8%] top-[38%] -translate-y-1/2 z-10 max-w-[720px]">
          <div className="flex items-center gap-5 mb-6">
            <div className="h-[1px] w-14 bg-white/70" />
            <div className="text-[12px] tracking-[0.5em] uppercase text-white/85">
              Selected Work
            </div>
          </div>

          <h1 className="editorial-heading leading-[0.9] text-[clamp(96px,12vw,160px)]">
            {pageTitle.map((letter, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.04em]"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -8 }}
              >
                {letter}
              </motion.span>
            ))}
          </h1>

          <p className="mt-8 max-w-[420px] text-white/85 text-sm leading-relaxed">
<<<<<<< HEAD
            Narrative and experimental films exploring memory, identity, time, and impermanence.
          </p>
        </div>

        <div className="absolute inset-0 bg-black/20" />
      </section>

      {/* GRID */}
=======
            Narrative and experimental films exploring memory, identity, time,
            and impermanence.
          </p>
        </div>
      </section>

      {/* FILM GRID */}
>>>>>>> 1cb55ac (Update film page layout and hero titles)
      <section className="relative bg-black">
        <div className="max-w-[1180px] mx-auto px-10 md:px-14 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 max-w-[980px] mx-auto">
            {films.map((film, index) => (
              <motion.article
                key={film.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.7 }}
                className="rounded-2xl border border-white/15 bg-white/5 overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
              >
                <button
                  type="button"
                  onClick={() => setActiveFilm(film)}
                  className="relative block w-full text-left group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <motion.img
<<<<<<< HEAD
                      src={ytThumb(film.youtubeId)}
=======
                      src={ytThumb(film.youtubeId as string)}
>>>>>>> 1cb55ac (Update film page layout and hero titles)
                      alt={film.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.12 }}
<<<<<<< HEAD
                      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                      draggable={false}
                    />

                    <div className="absolute inset-0 bg-black/25 opacity-70 group-hover:opacity-40 transition-opacity" />

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="editorial-heading text-xl">{film.title}</div>
=======
                      transition={{
                        duration: 1.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="editorial-heading text-xl">
                        {film.title}
                      </div>
>>>>>>> 1cb55ac (Update film page layout and hero titles)
                    </div>
                  </div>

                  <div className="p-5">
<<<<<<< HEAD
                    {film.description && (
                      <p className="text-sm text-white/75 leading-relaxed">
                        {film.description}
                      </p>
                    )}

                    {film.awards && film.awards.length > 0 && (
=======
                    <p className="text-sm text-white/75 leading-relaxed">
                      {film.description}
                    </p>

                    {film.awards && (
>>>>>>> 1cb55ac (Update film page layout and hero titles)
                      <div className="mt-4 flex flex-wrap gap-2">
                        {film.awards.map((award, i) => (
                          <span
                            key={i}
                            className="text-[11px] uppercase tracking-wide px-3 py-1 rounded-full border border-white/25 text-white/85"
                          >
                            {award}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {activeFilm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveFilm(null)}
          >
            <motion.div
              className="w-full max-w-[1100px]"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rounded-2xl overflow-hidden bg-black">
                <iframe
                  src={ytEmbedSrc(activeFilm.youtubeId as string)}
                  title={activeFilm.title}
                  className="w-full aspect-video"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
