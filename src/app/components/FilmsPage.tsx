/* =========================
   FilmsPage.tsx
   ========================= */
   import { useMemo, useState, useEffect } from "react";
   import { motion, AnimatePresence } from "framer-motion";
   
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
   
   const THUMB_ASPECT = "26/9";
   const BG_YT_ID = "29XFRArgneA";
   
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
   
   function ytBgSrc(id: string) {
     return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${id}&disablekb=1&fs=0&iv_load_policy=3`;
   }
   
   /* -------------------------
      Background (no spinner flash)
   -------------------------- */
   function BackgroundYouTube({ youtubeId }: { youtubeId: string }) {
     const [loaded, setLoaded] = useState(false);
   
     return (
       <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
         {!loaded && <div className="absolute inset-0 bg-black z-10" />}
   
         <div className="absolute inset-0">
           <div className="absolute left-1/2 top-1/2 w-[120vw] h-[67.5vw] min-w-[177.78vh] min-h-[100vh] -translate-x-1/2 -translate-y-1/2">
             <iframe
               src={ytBgSrc(youtubeId)}
               title="Background video"
               className={`w-full h-full pointer-events-none transition-opacity duration-500 ${
                 loaded ? "opacity-100" : "opacity-0"
               }`}
               allow="autoplay; encrypted-media; picture-in-picture"
               referrerPolicy="strict-origin-when-cross-origin"
               onLoad={() => setLoaded(true)}
             />
           </div>
         </div>
       </div>
     );
   }
   
   function YouTubeThumb({
     youtubeId,
     fit = "cover",
     zoom = 1.35,
     y = 0,
   }: {
     youtubeId: string;
     fit?: "cover" | "contain";
     zoom?: number;
     y?: number;
   }) {
     const src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
   
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
         thumbZoom: 1.38,
       },
       {
         id: "2",
         title: "Before I Wilt",
         youtubeId: extractYouTubeId("https://youtu.be/vTHlWiKE-Pk"),
         description:
           "Director, cinematographer, and editor of a narrative short examining mortality, impermanence, and the acceptance of time.",
         thumbZoom: 1.35,
       },
       {
         id: "3",
         title: "Velvet is Her Blood",
         youtubeId: extractYouTubeId("https://youtu.be/Rp-lu6UEQoY"),
         description:
           "Assistant editor on an experimental short following a detective and a seductive serial killer.",
         thumbZoom: 1.35,
       },
       {
         id: "4",
         title: "My World",
         youtubeId: extractYouTubeId("https://youtu.be/MWRcrSRHsbQ"),
         description:
           "Writer, director, and editor of a narrative short exploring grief, memory, and enduring love. Dedicated to Leonard Goldenberg.",
         thumbZoom: 1.35,
         thumbY: 16, // ↓ move image DOWN so title at top is visible
       },
       {
         id: "5",
         title: "Alex",
         youtubeId: extractYouTubeId("https://youtu.be/mWz0WUNkB-E"),
         description:
           "Writer, director, and cinematographer of a narrative short examining sexuality, vulnerability, and fear of rejection.",
         awards: ["Younger Directors' Film Festival"],
         thumbZoom: 1.35,
         thumbY: 16, // ↓ move image DOWN so title at top is visible
       },
     ];
   
     const professionalWork: Film[] = [
       {
         id: "6",
         title: "Heck X Gymshark",
         youtubeId: extractYouTubeId("https://youtu.be/1zFdBhnlXpc"),
         description:
           "Videographer and production assistant for The Night Club Global Tour, sponsored by Gymshark and Heck Food.",
         thumbZoom: 1.35,
       },
       {
         id: "7",
         title: "Relay for Life",
         youtubeId: extractYouTubeId("https://youtu.be/jFiozBBbywc"),
         description: "Director and interviewer for a documentary produced for the American Cancer Society.",
         thumbFit: "cover",
         thumbZoom: 1.35,
       },
       {
         id: "8",
         title: "First Edition",
         youtubeId: extractYouTubeId("https://youtu.be/W4bSTrXk25A"),
         description:
           "Director and editor of a documentary client project on the world’s first solar-electric catamaran.",
         thumbZoom: 1.35,
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
               <div className="text-[13px] tracking-[0.55em] uppercase text-white/85 group-hover:text-red-600 hover:text-red-600 transition-colors duration-500">
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
                     <div className={`aspect-[${THUMB_ASPECT}] overflow-hidden bg-transparent`}>
                       <YouTubeThumb
                         youtubeId={film.youtubeId}
                         fit={film.thumbFit ?? "cover"}
                         zoom={film.thumbZoom ?? 1.35}
                         y={film.thumbY ?? 0}
                       />
                     </div>
   
                     <div className="px-6 pt-5 pb-6">
                       <h3 className="editorial-heading text-xl mb-2 text-white group-hover:text-red-600 hover:text-red-600 transition-colors duration-500">
                         {film.title}
                       </h3>
   
                       <p className="text-sm text-white/75 leading-relaxed group-hover:text-red-600 hover:text-red-600 transition-colors duration-500">
                         {film.description}
                       </p>
   
                       {film.awards && (
                         <p className="mt-3 text-[11px] font-bold text-white/80 group-hover:text-red-600 hover:text-red-600 transition-colors duration-500">
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
         <BackgroundYouTube youtubeId={BG_YT_ID} />
   
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
                 <iframe
                   src={ytModalSrc(activeFilm.youtubeId)}
                   title={activeFilm.title}
                   className="w-full aspect-video"
                   allow="autoplay; encrypted-media; picture-in-picture"
                   allowFullScreen
                 />
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
   