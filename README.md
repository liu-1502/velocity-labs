# Velocity Labs — Marketing Site

Single-page marketing site for Velocity Labs, rebuilt as a maintainable
component-driven codebase.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · Lenis

---

## Quick start

```bash
nvm use                 # Node 20.11+
npm install
npm run assets:fetch    # pull the real video/logo files (see ASSETS.md)
npm run dev             # http://localhost:3000
```

The repo ships with lightweight placeholder images so `npm run dev` works
immediately on a fresh clone. Run `assets:fetch` to replace them with the
production media.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run check` | typecheck + lint + format check — **run before pushing** |
| `npm run assets:fetch` | Download media into `public/assets` |
| `npm run fonts:sync` | Re-vendor the self-hosted `.woff2` files |

## Project structure

```
src/
├── app/
│   ├── layout.tsx        Root shell: fonts, metadata, header/footer
│   ├── page.tsx          Section composition — the whole page order
│   ├── globals.css       ★ Design tokens + base styles
│   ├── fonts.ts          Self-hosted font definitions
│   ├── fonts/            Vendored .woff2 files (committed)
│   ├── sitemap.ts        robots.ts, not-found.tsx
│
├── components/
│   ├── ui/               Reusable primitives — no page-specific logic
│   ├── layout/           Header, Footer, ScrollProgress, Wordmark
│   └── sections/         One folder/file per page section
│
├── content/          ★ ALL copy lives here. No strings in components.
├── hooks/                useScrolled, useScrollLock, useRotatingIndex
├── lib/                  cn() helper, shared motion vocabulary
└── types/                Shared content interfaces
```

★ = the two places you'll edit most.

---

## The two rules

**1. Copy changes go in `src/content/`, never in a component.**

Every string on the page — headings, bullet points, button labels, project
descriptions — is defined in a typed content file. Adding a project means
appending one object to `src/content/work.ts`; the grid picks it up.

**2. Style changes go through tokens in `globals.css`, never as hex literals.**

Colours, type scale, radii, easing and spacing are declared once in the
`@theme` block. Tailwind v4 turns them into utilities automatically —
`--color-accent` becomes `bg-accent`, `text-accent`, `border-accent`.
Change the brand orange in one place and the whole site follows.

## Component library

Everything in `src/components/ui/` is page-agnostic and reusable:

| Component | Purpose |
| --- | --- |
| `Container` | Horizontal bounds + gutter. `width="narrow"` for text blocks. |
| `Section` | Semantic section with the standard vertical rhythm. |
| `SectionHeading` | Kicker + headline + lede. Splits the accent word out. |
| `Kicker` | The small uppercase label above headings. |
| `Button` | CTA primitive. Renders `button` / `Link` / `a` automatically. |
| `Card` | Bordered surface, optional hover lift. |
| `Reveal` / `RevealGroup` / `RevealItem` | Scroll-triggered entrances. |
| `Marquee` | Infinite logo scroller. Seamless at any content width. |
| `VideoBackdrop` | Full-bleed looping video bed with scrim. |

### Adding a section

```tsx
// 1. content/services.ts — define copy
export const servicesContent = { kicker: 'Services', /* … */ };

// 2. components/sections/Services.tsx — compose primitives
export function Services() {
  return (
    <Section id="services" spacing="lg">
      <Container>
        <SectionHeading kicker={servicesContent.kicker} lead="What we" emphasis="do" />
      </Container>
    </Section>
  );
}

// 3. app/page.tsx — drop it in the order you want
// 4. content/site.ts — add { label: 'Services', href: '#services' } to navLinks
```

## Motion

All timing lives in `src/lib/motion.ts`. Components import `fadeUp`,
`transitions.base`, `EASE_OUT_EXPO` rather than defining their own values,
so the whole site moves with one personality.

Two sections use **pinned scroll** (a tall outer element with a `sticky`
inner panel, driven by `useScroll`):

- `Philosophy` — `h-[200vh]`
- `Why` — `h-[220vh]`

To make either pin longer or shorter, change only that height class.

### Smooth scrolling (Lenis)

`SmoothScroll` (mounted once in the root layout) runs Lenis with the same
settings as the original — `duration: 1.1`, `smoothWheel: true`, Lenis's
stock easing. This is what gives the page its momentum/glide; without it
the scroll-driven sections feel noticeably more mechanical.

Three things are wired around it, and they matter:

- **Anchors go through `lenis.scrollTo()`.** A native jump fights the
  interpolation. The 78px header clearance comes from
  `scroll-padding-top: 5rem` in `globals.css` — Lenis honours it, so no
  offset is passed in JS. Keep that value in one place; setting both
  double-counts and drops targets ~80px too low.
- **`scroll-behavior` is `auto`, not `smooth`.** Native smooth-scroll and
  Lenis fight each other.
- **Scroll locking must stop Lenis too.** `overflow: hidden` alone does not
  stop it — see `src/lib/lenis.ts` and `useScrollLock`.

Lenis is skipped entirely under `prefers-reduced-motion`, which is also
honoured globally in `globals.css` and checked in the video and rotator
components.

## Accessibility

- Skip-to-content link, visible on keyboard focus
- Visible focus rings on all interactive elements (`:focus-visible`)
- Decorative video and the rotating tech word are `aria-hidden`; the full
  tech list is available to screen readers via an `sr-only` list
- Mobile nav manages `aria-expanded` / `aria-controls` and locks body scroll

## Deployment

Zero-config on Vercel. Set the env vars from `.env.example` in the project
settings. Everything prerenders as static — there are no server-side data
dependencies.

If you want a fully static export, uncomment `output: 'export'` in
`next.config.ts` (valid as long as no Route Handlers are added later).

## Known gaps

See `HANDOFF.md` for the list of things that need a decision or the real
source files before launch.
