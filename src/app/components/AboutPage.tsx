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

/* ---------- Background ---------- */

function AboutBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black"
      aria-hidden="true"
    >

      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={`${import.meta.env.BASE_URL}blackback2.mp4`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      <div className="absolute inset-0 bg-black/45" />

      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 80% 15%, rgba(180, 20, 30, 0.30), transparent 36%), radial-gradient(circle at 10% 75%, rgba(255, 255, 255, 0.08), transparent 32%)",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/45" />
    </div>
  );
}

/* ---------- Interactive Text ---------- */

function SwayText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const textRef = useRef<HTMLSpanElement>(null);

  const words = useMemo(
    () => children.split(" "),
    [children]
  );

  const handleMouseMove = (
    event: MouseEvent<HTMLSpanElement>
  ) => {
    if (!textRef.current) {
      return;
    }

    const letters =
      textRef.current.querySelectorAll<HTMLElement>(
        "[data-sway-letter]"
      );

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
    if (!textRef.current) {
      return;
    }

    const letters =
      textRef.current.querySelectorAll<HTMLElement>(
        "[data-sway-letter]"
      );

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

/* ---------- Reveal Animation ---------- */

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

/* ---------- Section Label ---------- */

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

/* ---------- Education Card ---------- */

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
      className="group h-full rounded-3xl border border-white/15 bg-black/20 p-7 backdrop-blur-md md:p-8"
      whileHover={{
        y: -7,
        borderColor: "rgba(220, 38, 38, 0.55)",
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

/* ---------- Experience Card ---------- */

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
        <div className="grid gap-5 md:grid-cols-[155px_1fr]">
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

            <ul className="mt-5 max-w-4xl space-y-3">
              {experience.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-3 text-sm leading-6 text-white/55"
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

/* ---------- About Page ---------- */

export function AboutPage() {
  const experiences: Experience[] = [
    {
      period: "JUN 2026 – PRESENT",
      title: "Product Operations & Merchandising Intern",
      company: "PlanetArt",
      location: "San Diego, CA",
      bullets: [
        "Built a centralized product platform across 8 tools and hundreds of spreadsheets, reducing manual work.",
        "Began building an AI agent to retrieve and synthesize product data from the centralized platform.",
        "Standardized data for 1,000+ products across SKUs, taxonomy, vendors, images, and catalog metadata.",
        "Mapped 5 vendors and 6 competitors to guide UK pricing, assortment, supply, and launch decisions.",
      ],
      skills: [
        "Product Operations",
        "Data Architecture",
        "AI Workflows",
        "Assortment Strategy",
      ],
    },
    {
      period: "JAN 2026 – MAY 2026",
      title: "Creative Strategy & Client Solutions Intern",
      company: "Shift Content",
      location: "London, UK",
      bullets: [
        "Led 4 client campaigns from brief through launch, translating growth goals into execution plans.",
        "Optimized paid search across 100+ keywords and 6 domains, generating 3x more qualified inquiries.",
      ],
      skills: [
        "Client Strategy",
        "Campaign Analytics",
        "Growth Strategy",
      ],
    },
    {
      period: "JUN 2025 – JAN 2026",
      title: "Enterprise AI Research Associate",
      company: "The Artesian Network",
      location: "Remote",
      bullets: [
        "Evaluated LLMs, RAG systems, AI agents, and automation tools for workflow fit, risk, and readiness.",
        "Mapped AI use cases across 4 industries, defining feasibility, requirements, risk, and potential ROI.",
        "Produced 4 Olympus.io white papers on AI architecture, governance, compliance, and deployment.",
      ],
      skills: [
        "LLMs",
        "RAG",
        "AI Agents",
        "AI Readiness",
      ],
    },
    {
      period: "OCT 2024 – JUN 2025",
      title: "Leasing & Operations Associate",
      company: "Valiance Capital",
      location: "Berkeley, CA",
      bullets: [
        "Managed CRM workflows across 18 properties and 1,000+ tenants from lead intake through maintenance.",
        "Analyzed occupancy, pricing, conversion, and leasing data to identify shifts in portfolio demand.",
        "Translated leasing workflows and user needs into requirements for engineers building the Oski AI agent.",
        "Tested agent workflows, documented operational edge cases, and proposed product improvements.",
      ],
      skills: [
        "Workflow Analysis",
        "Product Requirements",
        "AI Evaluation",
        "Operations",
      ],
    },
    {
      period: "JUN 2024 – JUL 2024",
      title: "Founder & Product Lead",
      company: "Jumpstart Finance",
      location: "Porto, Portugal",
      bullets: [
        "Led a 5-person international team through customer discovery, product design, and prototyping.",
        "Translated behavioral insights into user journeys, incentive systems, and product requirements.",
        "Designed and pitched the prototype, financial model, market-entry plan, and investment thesis.",
      ],
      skills: [
        "Entrepreneurship",
        "User Research",
        "Product Design",
        "Prototyping",
      ],
    },
  ];

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden text-white">
      <AboutBackground />

      <div className="relative z-10">
        {/* ---------- Hero ---------- */}

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
                  y: 14,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.18,
                }}
                className="mt-6 text-[10px] font-medium uppercase tracking-[0.25em] text-red-400 md:text-[11px]"
              >
                AI Strategy & Implementation | Product Data & Operations
              </motion.div>

              <motion.div
  initial={{ opacity: 0, y: 18 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.3 }}
  className="mt-8 max-w-2xl text-[16px] leading-8 text-white/70 md:text-[18px] md:leading-9"
>
  <p>
  Companies gain the greatest advantage from technology when they stop optimizing old systems and design new systems around what the technology now makes possible.


    I studied intelligence as both a human process and a computational
    system at UC Berkeley. Since then, I have applied that perspective
    to product data, AI agents, workflow design, and implementation.
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
                  delay: 0.5,
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
                  className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/10 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/50 hover:text-white"
                >
                  Contact

                  <Mail className="h-4 w-4" />
                </a>

                <a
                  href="https://linkedin.com/in/harliekatz"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/10 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/50 hover:text-white"
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

              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 shadow-2xl">
                <img
                  src={`${import.meta.env.BASE_URL}about-me.jpg`}
                  alt="Harlie Katz"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 flex items-center gap-2 text-xs text-white/75">
                  <MapPin className="h-4 w-4 text-red-500" />

                  San Francisco, CA
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ---------- Education ---------- */}

        <section className="border-y border-white/10 bg-black/20 px-6 py-16 backdrop-blur-sm md:px-12">
          <div className="mx-auto max-w-[1180px]">
            <SectionLabel number="01">
              Education
            </SectionLabel>

            <div className="grid gap-6 md:grid-cols-2">
              <Reveal>
                <EducationCard
                  status="Completed May 2026"
                  school="UC Berkeley"
                  degree="B.A. Cognitive Science · Minor in Data Science · GPA 3.7"
                  description="Graduated in three years while working approximately 25 hours per week. Studied intelligence through artificial intelligence, large language models, machine learning, computational cognitive modeling, data analytics, economics, and AI governance."
                />
              </Reveal>

              <Reveal delay={0.1}>
                <EducationCard
                  status="Certificate"
                  school="Sutardja Center"
                  degree="Entrepreneurship & Technology · UC Berkeley"
                  description="Applied customer research, behavioral insights, product design, prototyping, market analysis, financial planning, and business-model development while building technology products with international teams."
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- Experience ---------- */}

        <section className="px-6 py-16 md:px-12">
          <div className="mx-auto max-w-[1180px]">
            <SectionLabel number="02">
              Experience
            </SectionLabel>

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

        {/* ---------- Contact ---------- */}

        <section className="px-6 pb-24 pt-4 md:px-12">
          <div className="mx-auto max-w-[1180px]">
            <Reveal>
              <motion.div
                className="rounded-[2rem] border border-white/15 bg-black/25 px-7 py-10 text-center backdrop-blur-md"
                whileHover={{
                  borderColor: "rgba(220, 38, 38, 0.5)",
                }}
              >
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  AI Strategy & Implementation · Product Data & Operations
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
      </div>
    </main>
  );
}