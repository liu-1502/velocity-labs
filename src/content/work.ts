import type { Partner, Project } from '@/types';

export const workContent = {
  kicker: 'Track Record',
  headline: { lead: "What we've", emphasis: 'built' },
  lede: 'Projects across fintech, gaming, and web3. Every one shipped, not shelved.',
  partnersLabel: 'Clients & design partners',
} as const;

export const projects: Project[] = [
  {
    id: 'novaland',
    /* This page's accent: 8.18:1 on the page's black. */
    accent: '#0fbf6a',
    /* Blue into green, the ramp its own screenshot runs on. */
    tint: ['#1565d8', '#0fbf6a'],
    href: '/work/novaland',
    visual: 'chip',
    number: '01',
    domain: 'Loyalty Platform',
    title: 'Novaland Group',
    description:
      "Loyalty and rewards platform for one of Vietnam's largest real estate groups, listed on the Ho Chi Minh Stock Exchange.",
    logo: { src: '/assets/brand/novaland.png', alt: 'Novaland Group' },
    shot: {
      src: '/assets/work/novaland.webp',
      alt: 'NovaService Loyalty app — entertainment deals, home, and account screens',
    },
  },
  {
    id: 'btse',
    /* This page's accent: 7.56:1 on the page's black. */
    accent: '#38a8ef',
    /* Indigo into sky. */
    tint: ['#1b4fd8', '#38a8ef'],
    href: '/work/btse',
    visual: 'chip',
    number: '02',
    domain: 'Back Office & Data',
    title: 'BTSE Crypto Exchange',
    description:
      'Back-office tooling and data pipelines for a global crypto exchange with more than USD 100 million daily volume.',
    logo: { src: '/assets/brand/btse-blue.png', alt: 'BTSE' },
    shot: {
      src: '/assets/work/btse.webp',
      alt: 'BTSE Invoicing — client list, invoice calculation breakdown and settlement summary',
    },
  },
  {
    id: 'yuzu',
    /* This page's accent: 8.24:1 on the page's black. */
    accent: '#2fbf5f',
    /*
      Green with a yellow accent, which is how its own screenshot reads: a green
      field with the citrus coins catching the light.

      Green is the deep end and therefore most of the card — the 160deg ramp puts
      the yellow in one corner rather than across the middle. Not the lime-green
      the shot averages to, which reads unripe at this size.
    */
    tint: ['#0e7a3a', '#d4c200'],
    href: '/work/yuzu',
    visual: 'orbit',
    number: '03',
    domain: 'Fintech',
    title: 'Yuzu Money',
    description:
      'End-to-end Web3 architecture (FE, BE, Infra, Smart Contracts) for a crypto project curating on-chain structured products, with over USD 50 million in assets under management.',
    logo: { src: '/assets/brand/yuzu-icon.png', alt: 'Yuzu Money' },
    shot: {
      src: '/assets/work/yuzu.webp',
      alt: 'Yuzu Money — the Yuzu logo over the dashboard, with total balance, savings and a growth chart, flanked by the transaction history and the Earn screen',
    },
  },
  {
    id: 'telesales-sip',
    /* This page's accent: 6.18:1 on the page's black. */
    accent: '#5f8cf5',
    /*
      Blue with an orange accent — the pairing telecom has always used, and the
      one thing that tells this card apart from the other two blues at a glance.

      The two are opposite on the wheel, so the ramp above holding the blue to
      38% is doing real work here: it keeps the desaturated crossing between them
      down to one corner instead of across the middle of the card.
    */
    /*
      The warm end is #f4601e, not #f0892a. It was reading brown, and the fix is
      HUE, because nothing else is available.

      `background-blend-mode: color` takes hue and saturation from the tint and
      LIGHTNESS FROM THE PICTURE — so a lighter orange here changes nothing at
      all, and the card then runs through `filter: brightness(0.6)`. Computed on
      the real artwork, the warm corner averages rgb(166, 82, 6) at luminance
      98.5, and every candidate orange lands at saturation 1.0 and value 0.40.
      Saturated, dark and at hue 29 is the definition of brown.

      Hue 19 is the one axis left. It resolves to #7b2600 — value 0.48 rather
      than 0.40, and far enough off tan to read as burnt sienna. Rust against
      indigo is also a pairing that holds up, which the muddier orange did not.
    */
    tint: ['#1b3fc8', '#f4601e'],
    href: '/work/telesales-sip',
    visual: 'call',
    number: '04',
    domain: 'Telecom',
    title: 'Telesales SIP',
    description:
      'Outbound telesales portal integrated with SIP trunk providers. Supports batch dialing, call routing, and agent management for high-volume sales teams.',
    shot: {
      src: '/assets/work/telesales-sip.webp',
      alt: 'Telesales SIP agent portal — active call channels with auto-dial on and an upcoming queue of pending numbers',
    },
  },
  {
    id: 'digital-collectibles',
    /* This page's accent: 6.06:1 on the page's black. */
    accent: '#8b7cff',
    /*
      Indigo, off the app icon in its own screenshot rather than off the shot as
      a whole — sampled, the icon's violet clusters at hue 245 (#5850e2) over a
      deep blue ground at 220 (#06265d). The card was reading sky-cyan because
      the average of the whole image is dominated by that ground.
    */
    tint: ['#2a2bb8', '#6b5cf0'],
    href: '/work/digital-collectibles',
    visual: 'cube',
    number: '05',
    domain: 'Web3 Consumer',
    title: 'Digital Collectibles',
    description: 'Consumer-facing digital collectibles marketplace and trading platform.',
    shot: {
      src: '/assets/work/digital-collectibles.webp',
      alt: 'My collectibles — graded-card marketplace with price and grade filters, a portfolio valuation, and the agent dashboard',
    },
  },
  {
    id: 'poker',
    /* This page's accent: 10.24:1 on the page's black. */
    accent: '#e8b23c',
    /* Amber into gold, off the felt and chips in its shot. */
    tint: ['#b06a16', '#e8b23c'],
    href: '/work/poker',
    visual: 'cards',
    number: '06',
    domain: 'Real-Time Gaming',
    title: 'Poker App',
    description: 'Real-time multiplayer poker with matchmaking and tournament support.',
    shot: {
      src: '/assets/work/poker.webp',
      alt: 'Poker app — NLH and OFC tables, the lobby with sit-and-go and friends play, the chip store and the reward calendar',
    },
  },
];

