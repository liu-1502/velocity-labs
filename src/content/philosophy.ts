import type { PhilosophyPillar, PhilosophyPrinciple } from '@/types';

export const philosophyContent = {
  kicker: 'Our Philosophy',
  headline: { lead: 'How we think about', emphasis: 'building' },
  lede: 'More than a vendor, we are your product partners.',
  video: {
    src: '/assets/video/philosophy.mp4',
    poster: '/assets/video/philosophy-poster.jpg',
  },
} as const;

/**
 * Labels float over the philosophy video and fade in as the section is pinned.
 *
 * Coordinates and float delays are the production values, read off the live
 * page's per-label `--x` / `--y` / `--d` custom properties — not estimated.
 * `position` is a percentage of the frame; the label centres on that point.
 *
 * NOTE: only used by the previous video treatment
 * (`components/sections/PhilosophyVideo.tsx`, no longer wired into the page).
 * Kept so that file still compiles and the old section can be restored by
 * pointing `components/sections/index.ts` back at it.
 */
export const philosophyPillars: PhilosophyPillar[] = [
  { id: 'collaboration', label: 'Deep Collaboration', position: { x: 16, y: 24 }, floatDelay: 0 },
  { id: 'speed', label: 'Execution Speed', position: { x: 71, y: 17 }, floatDelay: 0.7 },
  { id: 'quality', label: 'Code Quality', position: { x: 23, y: 71 }, floatDelay: 1.5 },
  { id: 'iterative', label: 'Iterative Design', position: { x: 78, y: 63 }, floatDelay: 2.3 },
  { id: 'user-centric', label: 'User-Centric', position: { x: 47, y: 43 }, floatDelay: 3.1 },
  {
    id: 'scalability',
    label: 'Built for Scalability',
    position: { x: 55, y: 83 },
    floatDelay: 3.9,
  },
];

/* ==========================================================================
   Editorial treatment — headline, lede and the six principles as a list.
   ========================================================================== */

/**
 * The headline is split into lines by hand rather than left to wrap.
 *
 * Each line is masked and slid up independently, so where the break falls is a
 * design decision, not a function of the viewport. Keep them roughly equal in
 * width — a short last line reads as a mistake at 132px.
 */
export const philosophyIntro = {
  headlineLines: ['We work like the team that', '<mark>has to <em>live</em></mark> with the code'],
  lede: 'Six things we do on every project. Ask us to show you any of them before you sign anything.',
  counter: '01 - 06',
  standfirst:
    'Most of what goes wrong on an outsourced build goes wrong in the way of working, not the code.',
  aside:
    'So this is the part we are specific about. Each of these is a practice with a name, a cadence, and someone responsible for it.',
  /*
    ⚠️ SUPPLIED ARTWORK — PROVENANCE UNVERIFIED.

    `handshake-mesh.webp` was handed over as an image file, not generated here,
    and nothing about where it came from is known. It has the look of a stock
    illustration. If it is one, this site needs the licence for it before the
    site goes anywhere public — and if the licence turns out to be a CC BY, it
    needs a visible credit as well. That is not a hypothetical here: the world
    map below this note exists because the plate's previous artwork was a CC BY
    file the site carried no credit for, and converting it to another format did
    not fix that. Confirm the source before launch.

    WHAT WAS DONE TO IT
    The background was keyed out rather than painted over: alpha is taken from
    the original's own luminance, so the halftone keeps its gradation — a dot at
    mid grey becomes a dot at half alpha, not a hard dot or no dot. Everything
    at or under luminance 12 goes fully transparent, which clears the WebP's
    compression noise in the black without touching the faintest real dots. The
    RGB is then flattened to black, because `.phil-plate img` inverts what it is
    given (see globals.css) — black with alpha inverts to white with the same
    alpha, which is the pipeline the SVG plates already use.

    Cropped to the ink: 1536 x 1024 down to 1536 x 794, which is the artwork's
    own bounding box. Only empty rows came off, so the composition is untouched
    and the hands still bleed off both sides.

    To redo it from a new source:
        alpha = max(0, L - 12) * 255 / 243, RGB = black, crop to getbbox()
    Lossless WebP — the halftone is high-frequency, and lossy at q88 came out
    the same size while smearing the dots.

    THE OTHER THREE PLATES ARE STILL HERE
    `hands-squares.svg` (`scripts/build-hands-grid.py`) — the same gesture drawn
    on the map's own 126 x 71 grid, generated and licence-free.
    `world-squares.svg` (`scripts/build-world-map.py`) — Natural Earth land
    polygons, public domain, no conditions. It was never a licence problem; it
    was an argument problem, in that a world map answers where we are and no
    line of copy on this site claims a reach.
    `cadence-grid.svg` (`scripts/build-cadence-grid.py`) — the wordmark over a
    working-week rhythm.
    Switching between any of them is `src` and `alt` below.
  */
  plate: {
    src: '/assets/img/handshake-mesh.webp',
    alt: 'Two hands shaking, drawn as a halftone and a wireframe mesh',
  },
} as const;

/**
 * ⚠️ UNVERIFIED CLAIMS.
 *
 * Every `body` below states something specific and checkable about how Velocity
 * Labs runs a project — a shared channel, a weekly staging deploy, a second
 * reviewer on every change. Specificity is what stops this section reading as
 * boilerplate, and it is also what makes it a promise. Confirm each line
 * against how the team actually works and edit or delete the ones that do not
 * hold before this ships.
 */
export const philosophyPrinciples: PhilosophyPrinciple[] = [
  {
    id: 'collaboration',
    number: '01',
    title: 'Deep collaboration',
    body: 'You get a shared channel with the engineers writing the code, not an account manager. Our standup is open to you every morning.',
  },
  {
    id: 'speed',
    number: '02',
    title: 'Execution speed',
    body: 'Something new reaches staging every week. You judge the product by using it, not by reading a percentage.',
  },
  {
    id: 'user-centric',
    number: '03',
    title: 'Built around the user',
    body: 'Before a feature is specced we watch a few people do the job it replaces. The spec usually changes after that.',
  },
  {
    id: 'iterative',
    number: '04',
    title: 'Iterative design',
    body: 'We plan two weeks at a time and re-plan on Fridays. A wrong assumption costs a sprint instead of a quarter.',
  },
  {
    id: 'quality',
    number: '05',
    title: 'Code quality',
    body: 'Every change is read by a second engineer before it merges. Tests, a README and a recorded walkthrough come with the handover.',
  },
  {
    id: 'scalability',
    number: '06',
    title: 'Built to scale',
    body: 'We size the architecture for the traffic you expect in two years, and write down which part gives way first.',
  },
];
