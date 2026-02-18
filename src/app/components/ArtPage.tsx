/* =========================
   ArtPage.tsx
   ========================= */
   import { useEffect, useMemo, useState } from "react";
   import { motion, AnimatePresence } from "framer-motion";
   
   type Artwork = {
     id: string;
     title: string;
     image: string;
   };
   
   const BG_YT_ID = "29XFRArgneA";
   
   function ytBgSrc(id: string) {
     return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&loop=1&playlist=${id}&disablekb=1&fs=0&iv_load_policy=3`;
   }
   
   function BackgroundYouTube({ youtubeId }: { youtubeId: string }) {
     return (
       <div className="fixed inset-0 -z-10 overflow-hidden">
         <div className="absolute inset-0">
           <div className="absolute left-1/2 top-1/2 w-[120vw] h-[67.5vw] min-w-[177.78vh] min-h-[100vh] -translate-x-1/2 -translate-y-1/2">
             <iframe
               src={ytBgSrc(youtubeId)}
               title="Background video"
               className="w-full h-full pointer-events-none"
               allow="autoplay; encrypted-media; picture-in-picture"
               referrerPolicy="strict-origin-when-cross-origin"
             />
           </div>
         </div>
       </div>
     );
   }
   
   export function ArtPage() {
     /* ------------------ COLLECTIONS ------------------ */
     const artOfAging = useMemo<Artwork[]>(
       () => [
         { id: "aging-1", title: "A Life, Beautifully Worn", image: "/art/oldwoman.JPG" },
         { id: "aging-2", title: "Time Unspoken", image: "/art/oldman.jpg" },
         { id: "aging-3", title: "Written by Time", image: "/art/oldman2.JPG" },
         { id: "aging-4", title: "Etched in Iris", image: "/art/eye.jpg" },
         { id: "aging-5", title: "The Inevitable", image: "/art/hands.jpg" },
       ],
       []
     );
   
     const portraitInAsh = useMemo<Artwork[]>(
       () => [
         { id: "ash-1", title: "Written Under Glass", image: "/art/draw.jpg" },
         { id: "ash-2", title: "Illusion of Control", image: "/art/smoke.jpg" },
         { id: "ash-3", title: "Ember Kiss", image: "/art/bite.jpg" },
       ],
       []
     );
   
     const sheIsHer = useMemo<Artwork[]>(
       () => [
         { id: "her-0", title: "Two Truths and 100 Lies", image: "/art/two.jpg" },
         { id: "her-1", title: "Soaked in Silence", image: "/art/close.jpg" },
         { id: "her-2", title: "The Body’s Burden", image: "/art/body.jpg" },
         { id: "her-3", title: "In Her Arms", image: "/art/baby.jpg" },
         { id: "her-4", title: "Lingering Ache", image: "/art/long.jpg" },
         { id: "her-5", title: "Solitary She", image: "/art/turn.jpg" },
       ],
       []
     );
   
     const linesOfLoss = useMemo<Artwork[]>(
       () => [
         { id: "loss-1", title: "Sex Over Morals", image: "/art/sex.jpg" },
         { id: "loss-2", title: "White Noise", image: "/art/scribble.jpg" },
         { id: "loss-3", title: "Blind Spot", image: "/art/square.jpg" },
         { id: "loss-4", title: "Deluge", image: "/art/tree.jpg" },
         { id: "loss-5", title: "Diminished Self", image: "/art/blur.jpg" },
         { id: "loss-6", title: "Slipping Mind", image: "/art/drip.jpg" },
       ],
       []
     );
   
     /* ------------------ POEM ------------------ */
     const poemLines = [
       "To live fully",
       "is to accept that time is not ours to control,",
       "the slow withering of the body",
       "and the fading of the mind.",
       "Move with it,",
       "rather than resist the inevitable.",
     ];
   
     /* ------------------ MODAL ------------------ */
     const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
   
     useEffect(() => {
       const onKey = (e: KeyboardEvent) => {
         if (e.key === "Escape") setActiveArtwork(null);
       };
       window.addEventListener("keydown", onKey);
       return () => window.removeEventListener("keydown", onKey);
     }, []);
   
     // prevent overscroll reveal
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
   
     return (
       <div className="min-h-[100dvh] text-white relative py-12 px-6 md:px-12 bg-transparent">
         <BackgroundYouTube youtubeId={BG_YT_ID} />
   
         <div className="max-w-[1100px] mx-auto">
           {/* PAGE TITLE */}
           <div className="mb-12">
             <div className="mb-6">
               <div className="text-[12px] tracking-[0.5em] uppercase text-white/80 hover:text-red-600 transition-colors duration-500">
                 Harlie Katz
               </div>
             </div>
   
             <h1 className="editorial-heading text-[clamp(44px,5vw,64px)] leading-none hover:text-red-600 transition-colors duration-500">
               Charcoal Art
             </h1>
           </div>
   
           {/* THE ART OF AGING */}
           <SectionHeader title="The Art of Aging" />
   
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-[8px] mb-12">
             {artOfAging.slice(0, 3).map((art) => (
               <ArtworkCard key={art.id} art={art} onClick={setActiveArtwork} />
             ))}
           </div>
   
           <div className="grid grid-cols-12 gap-[8px] mb-12 items-stretch">
             <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-[8px]">
               {artOfAging.slice(3).map((art, index) => (
                 <div key={art.id} className="group">
                   <ArtworkImage art={art} aspect="aspect-[4/3]" onClick={setActiveArtwork} />
                   <div className="mt-2">
                     <h3 className="editorial-heading text-sm text-white/90 group-hover:text-red-600 hover:text-red-600 transition-colors duration-500">
                       {art.title}
                     </h3>
                     {index === 1 && (
                       <p className="text-[11px] text-white/50 mt-1 group-hover:text-red-600 hover:text-red-600 transition-colors duration-500">
                         Published in BSB Magazine
                       </p>
                     )}
                   </div>
                 </div>
               ))}
             </div>
   
             {/* POEM */}
             <div className="col-span-12 lg:col-span-4 flex items-center justify-center">
               <div className="group w-full rounded-2xl border border-white/12 bg-transparent p-8 md:p-10">
                 <div className="text-center">
                   <div
                     className="text-white/85 group-hover:text-red-600 transition-colors duration-500"
                     style={{
                       fontFamily: '"Kapakana", serif',
                       fontSize: "16px",
                       lineHeight: "1.05",
                       letterSpacing: "0.02em",
                       textShadow: "0 2px 18px rgba(0,0,0,0.55)",
                     }}
                   >
                     {poemLines.map((line, i) => (
                       <div key={i} className="hover:text-red-600 transition-colors duration-500">
                         {line}
                       </div>
                     ))}
                   </div>
   
                   <div className="mt-7 flex items-center justify-center gap-3">
                     <div className="h-[1px] w-10 bg-white/35" />
                     <div className="text-[11px] tracking-[0.35em] uppercase text-white/55 group-hover:text-red-600 hover:text-red-600 transition-colors duration-500">
                     </div>
                     <div className="h-[1px] w-10 bg-white/35" />
                   </div>
                 </div>
               </div>
             </div>
           </div>
   
           <Divider />
   
           {/* A PORTRAIT IN ASH */}
           <SectionHeader title="A Portrait in Ash" />
   
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-[8px] mb-12">
             {portraitInAsh.map((art) => (
               <ArtworkCard key={art.id} art={art} onClick={setActiveArtwork} />
             ))}
           </div>
   
           <Divider />
   
           {/* SHE IS HER */}
           <SectionHeader title="She is Her" />
   
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-[8px] mb-12">
             {sheIsHer.map((art) => (
               <ArtworkCard key={art.id} art={art} onClick={setActiveArtwork} />
             ))}
           </div>
   
           <Divider />
   
           {/* LINES OF LOSS */}
           <SectionHeader title="Lines of Loss" />
   
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-[8px]">
             {linesOfLoss.map((art) => (
               <ArtworkCard key={art.id} art={art} onClick={setActiveArtwork} />
             ))}
           </div>
         </div>
   
         {/* MODAL */}
         <AnimatePresence>
           {activeArtwork && (
             <motion.div
               className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center px-6"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setActiveArtwork(null)}
             >
               <motion.div
                 className="max-w-[88vw] max-h-[88vh]"
                 initial={{ y: 14, scale: 0.985 }}
                 animate={{ y: 0, scale: 1 }}
                 exit={{ y: 14, scale: 0.985 }}
                 transition={{ duration: 0.18 }}
                 onClick={(e) => e.stopPropagation()}
               >
                 <img
                   src={activeArtwork.image}
                   alt={activeArtwork.title}
                   className="object-contain max-h-[72vh] rounded-xl"
                 />
                 <div className="text-center text-white/90 mt-3 editorial-heading text-sm hover:text-red-600 transition-colors duration-500">
                   {activeArtwork.title}
                 </div>
                 <div className="text-center text-white/55 text-[11px] tracking-[0.25em] uppercase mt-1 hover:text-red-600 transition-colors duration-500">
                   Charcoal
                 </div>
               </motion.div>
             </motion.div>
           )}
         </AnimatePresence>
       </div>
     );
   }
   
   /* ------------------ COMPONENTS ------------------ */
   
   function Divider() {
     return (
       <div className="flex items-center justify-center my-12 group">
         <div className="h-[2px] w-[192px] bg-[var(--accent-red)]" />
       </div>
     );
   }
   
   function SectionHeader({ title }: { title: string }) {
     return (
       <div className="mb-6 mt-2 group">
         <div className="flex items-center gap-5 mb-3">
           <div className="h-[1px] w-14 bg-white/70" />
           <div className="text-[13px] tracking-[0.55em] uppercase text-white/80 group-hover:text-red-600 hover:text-red-600 transition-colors duration-500">
             {title}
           </div>
         </div>
       </div>
     );
   }
   
   function ArtworkCard({ art, onClick }: { art: Artwork; onClick: (a: Artwork) => void }) {
     return (
       <div className="group">
         <ArtworkImage art={art} onClick={onClick} />
         <h3 className="mt-2 editorial-heading text-sm text-white/90 group-hover:text-red-600 hover:text-red-600 transition-colors duration-500">
           {art.title}
         </h3>
       </div>
     );
   }
   
   function ArtworkImage({
     art,
     aspect = "aspect-[3/4]",
     onClick,
   }: {
     art: Artwork;
     aspect?: string;
     onClick: (a: Artwork) => void;
   }) {
     return (
       <div className={`${aspect} relative overflow-hidden cursor-zoom-in rounded-2xl border border-white/10 bg-white/[0.02]`}>
         <motion.img
           src={art.image}
           alt={art.title}
           className="w-full h-full object-cover grayscale-[0.15] contrast-[1.08] brightness-[0.92]"
           whileHover={{ scale: 1.06 }}
           transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
           onClick={() => onClick(art)}
         />
         <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15" />
       </div>
     );
   }
   