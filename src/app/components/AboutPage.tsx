export function AboutPage() {
    return (
      <div className="min-h-screen pt-20 pb-24 px-12 relative z-10">
        <div className="max-w-[1300px] mx-auto">
          <div className="grid grid-cols-12 gap-10">
            {/* LEFT CONTENT (leave right side open for the face) */}
            <div className="col-span-12 md:col-span-7 lg:col-span-6">
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
                    Harlie Katz is a multidisciplinary artist and filmmaker at UC
                    Berkeley exploring visual narrative across film, drawing, and
                    design. Her work blends cinematic language with tactile and
                    experimental media.
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
  