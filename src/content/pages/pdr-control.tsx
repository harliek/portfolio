/**
 * PDR Control (added 2026-11-04). An independent interactive prototype, first developed for a Rivian Applied
 * Intelligence case study. The page follows the site's told cases: the introduction and the sections on one side, the
 * walkthrough held on the other, playing the part of the recording each section describes.
 *
 * The walkthrough is Harlie's screen recording of the finished prototype (Nov 3, 2026; the one in the final
 * presentation), published with Harlie's approval: the opening shows the vehicle as recorded, the picker's photos are
 * blurred, and after 23.6s the door lettering, inset pictures and vehicle thumbnails are masked
 * (scripts/prepare-media.mjs, task `pdr`). Scans are synthetic, the hardware and its telemetry are simulated, and
 * decisions come from coded rules; the case uses the prototype's limited-response preset, so verification has a
 * shortfall to catch.
 *
 * Recording chapters (seconds): vehicle and damage 0, scan region 23.6, diagnosis 33, eligibility 42, tool choice 54,
 * bridge and tab setup 66, bridge on the door 116, connect and calibrate 129, live repair 148, removal and inspection
 * 167, rescan 180, outcome 185, expert review 194, PDR Expert 203, end 209.8.
 */
export const PDR = {
  title: 'PDR Control',
  meta: ['Concept, product strategy, interaction design and prototype development', 'Independent product prototype · 2026'],
  subtitle: 'Intelligent Paintless Dent Repair',
  lede: 'An interactive system that helps less experienced technicians repair dents to an expert’s standard: it measures the damage, enforces the repair rules, guides the tool setup and verifies the result.',
  focus: 'Applied AI · Product design · Human-in-the-loop systems',
  /** The live prototype's link (2026-11-04: withheld at Harlie's request; was https://pdr-control.netlify.app/). */
  prototypeUrl: null as null | string,
  repoUrl: 'https://github.com/harliekatz/pdr-control',
  /** The walkthrough's encodes; null shows the gallery below instead. */
  walkthrough: {
    src: '/media/video/pdr-walkthrough-1440.mp4',
    dialogSrc: '/media/video/pdr-walkthrough-1920.mp4',
    poster: '/media/img/pdr-poster-1440.webp',
    width: 1440,
    height: 784,
  } as null | { src: string; dialogSrc: string; poster: string; width: number; height: number },
  /** The gallery while there is no walkthrough, and one picture per section (indices into it). */
  gallery: ['pdr-diagnosis', 'pdr-cross-section', 'pdr-eligibility', 'pdr-tool-choice', 'pdr-bridge-setup', 'pdr-telemetry', 'pdr-verification'] as const,
  show: [0, 3, 1, 5, 6, 0],
  /** One part of the recording per section (seconds; the last plays once and holds). */
  segments: [
    [0, 23.5],
    [23.6, 41.5],
    [41.6, 69.0],
    [69.1, 167.0],
    [167.1, 196.0],
    [196.1, 209.6, 'hold'],
  ] as const,
  /** One still per section, under reduced motion. */
  stills: [5, 30, 50, 155, 188, 205],
  steps: [
    {
      title: 'The problem',
      text: 'Paintless dent repair depends on judgment that takes years to learn. PDR Control brings an expert’s guidance and measurable feedback into the repair itself.',
    },
    {
      title: 'Observe, decide, execute, verify',
      text: 'The repair splits into four functions. The software measures, applies the rules and guides; the technician does the physical work.',
    },
    {
      title: 'Diagnosis and rules',
      text: 'A registered surface scan measures the dent: 0.80 ± 0.05 mm deep here. Coded rules check eligibility before any method is suggested, and send dents near body lines to specialist review.',
    },
    {
      title: 'Guided setup, human control',
      text: 'Setup is taught on the panel, step by step. During the pull the technician turns the wheel; the app reads force and travel and never drives the tool.',
    },
    {
      title: 'Measured outcomes over inferred success',
      text: 'A second scan measures what actually changed. Here the low moved 0.05 mm, within what two scans can resolve, so the app reports no measurable improvement instead of a success.',
    },
    {
      title: 'Status and next steps',
      text: 'An independent prototype with synthetic scans, simulated hardware and rule-based logic. Next: test whether a portable sensor can measure shallow dents repeatably, then compare novices with and without the system on matched panels.',
    },
  ],
}
