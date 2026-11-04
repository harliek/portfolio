/**
 * PDR Control (added 2026-11-04). An independent interactive prototype, first developed for a Rivian Applied
 * Intelligence case study. The page follows the site's told cases: the introduction and the sections on one side, the
 * walkthrough held on the other, playing the part of the recording each section describes.
 *
 * Facts are checked against the prototype's source (github.com/harliekatz/pdr-control at 88178e9: docs/REDESIGN.md,
 * docs/SYNTHETIC_AND_UNVERIFIED.md, src/plan, src/devices) and against the recording itself. The recording is of the
 * public build at pdr-control.netlify.app, which uses original stand-in vehicles; scans are synthetic, the hardware
 * and its telemetry are simulated, and decisions come from coded rules. The walkthrough's case uses the prototype's
 * limited-response preset, so verification has a shortfall to catch: the copy says so.
 *
 * Recording chapters (PDR Control/pdr-walkthrough-chapters.json, seconds): vehicle and panel 0, scan region 8.67,
 * registration 22.45, diagnosis 33.98, eligibility 56.05, tool selection 65.96, guided setup 76.14, connect and
 * calibrate 118.83, live repair 135.48, removal and inspection 149.55, verification 159.41, PDR Expert 172.39, case
 * record 180.38, end 184.03.
 */
export const PDR = {
  title: 'PDR Control',
  meta: ['Concept, product strategy, interaction design and prototype development', 'Independent product prototype · 2026'],
  subtitle: 'Intelligent Paintless Dent Repair',
  lede: 'I designed and built an interactive repair system that helps technicians with little paintless dent repair experience work toward an expert’s quality and consistency. It measures the dent, enforces the repair rules, guides the physical setup with a connected tool, and checks the result with a second scan. The technician stays in control of the repair.',
  focus: 'Applied AI · Product design · Human-in-the-loop systems',
  prototypeUrl: 'https://pdr-control.netlify.app/',
  repoUrl: 'https://github.com/harliekatz/pdr-control',
  /** One part of the recording per section (seconds; the last two hold on the case record). */
  segments: [
    [0, 8.6],
    [8.7, 33.9],
    [34.0, 56.0],
    [56.1, 76.1],
    [76.2, 118.8],
    [118.9, 149.5],
    [149.6, 168.0],
    [163.0, 180.3],
    [180.4, 184.0, 'hold'],
    [180.4, 184.0, 'hold'],
  ] as const,
  /** One still per section, under reduced motion. */
  stills: [5, 30, 50, 60, 113, 143, 163, 175, 182, 182],
  steps: [
    {
      title: 'The problem',
      text: [
        'Paintless dent repair restores a panel without filler or paint, but it depends on judgment that is hard to teach: reading a shallow low in reflected light, deciding whether it can be repaired, placing a tool precisely, pulling in small controlled steps, and knowing when to stop.',
        'The goal was to make an expert’s guidance and measurable feedback available during the repair itself, not to put a chatbot beside it.',
      ],
    },
    {
      title: 'Observe, decide, execute, verify',
      text: [
        'I broke the repair into four functions. Observe: measure the damage. Decide: check eligibility and choose a method. Execute: set up and pull safely. Verify: measure what changed and decide what happens next.',
        'I compared instructional software, computer vision, connected tools and robotic repair. Vision makes damage measurable but doesn’t move metal, connected tools measure the tool rather than the panel, and robotics brings hardware, access and validation problems on every panel shape. I chose a human-guided system: surface measurement, coded procedure rules, step-by-step guidance and instrument feedback, with the technician doing the physical work.',
      ],
    },
    {
      title: 'Surface diagnosis',
      text: 'A proposed Surface Pod captures the selected region of the door, registered to three reference marks (R1–R3) so later scans line up. The region can be moved and resized, and its edges are checked against the panel. The app shows reflection bands, a deviation map and cross-sections, and reports the deepest point as 0.80 ± 0.05 mm, where ±0.05 mm is scan repeatability, not accuracy.',
    },
    {
      title: 'Rules before recommendations',
      text: 'Before any method is suggested, rules check scan quality, the damage’s size and depth, its distance from body lines, the panel’s material from Rivian’s published Material Matrix, a 30× paint inspection and repair authorization. Only then are methods compared, each with its reasons. A dent too close to a body line stops at specialist review instead of offering a tool.',
    },
    {
      title: 'Guided execution',
      text: 'Setup is taught on the panel itself: the pulling tab, an adhesive checklist, a tab outline projected through the registered marks, and each foot of the connected pulling bridge. The app keeps what was planned, what the technician confirmed and what was measured apart, and says when something can’t be measured, such as the tab’s exact placement.',
    },
    {
      title: 'Human control of the tool',
      text: 'The proposed bridge reports force and screw travel. The app pairs it, checks both sensors and refuses to zero it under load. During the pull the technician turns the wheel, while the software reads the stream, flags stale or inconsistent data, and explains what the readings do and don’t show. It never drives the tool.',
    },
    {
      title: 'Measured outcomes over inferred success',
      text: [
        'Force and travel describe the instrument, not the panel: the tab, adhesive, frame and metal all flex, and some movement springs back. So after the tool is unloaded and removed and the paint is inspected, a second registered scan measures what actually changed.',
        'In the walkthrough’s prepared case the panel responds less than planned. The low moved 0.05 mm, less than the ±0.07 mm two scans can resolve, so the app reports no measurable improvement rather than a success.',
      ],
    },
    {
      title: 'Uncertainty and escalation',
      text: 'When a result contradicts the prediction, the app lists what is known and what is uncertain, ranks the likely causes from measurement error to tab behavior, and recommends the next check, a repeat scan or expert review, not another pull. PDR Expert answers questions from the case record and can’t change tools, evidence or eligibility.',
    },
    {
      title: 'Validation and next steps',
      text: [
        'These are proposed experiments, not completed ones. Surface measurement comes first: can a portable sensor measure shallow lows on glossy, curved paint repeatably, and find the same patch again after a tool has been bonded and removed? Then experienced technicians, novices using conventional methods, and novices using the system would repair matched panels, compared on repair quality, total time including setup and rework, consistency, and safety.',
        'Before use in a real shop, the measurement, the rules and their limits, and the procedure would all need validation against reference instruments, OEM procedures and expert review.',
      ],
    },
    {
      title: 'Project status',
      text: 'Independent interactive prototype built with synthetic surface data, simulated hardware feedback, and rule-based decision logic. Physical sensing, trained AI models, and real-world repair validation remain proposed future development.',
    },
  ],
}
