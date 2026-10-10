import type { Stat } from '@/types';

export const whyContent = {
  /*
    The full-screen title card that opens the section.

    Set big enough to run the width of the gutter box and drop stacked copies of
    itself on scroll — solid white at the front, outlined behind. `[…]` marks the
    run that takes the accent colour, which only the front copy shows: the ones
    behind it are outlines, and an orange outline among grey ones would read as a
    highlight rather than as an echo.
  */
  intro: 'Why [Velocity]?',
  /*
    The centre of the tech field.

    Reworded away from the bare label "Build with" the scrubbing list used: a
    list reads as an inventory, so the label only had to name it. A field of
    marks already says WHAT we use, which leaves the middle free to say why it
    matters — that the stack is one we are fluent in, and that fluency is what
    makes the six-month MVP above believable.
  */
  stack: {
    /* Small badge over the headline; the number is `techStack.length`. */
    badgeLabel: 'tools',
    /* One string per line; `[…]` marks the run that takes the accent colour. */
    headline: ['Built with the tools', '[we know cold], so', 'nothing slows the build'],
  },
  headline: { lead: 'Built different,', emphasis: 'on purpose' },
} as const;

/**
 * Every technology the field is built from, in the order it fills the tiles.
 *
 * Alphabetical, so the field is reproducible rather than arranged by eye, and
 * so adding one is a single line in the right place. An entry with artwork in
 * `techLogos` below shows its mark; one without shows its name set as a
 * wordmark, which is why the two that have no obtainable logo are still here.
 */
export const techStack: string[] = [
  'AWS',
  'Claude Code',
  'CloudSQL',
  'Figma',
  'GCP',
  'GitHub Copilot',
  'Go',
  'JavaScript',
  'NodeJS',
  'Postgres',
  'RabbitMQ',
  'React',
  'Solidity',
  'SQL',
  'TailwindCSS',
  'TypeScript',
];

/**
 * Optional logo per technology, shown inside that entry's tile. A name with no
 * entry here falls back to its own name set as a wordmark, so the field is
 * complete whether or not the artwork exists.
 *
 * Keyed by the strings in `techStack` above, so the two cannot drift apart
 * silently: a typo here is a missing logo, never a wrong one.
 *
 * Thirteen of these are Simple Icons (simpleicons.org, CC0 collection) pulled as
 * white monochrome, which is the convention the client logos in
 * `public/assets/partners` already follow. AWS is not in Simple Icons — Amazon
 * had it removed — so it comes from devicon and was recoloured from #f90 to
 * white to match the rest; white-on-dark is the standard reversed treatment.
 *
 * The marks remain their owners' trademarks. Using them to say "we build with
 * this" is ordinary, but if any of them ends up next to something that could
 * read as an endorsement, check that owner's brand page first.
 */
export const techLogos: Record<string, string> = {
  AWS: '/assets/tech/aws.svg',
  'Claude Code': '/assets/tech/claude.svg',
  Figma: '/assets/tech/figma.svg',
  GCP: '/assets/tech/gcp.svg',
  'GitHub Copilot': '/assets/tech/github-copilot.svg',
  Go: '/assets/tech/go.svg',
  JavaScript: '/assets/tech/javascript.svg',
  NodeJS: '/assets/tech/nodejs.svg',
  Postgres: '/assets/tech/postgres.svg',
  RabbitMQ: '/assets/tech/rabbitmq.svg',
  React: '/assets/tech/react.svg',
  Solidity: '/assets/tech/solidity.svg',
  TailwindCSS: '/assets/tech/tailwindcss.svg',
  TypeScript: '/assets/tech/typescript.svg',
  /*
    CloudSQL and SQL have no entry on purpose.

    CloudSQL is a Google Cloud PRODUCT, not a brand of its own — its icon ships
    only in Google's own product-icon pack. Pointing it at the Google Cloud mark
    would put the same logo on two different tiles.

    SQL is a language, not a company. There is nothing to show.

    Both still appear in the field, as wordmarks rather than as marks.
  */
};

export const stats: Stat[] = [
  {
    id: 'mvp',
    value: '6 Mo.',
    label: 'Zero to MVP',
    description: 'Our target for getting a production-ready MVP out the door.',
  },
  {
    id: 'expertise',
    value: 'CTO-Level',
    label: 'Expertise',
    description: 'Senior engineers with real experience leading every engagement.',
  },
  {
    id: 'clientele',
    value: 'Selective',
    label: 'Clientele',
    description: 'We take on a few projects at a time so we can actually focus.',
  },
  {
    id: 'delivery',
    value: 'Early',
    label: 'Delivery',
    description: 'We aim to ship ahead of schedule, not behind.',
  },
];
