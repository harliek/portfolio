/* =========================
   DesignsPage.tsx
   ========================= */
   import { useMemo, useState } from "react";
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
   
   function ytLoopSrc(id: string) {
     return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3`;
   }
   
   function ytBgSrc(id: string) {
     return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${id}&disablekb=1&fs=0&iv_load_policy=3`;
   }
   
   /* -------------------------
      Background (matches Art/Film)
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
   
   const BG_YT_ID = extractYouTubeId("29XFRArgneA");
   const SHIFT_VIDEO_ID = extractYouTubeId("https://youtu.be/u2pAlfdXQUY");
   
   export function DesignsPage() {
     const pageTitle = useMemo(() => "DESIGN".split(""), []);
   
     return (
       <div className="min-h-[100dvh] text-white relative bg-transparent">
         <BackgroundYouTube youtubeId={BG_YT_ID} />
   
         {/* Header */}
         <section className="pt-12 pb-6">
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
                     {letter}
                   </motion.span>
                 ))}
               </h1>
             </div>
           </div>
         </section>
   
         <section className="pt-10 pb-20">
  <div className="max-w-[1400px] mx-auto px-10 md:px-14">
    <div className="max-w-[820px] mx-auto"> {/* narrower container */}

      <a
        href="https://www.shiftcontent.co.uk"
        target="_blank"
        rel="noreferrer"
        className="group block rounded-2xl border border-white/14 bg-white/5 overflow-hidden"
      >
        <div className="relative aspect-[1.15/1] overflow-hidden"> {/* more square */}

          <iframe
            src={ytLoopSrc(SHIFT_VIDEO_ID)}
            title="Shift Content Website Preview"
            className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
            allow="autoplay; encrypted-media; picture-in-picture"
          />

          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-700" />
        </div>

        <div className="px-8 pt-7 pb-8">
  <div className="max-w-[520px] mx-auto text-center">  {/* narrower text */}

    <h3 className="editorial-heading text-3xl text-white group-hover:text-red-600 transition-colors duration-500">
      Shift Content
    </h3>

    <p className="mt-4 text-sm text-white/75 leading-relaxed group-hover:text-red-600 transition-colors duration-500">
      Refined and elevated the Shift Content website through high-impact layout, hierarchy, and visual design enhancements.
    </p>

    <div className="mt-6 text-[11px] tracking-[0.35em] uppercase text-white/80 group-hover:text-red-600 transition-colors duration-500">
      Visit site →
    </div>

  </div>
</div>

      </a>

    </div>
  </div>
</section>

       </div>
     );
   }
   