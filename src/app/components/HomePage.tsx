import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function HomePage() {
  const navigate = useNavigate();

  const navigationVideos = [
    { id: "film", label: "Film", videoSrc: "/filmvid.mp4", path: "/films" },
    { id: "art", label: "Art", videoSrc: "/artvideo.mp4", path: "/art" },
    { id: "design", label: "Design", videoSrc: "/design-thumbnail.mp4", path: "/designs" },
  ];

  const portfolioLetters = "PORTFOLIO".split("");

  return (
    <div className="min-h-screen pt-8 pb-16 px-12 relative z-10">
      <div className="max-w-[1600px] mx-auto">
        {/* LEFT-SHIFTED GROUP */}
        <div className="w-full flex justify-start">
          {/* width defines alignment for title + tiles */}
          <div className="w-[860px] max-w-full ml-6">
            {/* TITLE */}
            <div className="text-center relative mt-6 mb-8">
              {/* CREATIVE */}
              <div className="flex items-center justify-center gap-5 mb-2">
                <div className="w-14 h-[2px] bg-red-600" />
                <div className="text-[15px] tracking-[0.45em] uppercase text-gray-800">
                  Creative
                </div>
                <div className="w-14 h-[2px] bg-red-600" />
              </div>

              {/* PORTFOLIO */}
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

              {/* NAME */}
              <div className="signature-script text-[clamp(52px,4.2vw,84px)] text-red-600 -mt-7 italic">
                Harlie Katz
              </div>
            </div>

            {/* VIDEO NAVIGATION (slightly smaller) */}
            <div className="grid grid-cols-3 gap-[8px] mb-10">
              {navigationVideos.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08, duration: 0.6 }}
                >
                  <motion.div
                    onClick={() => navigate(item.path)}
                    className="nav-tile cursor-pointer relative overflow-hidden aspect-[4/5] shadow-xl"
                    whileHover={{ scale: 1.025 }}
                    transition={{ duration: 0.12 }}
                  >
                    <video
                      src={item.videoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* OVERLAY TEXT */}
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black/10 pointer-events-none">
                      <div className="font-semibold tracking-[0.28em] text-[clamp(15px,1.8vw,28px)]">
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
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}
