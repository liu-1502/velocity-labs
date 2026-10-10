import type { NavLink } from '@/types';

/**
 * Global site config + copy.
 * Edit here, not inside components.
 */

export const siteConfig = {
  name: 'Velocity Labs',
  /** Rendered in the header as "velocity" + accent dot + "labs". */
  wordmark: { first: 'velocity', second: 'labs' },
  title: 'Velocity Labs — Engineered for Outcomes',
  description:
    'Founders building alongside founders — from architecture to launch. A results-driven product studio shipping fintech, gaming and web3 platforms.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://velocity-labs.tech',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@velocity-labs.tech',
  locale: 'en_US',
} as const;

export const navLinks: NavLink[] = [
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Team', href: '#team' },
  { label: 'Work', href: '#work' },
  { label: 'Why Us', href: '#why' },
  { label: 'Get in Touch', href: '#contact', cta: true },
];

export const heroContent = {
  /**
   * The headline animates: "Output" strikes through, "Outcomes" writes in.
   * Both strings are kept here so copy changes never touch the component.
   */
  headline: {
    /** Two lines, each masked and rising independently. */
    line1: 'Engineered',
    line2: 'for',
    struck: 'Output',
    replacement: 'Outcomes',
  },
  subhead: 'Founders building alongside founders - from architecture to launch.',
  /*
    "Start a project", not "Get started".

    "Get started" is self-serve language: it promises a thing you begin using.
    There is nothing here to begin — the button scrolls to a section that says
    "come build with us" and ends at `mailto:`. A label that describes an action
    its destination does not perform is the one copy fault worth fixing on a
    page like this.

    It names the reader's goal rather than the mechanism, and it sets the right
    weight: heavier than "get started", which sounds free and reversible, and
    lighter than "Book a call", which promises a diary entry this site cannot
    make. Revisit "Book a call" if a scheduler is ever added — it filters harder
    and that is usually worth more to an agency than the extra clicks.

    It also stays distinct from the header and closing CTAs, which both say "Get
    in Touch". Those are the channel; this is the invitation.
  */
  actions: [
    { label: 'Start a project', href: '#contact', variant: 'accent' as const },
    { label: 'See our work', href: '#work', variant: 'ghost' as const },
  ],
  video: {
    src: '/assets/video/hero-loop-audio.mp4',
    poster: '/assets/video/hero-loop-poster.jpg',
  },
} as const;

export const contactContent = {
  kicker: 'Get in Touch',
  headline: { lead: 'What matters to you,', emphasis: 'matters to us' },
  subhead: 'We want to hear from you, come build with us!',
  cta: { label: 'Get in Touch' },
} as const;

export const footerContent = {
  copyright: (year: number) => `© ${year} Velocity Labs. All rights reserved.`,
} as const;
