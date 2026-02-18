export function AboutPage() {
  return (
    <div className="min-h-screen pt-20 pb-24 px-12 relative z-10">
      <div className="max-w-[1300px] mx-auto">
        <div className="grid grid-cols-12 gap-10">
          
          {/* LEFT CONTENT */}
          <div className="col-span-12 md:col-span-7 lg:col-span-6">
            
            {/* TOP LINE */}
            <div className="w-full h-[1px] bg-red-600 mb-6" />

            {/* NAME */}
            <h2 className="text-red-600 text-lg tracking-widest mb-4">
              HARLIE KATZ
            </h2>

            {/* TITLE */}
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
                  with a background in Data Science and Entrepreneurship. In film, I work across 
                  roles including director, cinematographer, editor, and writer. My work explores 
                  perception, identity, and psychological and existential tension, and I aim to 
                  create emotionally resonant experiences that leave a lasting impact. Through 
                  both film and charcoal, I’m drawn to realism infused with abstraction, using 
                  distortion and composition to translate underlying emotion.
                  <br /><br />
                  I’m currently based in London, working with a film marketing and media 
                  production company. Outside of work, I’ve been experimenting with prototyping 
                  and coding websites, including this one. Design and interactive projects are 
                  coming soon!
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

          {/* RIGHT COLUMN (kept open intentionally for layout balance) */}
          <div className="hidden md:block md:col-span-5 lg:col-span-6" />
        
        </div>
      </div>
    </div>
  );
}
