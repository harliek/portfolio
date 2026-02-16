export function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-24 px-12 relative z-10">
      <div className="max-w-[1300px] mx-auto">
        <div className="grid grid-cols-12 gap-10">
          {/* LEFT CONTENT (leave right side open for the face) */}
          <div className="col-span-12 md:col-span-7 lg:col-span-6">
            
            {/* TOP LINE */}
            <div className="w-full h-[1px] bg-red-600 mb-6" />

            {/* NAME */}
            <h2 className="text-red-600 text-lg tracking-widest mb-4">
              HARLIE KATZ
            </h2>

            {/* ABOUT ME TITLE */}
            <h1 className="editorial-heading text-[clamp(56px,5vw,88px)] leading-none mb-6">
              About Me
            </h1>

            <div className="w-40 h-[3px] bg-red-600 mb-12" />

            <div className="space-y-14">
              {/* BIO */}
              <div>
                <h2 className="text-sm tracking-widest text-red-600 mb-4">
                  BIOGRAPHY
                </h2>
                <p className="text-gray-800 leading-relaxed text-lg">
                  I’m a filmmaker and visual artist studying Cognitive Science at UC Berkeley,
                  with a background in Data Science and Entrepreneurship. My work explores
                  perception, identity, and how visual and digital environments shape
                  attention and behavior.
                  <br /><br />
                  I work primarily in film and charcoal. In my films, I serve as director,
                  cinematographer, editor, and writer, developing projects from concept
                  through post-production. My charcoal drawings focus on form, texture,
                  and the emotional weight of the human figure.
                  <br /><br />
                  I’m currently based in London, working at a film marketing and media
                  production company, where I contribute to campaign strategy, digital
                  distribution, and on-set production. This experience has expanded how
                  I think about audience, positioning, and the lifecycle of creative work.
                  <br /><br />
                  This portfolio features my films and visual art. Design and interactive
                  projects are coming soon.
                </p>
              </div>

              {/* CONTACT */}
              <div>
                <h3 className="text-sm tracking-widest text-red-600 mb-4">
                  CONTACT
                </h3>
                <div className="space-y-2 text-lg">
                  <a
                    href="mailto:harliekatz@berkeley.edu"
                    className="text-gray-800 hover:text-red-600 transition block"
                  >
                    harliekatz@berkeley.edu
                  </a>

                  <a
                    href="tel:+18137652936"
                    className="text-gray-800 hover:text-red-600 transition block"
                  >
                    +1 (813) 765-2936
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT EMPTY COLUMN (keeps face visible) */}
          <div className="hidden md:block md:col-span-5 lg:col-span-6" />
        </div>
      </div>
    </div>
  );
}
