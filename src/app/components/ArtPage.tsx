import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Artwork = {
  id: string;
  title: string;
  image: string;
};

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

  /* ------------------ RENDER ------------------ */

  return (
    <div className="min-h-screen py-12 px-12">
      <div className="max-w-[1100px] mx-auto">
        {/* PAGE TITLE */}
        <div className="mb-10">
          <h1 className="editorial-heading text-5xl">Charcoal Art</h1>
        </div>

        {/* THE ART OF AGING */}
        <h2 className="signature-script text-5xl text-[var(--accent-red)] mb-3">
          The Art of Aging
        </h2>

        <div className="grid grid-cols-3 gap-[6px] mb-10">
          {artOfAging.slice(0, 3).map((art) => (
            <ArtworkCard key={art.id} art={art} onClick={setActiveArtwork} />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-[6px] mb-10 items-stretch">
          <div className="col-span-12 lg:col-span-8 grid grid-cols-2 gap-[6px]">
            {artOfAging.slice(3).map((art, index) => (
              <div key={art.id}>
                <ArtworkImage art={art} aspect="aspect-[4/3]" onClick={setActiveArtwork} />
                <div className="mt-1">
                  <h3 className="editorial-heading text-sm hover:text-[var(--accent-red)] transition-colors duration-500">
                    {art.title}
                  </h3>
                  {index === 1 && (
                    <p className="text-[11px] text-gray-500">
                      Published in BSB Magazine
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* POEM */}
          <div className="col-span-12 lg:col-span-4 flex items-center justify-center">
            <div
              className="text-center text-gray-900"
              style={{
                fontFamily: '"Kapakana", serif',
                fontSize: "16px",
                lineHeight: "1.05",
                letterSpacing: "0.02em",
              }}
            >
              {poemLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        </div>

        <RedDivider />

        {/* A PORTRAIT IN ASH */}
        <h2 className="signature-script text-5xl text-[var(--accent-red)] mb-3 mt-10">
          A Portrait in Ash
        </h2>

        <div className="grid grid-cols-3 gap-[6px] mb-10">
          {portraitInAsh.map((art) => (
            <ArtworkCard key={art.id} art={art} onClick={setActiveArtwork} />
          ))}
        </div>

        <RedDivider />

        {/* SHE IS HER */}
        <h2 className="signature-script text-5xl text-[var(--accent-red)] mb-3 mt-10">
          She is Her
        </h2>

        <div className="grid grid-cols-3 gap-[6px] mb-10">
          {sheIsHer.map((art) => (
            <ArtworkCard key={art.id} art={art} onClick={setActiveArtwork} />
          ))}
        </div>

        <RedDivider />

        {/* LINES OF LOSS */}
        <h2 className="signature-script text-5xl text-[var(--accent-red)] mb-3 mt-10">
          Lines of Loss
        </h2>

        <div className="grid grid-cols-3 gap-[6px]">
          {linesOfLoss.map((art) => (
            <ArtworkCard key={art.id} art={art} onClick={setActiveArtwork} />
          ))}
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {activeArtwork && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveArtwork(null)}
          >
            <motion.div
              className="max-w-[88vw] max-h-[88vh]"
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeArtwork.image}
                alt={activeArtwork.title}
                className="object-contain max-h-[72vh]"
              />
              <div className="text-center text-white mt-2 editorial-heading text-sm">
                {activeArtwork.title}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------ COMPONENTS ------------------ */

function RedDivider() {
  return <div className="w-32 h-[2px] bg-[var(--accent-red)] mx-auto my-10" />;
}

function ArtworkCard({
  art,
  onClick,
}: {
  art: Artwork;
  onClick: (a: Artwork) => void;
}) {
  return (
    <div>
      <ArtworkImage art={art} onClick={onClick} />
      <h3 className="editorial-heading text-sm mt-1 hover:text-[var(--accent-red)] transition-colors duration-500">
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
    <div className={`${aspect} overflow-hidden cursor-zoom-in`}>
      <motion.img
        src={art.image}
        alt={art.title}
        className="w-full h-full object-cover grayscale"
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => onClick(art)}
      />
    </div>
  );
}