/*
  `scale` is optical balancing, and it is measured rather than eyeballed.

  Each file was drawn to a canvas and two things taken from it: the aspect ratio
  of its ink box, and what fraction of that box is actually ink. Their product is
  how much mark a logo carries per unit of height —

    anboto     5.97 wide x 40% ink  = 2.41   the heaviest
    perennial  6.15      x 36%      = 2.19
    btse       3.34      x 46%      = 1.54
    fordefi    4.55      x 33%      = 1.49
    accountable 5.71     x 24%      = 1.35
    treehouse  2.96      x 23%      = 0.68
    hypernative 4.10     x 25%      = 1.02   (see below)

  Equalising ink area exactly means scaling by the inverse square root of that,
  which at one point put Hypernative at 2.2x Anboto and looked broken — the eye
  does not weigh a compact glyph against a long wordmark that literally. These
  use the inverse FOURTH root, clamped to 0.80-1.45, which corrects most of the
  gap and leaves the row reading as one line.

  Hypernative was the reason that clamp had to exist. Its logo here was the
  brand's STACKED lockup — mark over wordmark, 1.12 wide — against six
  horizontal ones, so the correction was carrying a shape mismatch rather than
  an ink difference. It is now the brand's own horizontal logotype at 4.10, which
  is inside the 2.96-6.14 the others span, and its scale fell from 1.46 to
  ordinary.
*/
export const partners: Partner[] = [
  { name: 'Fordefi', logo: '/assets/partners/w-fordefi.png', scale: 0.92 },
  { name: 'Hypernative', logo: '/assets/partners/w-hypernative.svg', scale: 0.96 },
  { name: 'Accountable', logo: '/assets/partners/w-accountable.png', scale: 0.94 },
  { name: 'BTSE', logo: '/assets/partners/w-btse.png', scale: 0.91 },
  { name: 'Perennial', logo: '/assets/partners/w-perennial.png', scale: 0.84 },
  { name: 'Anboto', logo: '/assets/partners/w-anboto.png', scale: 0.82 },
  { name: 'Treehouse', logo: '/assets/partners/w-treehouse.png', scale: 1.12 },
];
