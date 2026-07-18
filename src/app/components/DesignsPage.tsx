import {
  useMemo,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Mail,
  MapPin,
} from "lucide-react";

type Experience = {
  period: string;
  title: string;
  company: string;
  location: string;
  bullets: string[];
  skills: string[];
};

function BackgroundVideo() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={`${import.meta.env.BASE_URL}blackback2.mp4`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      <div className="absolute inset-0 bg-black/75" />

      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 80% 15%, rgba(180,20,30,0.28), transparent 34%), radial-gradient(circle at 10% 75%, rgba(255,255,255,0.06), transparent 30%)",
        }}
      />
    </div>
  );
}

function SwayText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const words = useMemo(() => children.split(" "), [children]);

  const handleMouseMove = (event: MouseEvent<HTMLSpanElement>) => {
    if (!textRef.current) return;

    const letters =
      textRef.current.querySelectorAll<HTMLElement>("[data-sway-letter]");

    letters.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = event.clientX - centerX;
      const deltaY = event.clientY - centerY;
      const distance = Math.sqrt(
        deltaX * deltaX + deltaY * deltaY
      );

      const radius = 140;

      if (distance < radius) {
        const strength = 1 - distance / radius;
        const moveX = deltaX * strength * 0.12;
        const moveY = deltaY * strength * 0.12;
        const rotation = moveX * 0.1;

        letter.style.transform = `
          translate3d(${moveX}px, ${moveY}px, 0)
          rotate(${rotation}deg)
        `;

        letter.style.color =
          strength > 0.62
            ? "rgb(239, 68, 68)"
            : "";
      } else {
        letter.style.transform =
          "translate3d(0, 0, 0) rotate(0deg)";

        letter.style.color = "";
      }
    });
  };

  const resetText = () => {
    if (!textRef.current) return;

    const letters =
      textRef.current.querySelectorAll<HTMLElement>("[data-sway-letter]");

    letters.forEach((letter) => {
      letter.style.transform =
        "translate3d(0, 0, 0) rotate(0deg)";

      letter.style.color = "";
    });
  };

  return (
    <span
      ref={textRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetText}
      aria-label={children}
    >
      {words.map((word, wordIndex) => (
        <span
          key={`${word}-${wordIndex}`}
          className="mr-[0.28em] inline-block whitespace-nowrap"
          aria-hidden="true"
        >
          {word.split("").map((letter, letterIndex) => (
            <span
              key={`${letter}-${letterIndex}`}
              data-sway-letter
              className="inline-block will-change-transform"
              style={{
                transition:
                  "transform 240ms cubic-bezier(0.16, 1, 0.3, 1), color 300ms ease",
              }}
            >
              {letter}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-50px",
      }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="text-[10px] tracking-[0.25em] text-red-500">
        {number}
      </span>

      <div className="h-px w-10 bg-red-600" />

      <span className="text-[11px] uppercase tracking-[0.4em] text-white/55">
        {children}
      </span>
    </div>
  );
}

function EducationCard({
  status,
  school,
  degree,
  description,
}: {
  status: string;
  school: string;
  degree: string;
  description: string;
}) {
  return (
    <motion.article
      className="group h-full rounded-3xl border border-white/15 bg-white/[0.035] p-7 backdrop-blur-sm md:p-8"
      whileHover={{
        y: -7,
        borderColor: "rgba(220,38,38,0.55)",
      }}
      transition={{
        duration: 0.35,
      }}
    >
      <div className="text-[10px] uppercase tracking-[0.28em] text-red-500">
        {status}
      </div>

      <h3 className="editorial-heading mt-5 text-3xl transition-colors duration-500 group-hover:text-red-500">
        {school}
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/65">
        {degree}
      </p>

      <p className="mt-6 text-sm leading-7 text-white/50">
        {description}
      </p>
    </motion.article>
  );
}

function ExperienceCard({
  experience,
  index,
}: {
  experience: Experience;
  index: number;
}) {
  return (
    <Reveal delay={index * 0.05}>
      <motion.article
        className="group border-t border-white/15 py-8"
        whileHover={{
          x: 6,
        }}
        transition={{
          type: "spring",
          stiffness: 170,
          damping: 22,
        }}
      >
        <div className="grid gap-5 md:grid-cols-[135px_minmax(0,1fr)]">
          <div>
            <div className="text-[10px] leading-5 tracking-[0.18em] text-white/35">
              {experience.period}
            </div>

            <div className="mt-2 flex items-center gap-2 text-[10px] text-white/30">
              <MapPin className="h-3 w-3" />
              {experience.location}
            </div>
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="editorial-heading text-2xl transition-colors duration-500 group-hover:text-red-500">
                  {experience.title}
                </h3>

                <div className="mt-1 text-xs tracking-wide text-white/45">
                  {experience.company}
                </div>
              </div>

              <ArrowUpRight className="h-4 w-4 shrink-0 text-white/25 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-red-500" />
            </div>

            <ul className="mt-5 space-y-3">
              {experience.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-3 text-[13px] leading-6 text-white/55 xl:whitespace-nowrap"
                >
                  <span className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-red-600" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              {experience.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/15 px-3 py-1 text-[9px] uppercase tracking-[0.14em] text-white/45 transition-colors duration-300 group-hover:border-red-500/40 group-hover:text-white/70"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

export function DesignsPage() {
  const experiences: Experience[] = [
    {
      period: "JUN 2026 – PRESENT",
      title: "Product Operations and Merchandising Intern",
      company: "PlanetArt",
      location: "San Diego, CA",
      bullets: [
        "Analyzed product, pricing, vendor, and market data to shape merchandising and UK expansion.",
        "Built a UK assortment prototype benchmarking pricing, product breadth, vendors, and PDPs.",
        "Standardized SKU and catalog data and deployed AI workflows to accelerate product review.",
      ],
      skills: [
        "Product Operations",
        "Quantitative Analysis",
        "Pricing Strategy",
        "Data Taxonomy",
        "Market Analysis",
        "AI Workflows",
      ],
    },
    {
      period: "JAN 2026 – MAY 2026",
      title: "Creative Strategy and Client Solutions Intern",
      company: "Shift Content",
      location: "London, UK",
      bullets: [
        "Translated client growth goals into campaign strategies, digital experiences, and acquisition programs.",
        "Coordinated client feedback, creative teams, timelines, and deliverables from strategy through launch.",
        "Analyzed ad, landing page, and campaign data to identify conversion and growth opportunities.",
      ],
      skills: [
        "Client Strategy",
        "Google Analytics",
        "Conversion Analysis",
        "Growth",
        "Campaign Analytics",
      ],
    },
    {
      period: "JUN 2025 – JAN 2026",
      title: "Enterprise AI Research and Strategy Associate",
      company: "The Artesian Network",
      location: "Tampa, FL",
      bullets: [
        "Evaluated LLMs, RAG systems, AI agents, and automation platforms for enterprise adoption.",
        "Mapped AI use cases across regulated industries, assessing workflows, compliance, and risk.",
        "Translated technical architecture and market intelligence into executive AI strategy.",
      ],
      skills: [
        "LLMs",
        "RAG",
        "AI Agents",
        "AI Evaluation",
        "Technical Research",
        "Adoption Strategy",
      ],
    },
    {
      period: "OCT 2024 – JUN 2025",
      title: "Leasing, Sales and Operations Associate",
      company: "Valiance Capital",
      location: "Berkeley, CA",
      bullets: [
        "Managed leasing, CRM data, prospect communication, and operations across 18 properties.",
        "Analyzed pricing, occupancy, leasing, and campaign data to guide business decisions.",
        "Mapped workflows, tested interactions, and defined requirements for an AI leasing assistant.",
      ],
      skills: [
        "Operations",
        "CRM",
        "Analytics",
        "Workflow Mapping",
        "User Testing",
        "Product Requirements",
      ],
    },
    {
      period: "JUN 2024 – JUL 2024",
      title: "Founder and Team Lead",
      company: "Jumpstart Finance",
      location: "Porto, Portugal",
      bullets: [
        "Founded a gamified financial education platform for young adults.",
        "Led customer discovery, market research, business model design, and financial planning.",
        "Directed a five-person international team through prototype, roadmap, and investor pitch.",
      ],
      skills: [
        "Entrepreneurship",
        "User Research",
        "Prototyping",
        "Product Roadmapping",
        "Financial Modeling",
        "Go-to-Market",
      ],
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <BackgroundVideo />

      <section className="px-6 pb-20 pt-32 md:px-12 md:pt-40">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.7,
              }}
              className="mb-7 flex items-center gap-4"
            >
              <div className="h-px w-12 bg-red-600" />

              <span className="text-[11px] uppercase tracking-[0.45em] text-white/60">
                About Me
              </span>
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="editorial-heading text-[clamp(48px,7vw,88px)] leading-[0.86] tracking-[-0.035em]"
            >
              <SwayText>HARLIE KATZ</SwayText>
            </motion.h1>

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.25,
              }}
              className="mt-9 max-w-3xl text-[16px] leading-8 text-white/70 md:text-[18px] md:leading-9"
            >
              <p>
                <SwayText>
                  Artificial intelligence began with a question the human mind
                  had already answered. At UC Berkeley, I studied cognition,
                  artificial intelligence, and quantitative methods to
                  understand intelligence from human and computational
                  perspectives. Now I apply that foundation to products,
                  strategy, and systems built around how people think.
                </SwayText>
              </p>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.7,
                delay: 0.45,
              }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <a
                href={`${import.meta.env.BASE_URL}Harlie%20Katz%202026%20Resume.pdf`}
                download="Harlie Katz 2026 Resume.pdf"
                className="group inline-flex items-center gap-3 rounded-full bg-red-700 px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-500 hover:-translate-y-1 hover:bg-red-600"
              >
                Download Resume

                <Download className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
              </a>

              <a
                href="mailto:harliekatz@berkeley.edu"
                className="group inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white/75 transition-all duration-500 hover:-translate-y-1 hover:border-white/50 hover:text-white"
              >
                Contact

                <Mail className="h-4 w-4" />
              </a>

              <a
                href="https://linkedin.com/in/harliekatz"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white/75 transition-all duration-500 hover:-translate-y-1 hover:border-white/50 hover:text-white"
              >
                LinkedIn

                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              delay: 0.15,
            }}
            className="relative mx-auto w-full max-w-[350px]"
          >
            <div className="absolute -inset-4 rotate-3 rounded-[2rem] border border-red-600/35" />

            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/15 bg-white/5">
              <img
                src={`${import.meta.env.BASE_URL}about-me.jpg`}
                alt="Harlie Katz"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 flex items-center gap-2 text-xs text-white/75">
                <MapPin className="h-4 w-4 text-red-500" />
                California
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.025] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[1180px]">
          <SectionLabel number="01">Education</SectionLabel>

          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <EducationCard
                status="Completed May 2026"
                school="UC Berkeley"
                degree="B.A. Cognitive Science · Minor in Data Science · 3.7 GPA · Completed in 3 Years"
                description="Relevant Coursework: Artificial Intelligence, Machine Learning, Large Language Models (LLMs), Data Science, Business Analytics, Human-Computer Interaction, Product Development, Decision Science, Economics, Entrepreneurship & Technology."
              />
            </Reveal>

            <Reveal delay={0.1}>
              <EducationCard
                status="Admitted"
                school="NYU Tandon School of Engineering"
                degree="M.S. Integrated Design and Media"
                description="Admitted to study emerging technology and human-centered design. Currently prioritizing a full-time role applying cognition, AI, quantitative analysis, and product strategy."
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[1180px]">
          <SectionLabel number="02">Experience</SectionLabel>

          <div>
            {experiences.map((experience, index) => (
              <ExperienceCard
                key={`${experience.company}-${experience.title}`}
                experience={experience}
                index={index}
              />
            ))}

            <div className="border-t border-white/15" />
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-4 md:px-12">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <motion.div
              className="rounded-[2rem] border border-white/15 bg-white/[0.035] px-7 py-10 text-center backdrop-blur-sm"
              whileHover={{
                borderColor: "rgba(220,38,38,0.5)",
              }}
            >
              <div className="text-[10px] uppercase tracking-[0.35em] text-white/40">
                COGNITION · AI · QUANTITATIVE ANALYSIS · PRODUCT STRATEGY
              </div>

              <h2 className="editorial-heading mt-5 text-[clamp(34px,5vw,54px)]">
                <SwayText>LET’S TALK</SwayText>
              </h2>

              <div className="mt-7 flex flex-wrap justify-center gap-4">
                <a
                  href="mailto:harliekatz@berkeley.edu"
                  className="group inline-flex items-center gap-3 rounded-full bg-red-700 px-7 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-500 hover:-translate-y-1 hover:bg-red-600"
                >
                  Email Me

                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>

                <a
                  href="https://linkedin.com/in/harliekatz"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full border border-white/20 px-7 py-3 text-[10px] uppercase tracking-[0.2em] text-white/75 transition-all duration-500 hover:-translate-y-1 hover:border-white/50 hover:text-white"
                >
                  LinkedIn

                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}