import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Film = {
  id: string;
  title: string;
  videoSrc?: string;
  duration: string;
  description?: string;
  thumbnail: string;
};

export function FilmsPage() {
  const featuredFilm: Film = {
    id: "featured",
    title: "An Artistic End",
    videoSrc: "/AAE.mp4",
    duration: "Independent Short Film",
    description:
      "An experimental short exploring the ephemeral nature of recollection through slow cinema and contemplative imagery.",
    thumbnail: "/artistic.jpg",
  };

  const films: Film[] = [
    {
      id: "film-2",
      title: "Fragments",
      duration: "8:12",
      description: "A visual meditation on urban isolation and fleeting connections.",
      thumbnail:
        "https://images.unsplash.com/photo-1643926502904-3ef4554bf53b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      // videoSrc: "/films/fragments.mp4",
    },
    {
      id: "film-3",
      title: "Still Life in Motion",
      duration: "15:47",
      description: "An exploration of time through static compositions that breathe.",
      thumbnail:
        "https://images.unsplash.com/photo-1765029582791-7daa2b796431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      // videoSrc: "/films/still-life.mp4",
    },
  ];

  const [activeFilm, setActiveFilm] = useState<Film | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveFilm(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filmLetters = "Film".split("");

  return (
    <div className="min-h-screen py-16 px-12 relative z-10">
      <div className="max-w-[1100px] mx-auto">
        {/* PAGE TITLE */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="editorial-heading text-6xl inline-flex gap-1">
            {filmLetters.map((letter, index) => (
              <motion.span
                key={index}
                whileHover={{ scale: 1.12, y: -6 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {letter}
              </motion.span>
            ))}
          </h1>
        </motion.div>

        {/* FEATURED FILM */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* VIDEO PREVIEW (slow hover zoom + play overlay + click fullscreen) */}
          <button
            type="button"
            onClick={() => setActiveFilm(featuredFilm)}
            className="block w-full text-left"
            aria-label={`Open ${featuredFilm.title} full screen`}
          >
            <motion.div
              className="aspect-[16/9] mb-8 overflow-hidden shadow-lg relative cursor-pointer group"
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              {/* The video scales slowly on hover */}
              <motion.video
                src={featuredFilm.videoSrc}
                poster={featuredFilm.thumbnail}
                controls={false}
                preload="metadata"
                playsInline
                className="w-full h-full object-cover"
                variants={{
                  rest: { scale: 1 },
                  hover: { scale: 1.06 },
                }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* soft darken on hover */}
              <motion.div
                className="absolute inset-0"
                variants={{
                  rest: { backgroundColor: "rgba(0,0,0,0)" },
                  hover: { backgroundColor: "rgba(0,0,0,0.18)" },
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Play button overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                variants={{
                  rest: { opacity: 0, scale: 0.96 },
                  hover: { opacity: 1, scale: 1 },
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-[74px] h-[74px] rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-xl">
                  <div
                    className="w-0 h-0"
                    style={{
                      borderTop: "10px solid transparent",
                      borderBottom: "10px solid transparent",
                      borderLeft: "16px solid rgba(0,0,0,0.78)",
                      marginLeft: "3px",
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </button>

          {/* WHITE INFO BOX */}
          <div className="max-w-[820px] mx-auto bg-white px-14 py-10 shadow-md">
            <h2 className="editorial-heading text-4xl mb-3 text-center">
              {featuredFilm.title}
            </h2>

            <div className="flex items-center justify-center small-caps text-xs text-[var(--accent-red)] tracking-[0.25em] mb-5">
              {featuredFilm.duration}
            </div>

            <p className="text-gray-700 leading-relaxed text-center max-w-[640px] mx-auto">
              {featuredFilm.description}
            </p>
          </div>
        </motion.div>

        {/* FILM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          {films.map((film, index) => (
            <motion.div
              key={film.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
            >
              <button
                type="button"
                onClick={() => setActiveFilm(film)}
                className="block w-full text-left"
                aria-label={`Open ${film.title} full screen`}
              >
                <div className="aspect-[16/9] mb-4 overflow-hidden shadow-md cursor-pointer group relative">
                  <motion.img
                    src={film.thumbnail}
                    alt={film.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              </button>

              <h3 className="editorial-heading text-xl mb-1 hover:text-[var(--accent-red)] transition-colors">
                {film.title}
              </h3>

              <div className="small-caps text-xs text-gray-600 mb-2">
                <span className="text-[var(--accent-red)]">{film.duration}</span>
              </div>

              {film.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {film.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN MODAL */}
      <AnimatePresence>
        {activeFilm && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveFilm(null)}
          >
            <motion.div
              className="w-full max-w-[1100px]"
              initial={{ scale: 0.98, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-black shadow-2xl overflow-hidden">
                {activeFilm.videoSrc ? (
                  <video
                    src={activeFilm.videoSrc}
                    poster={activeFilm.thumbnail}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[78vh] object-contain bg-black"
                  />
                ) : (
                  <img
                    src={activeFilm.thumbnail}
                    alt={activeFilm.title}
                    className="w-full h-auto max-h-[78vh] object-contain bg-black"
                  />
                )}
              </div>

              <div className="mt-3 text-center text-white">
                <div className="editorial-heading text-base">{activeFilm.title}</div>
                <div className="small-caps text-xs opacity-80 tracking-wider">
                  {activeFilm.duration}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
