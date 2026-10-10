import type { TeamMember } from '@/types';

export const teamContent = {
  kicker: 'Leadership',
  headline: { lead: "Who's behind the", emphasis: 'wheel' },
  careerLabel: "Where they've built",
} as const;

/**
 * Logo marquee under the leadership cards — two rows travelling in opposite
 * directions. Each row is rendered twice by the component so the loop seam is
 * invisible; list each logo once here.
 */
export const careerRows: Array<Array<{ src: string; alt: string }>> = [
  [
    { src: '/assets/brand/career/morgan-stanley.png', alt: 'Morgan Stanley' },
    { src: '/assets/brand/career/xendit.png', alt: 'Xendit' },
    { src: '/assets/brand/career/ouroboros-capital.png', alt: 'Ouroboros Capital' },
    { src: '/assets/brand/career/begroup.png', alt: 'beGroup' },
    { src: '/assets/brand/career/quorum-advisors.png', alt: 'Quorum Advisors' },
  ],
  [
    { src: '/assets/brand/career/jp-morgan.png', alt: 'J.P. Morgan' },
    { src: '/assets/brand/career/graticule.png', alt: 'Graticule Asset Management Asia' },
    { src: '/assets/brand/career/yuzu.png', alt: 'Yuzu' },
    { src: '/assets/brand/career/dwarves.png', alt: 'Dwarves Foundation' },
    { src: '/assets/brand/career/f6galaxy.png', alt: 'F6Galaxy' },
  ],
];

export const teamMembers: TeamMember[] = [
  {
    id: 'lewis',
    name: 'Lewis',
    role: 'CEO',
    initial: 'L',
    /*
      Cut out — RGBA, 45% of the frame at alpha 0. See the note on Runi below
      for why the white disc lives on the hover state rather than on the file.

      `-v3` is both Lewis files scaled 1.08 about their centre and moved down
      72px and right 12px in the 1254 frame, which lands his crown on Runi's
      row 53 and his eye line on Runi's column. His crown sat at row 29, which
      put his hair nearly on the ring.

      The 8% is a judgement. Measured on interocular distance — the one landmark
      here that is a real scale and not a drawing style — 1.04 already matched
      Runi (471 against 469). He still read smaller because Runi's eyes carry
      about twice the ink and his hair is 712 wide against Lewis's 588, both of
      which are how the two were drawn. So this overshoots to 1.052 of Runi's
      interocular on purpose. Silhouette width is NOT the metric to chase: a fit
      on it ran to 1.14, which is a different person.
    */
    portrait: '/assets/img/team/lewis-default-v3.webp',
    portraitHover: '/assets/img/team/lewis-smile-v3.webp',
    tagline: 'Markets, macro & venture',
    highlights: [
      'Former Trader at Morgan Stanley, J.P. Morgan, Graticule Asset Management Asia ($3B macro fund)',
      'Founder of Ouroboros Capital ($30M DeFi yield fund)',
      'Founder of Yuzu Money ($2M raised at $30M valuation)',
      'Founder of Quorum Advisors',
    ],
  },
  {
    id: 'runi',
    name: 'Runi',
    role: 'CTO',
    initial: 'R',
    /*
      `-2` is a cache bust, not a typo. next.config.ts serves everything under
      /assets with `max-age=31536000, immutable`, so a replaced file at the same
      URL never reaches anyone who has already loaded it — measured here: the
      page went on painting the old 115,104-byte image from cache while a
      no-store fetch of the same URL returned the new 124,714-byte one.

      So a new portrait gets a new filename, and never a name that has already
      been served with different bytes — `-3` is burnt for exactly that reason.

      The `-fit` hover files are the supplied renders resized to match their
      resting partner. The two are separate drawings, and measured on the head
      region — crown row, mask area, centroid — the hover figure came out 0.6%
      larger for Lewis and 1.3% for Runi, which is 1-2px at a 160px portrait and
      read as the picture zooming on hover. Each was scaled about its centre by
      sqrt(restingArea / hoverArea) and nudged so the two head centroids
      coincide; the residual is now 0.1-0.2% and the centroids agree to a
      fifth of a pixel. The supplied files are kept beside them.

      Both portraits are supplied with the background already cut out — RGBA,
      alpha 0 outside the figure, about half the frame. `.m-photo` no longer
      paints a white disc behind them, so what shows through is the card.
      Cutting the background out of a black-field version here was tried and
      reverted: the hair is black ink on black, so its silhouette is not in the
      file to recover.

      `runi.webp`, the portrait from before this pose, is deleted. It had been
      kept because this project has no version control — but an unreferenced file
      nobody can name is not a backup, and it was shipping to every visitor in
      the build.
    */
    portrait: '/assets/img/team/runi-default.webp',
    portraitHover: '/assets/img/team/runi-smile-fit.webp',
    tagline: '10+ years engineering leadership in Southeast Asia',
    highlights: [
      "First engineer at beGroup (Vietnam's #2 Super-App, 20M+ users)",
      'Engineering Manager at Xendit ($1B annualized TPV)',
      'Head of Engineering at F6Galaxy (blockchain gaming)',
      'Founding member at Dwarves Foundation',
    ],
  },
];
