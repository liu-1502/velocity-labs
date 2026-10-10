# Handoff Notes

Read this before your first commit. It covers how this codebase relates to the
deployed page, what is verified, and the few places it deliberately differs.

---

## What this is

A Next.js rebuild of the deployed `velocity-labs-revamp` page. The original is
hand-written HTML plus one stylesheet, with GSAP ScrollTrigger and Lenis driving
the scroll work.

**Source of truth is the live page**, and the goal is parity — not a
reinterpretation. Section offsets, document height, computed styles and the
scroll sequences were measured against production and matched value for value.

## How the styling is organised

Two stylesheets, and the split matters:

- **`src/app/globals.css`** — design tokens (`@theme`) and base element styles.
  Tailwind reads the tokens, so `--color-accent` is usable as `bg-accent`.
- **`src/app/site.css`** — a port of the production stylesheet, keyed to the
  same class names (`.hero`, `.pillar`, `.ws-tagline`, …). Imported after
  globals, so its unlayered rules win over Tailwind's utility layer.

**Why the port exists.** The production sheet grew through fifteen revision
blocks, each overriding the last. An earlier version of this rebuild re-derived
those end values as Tailwind utilities and drifted: overrides several blocks
down got missed, and sections looked close but measured wrong. Keeping the
rules under their original selectors makes the cascade auditable against the
source.

Two things about that file are worth knowing before you edit it:

- Later revision blocks are **collapsed** into the value that actually wins,
  with a comment wherever the history explains a surprising number.
- The media-query blocks are **not in ascending width order**, and must not be
  reordered. Production's order is load-bearing in two places — `.ws-cards`
  going back to two columns at 760 after `.why-grid` went single-column at 560,
  and `.plogo`'s `max-height: 26px` at 560 clamping the `height: 44px` it picks
  up at 620. Both are commented in place.

## Verified against production

Measured at 1440×900, 768×1024 and 390×844, on both pages side by side:

- **Section offsets and document height match exactly.** At 1440×900:
  philosophy 900, team 2880, work 3709, why 4810, contact 10930, total 11924 —
  identical on both. Same at 390×844 (total 12625) and 768×1024 (total 14000).
- **Philosophy expansion**, sampled every 5% of the stage: width, height, top,
  border-radius and heading opacity match at every step (1080×460 → 1440×900,
  radius 24 → 0, heading fading out over the first 26% of the viewport height).
- **Why sequence**, sampled at every phase boundary: list offset, active word
  index, build/backdrop opacity, both tagline halves, tagline fade-out and all
  four card opacities match to rounding.
- **Hero parallax** at 600px of scroll: media `translateY(14.667%)`, content
  opacity 0.5, nav height 65.8125px, progress bar 5.44267% — all identical.
- `npm run check` clean, `npm run build` passes, 6 static routes,
  First Load JS **150 kB**.

## Four things it does NOT copy

Each of these is a production bug or an accessibility gap, so parity was the
wrong call. If you want byte-exact behaviour instead, these are the four places
to change.

| | Production | Here |
| --- | --- | --- |
| Reduced motion, Why cards | The script returns early and never touches them, so they stay at the stylesheet's `opacity: 0` — the four stats are invisible with the OS setting on | Revealed |
| Mobile menu | Sets `body { overflow: hidden }`, which does not stop Lenis, so the page keeps gliding behind the open panel | `useScrollLock` stops Lenis too |
| Keyboard access | No skip link, default focus ring | Skip link + accent `:focus-visible`, both invisible until keyboard use |
| Nav at 861–900px | Section links hidden at ≤900 but the hamburger only appears at ≤860, leaving a 40px band with no navigation at all — just the wordmark and "Get in Touch" | The `≤900` hiding rule is dropped, so the two breakpoints agree: inline links down to 861, panel from 860 |

On that last one: the links fit fine at those widths — at 900 they occupy 405px
of the 810px between the gutters, with 293px still clear of the wordmark, and no
wrapping at 861. The rule reads as a leftover from before the 860px hamburger
existed. Its counterpart in the 860 block went with it; both were no-ops in the
other direction, since `.nav-links` is flex at every width and blockifies its
children regardless. Restoring parity means putting
`.nav-links a:not(.nav-cta) { display: none }` back in the 900 block — and note
that `:not()` carries its argument's class specificity, so a plainer
`.nav-links a { display: block }` cannot override it whatever the source order.
Section offsets and document height are untouched either way; the nav is fixed.

One more, smaller: `useReveal` also checks position on mount. Production's
ScrollTrigger fires from scroll offset, so it reveals content even if you jump
past it; an IntersectionObserver only reports real intersections and would
leave a section stuck at `opacity: 0` after a reload that restores scroll
position, or a deep link to `#contact`.

### Removed on purpose

The hero **eyebrow** — the small pill reading "Results-driven studio" above the
headline — has been deleted at the owner's request. It is present on production,
so do not add it back as a parity fix. Gone with it: `heroContent.eyebrow`, the
`.eyebrow` rule in site.css, and the 0.25s entrance slot in the hero timeline.
Nothing shifted — the hero is `min-height: 100svh` with its content centred, so
the block just re-centres and every downstream section offset is unchanged.

## Fonts — both axes matter

`inter-variable.woff2` is vendored from `@fontsource-variable/inter`'s **opsz**
file, not its `wght` file, and Space Grotesk includes **400**.

Both were real bugs. Production loads Inter with the optical-size axis
(`opsz,wght@14..32,100..900`) and browsers apply `font-optical-sizing: auto` by
default — with the weight-only file, glyphs at the 14.72px used in the
leadership bullets ran wider and one bullet wrapped to a second line, making
the card 22.8px taller than production's. And every kicker, eyebrow, domain
chip and marquee label sets the display face with no `font-weight`, so they all
resolve to Space Grotesk 400; without it they were rendering at a synthesised
weight.

Re-vendor with `npm run fonts:sync`.

## Assets

`npm run assets:all` fetches the real media and renders the poster frames.
ffmpeg comes from the `ffmpeg-static` devDependency, so `npm install` is the
only prerequisite.

`philosophy.mp4` has been re-encoded from 34.5 MB to 2.9 MB (1280×712) — see
`ASSETS.md` for the command and for why the other two clips were left alone.
Note that `assets:fetch --force` re-downloads the 34.5 MB original.

## Layout details that surprise people

- **A `.section`'s content is 1096px wide at desktop, not 1200.** `max-width`
  is 1200 with a `clamp(20px, 5vw, 52px)` gutter and `box-sizing: border-box`,
  so the content box is 1200 − 104. The hero is the exception: its gutter lives
  on `.hero`, so `.hero-inner` really is 1200px. Getting this wrong is what
  made an earlier pass 104px too wide everywhere.
- **The nav shrinks on scroll** — 18px of padding down to 12px, so ~78px down
  to ~66px. Do not give it a fixed height.
- **The nav's two breakpoints used to disagree** — see the fourth row of the
  divergence table above.
- **Anchors land 10px below the viewport top** (`offset: -10`), which means the
  fixed nav overlaps the first pixels of the target section. That is what
  production does; `scroll-padding-top` is deliberately absent so nothing adds
  a second offset.
- **The philosophy clip animates from desktop geometry at every width.** The
  stylesheet has a ≤760px override for the frame, but the script's own values
  overwrite it on the first scroll update. Reproduced as-is.
- **`end: '+=48%'` is 48% of the VIEWPORT height**, not of the trigger. Checked
  against the live page: at 1440×900 the clip reaches full-bleed exactly 432px
  past the stage top.
- **GSAP's easing names are off by one from the maths.** `power1` is quadratic,
  `power2` cubic, `power3` quartic. `lib/motion.ts` has the matching
  cubic-beziers, plus the exact functions (`cubicOut`, `quartOut`, `elasticOut`)
  for the places where a bezier is not close enough.

### The easing curves were the last thing to get right

Every one of these looked correct and measured wrong. If you touch the motion
code, re-measure rather than trusting the shape.

| | Was | Should be |
| --- | --- | --- |
| Scrub catch-up | Exponential at `ln(100)/scrub` — a plausible "99% within scrub seconds" | ScrollTrigger's scrub is a tween on `expo.out`, so the rate is `10·ln2/scrub`. The wrong constant covered 34% of a jump in 41ms where production covers 48%, and settled ~170ms late — the whole page felt laggier |
| `.reveal` | `cubic-bezier(0.165, 0.84, 0.44, 1)`, the conventional easeOutQuart | The real quartic. A cubic bezier cannot be a quartic: it ran ~0.04 low through the middle and hit 0.97 where production was at 0.99 |
| Stat count-up | Quadratic | Cubic — `power2.out` again |

Verified after fixing: the scrub curve is within 1px of production at every
sample of a 216px jump; the reveal is within one frame; the count-up steps
1→6 on the same frames.

## Don't reintroduce this

**Don't centre the Philosophy labels with Tailwind's `-translate-x-1/2`.**
Tailwind v4 compiles translate utilities to the CSS `translate` property, which
is separate from `transform` — so it composes with the `translate(-50%, -50%)`
inside the `floatLbl` keyframes instead of replacing it. The two stack to -100%
and every label sits half its own size up and to the left. Centring is in the
keyframes, in `site.css`, for that reason.

## Conventions

- **No strings in components.** All copy in `src/content/`, typed against
  `src/types/index.ts`.
- **No hex literals in components or in `site.css`.** Both reference the
  `@theme` tokens from `globals.css`.
- **`'use client'` only where needed** — the scroll sequences, the hero, the
  header, the team carousel. `Team`, `Work`, `Partners` and `CareerMarquee` are
  server components; keep them that way.
- Scroll-driven work goes through `useScrollScrub` (pixel offset past an
  element, with an optional catch-up that mirrors ScrollTrigger's `scrub`) and
  `useReveal` (the generic 86%-of-viewport reveal). Reach for those before
  writing another RAF loop.
- Run `npm run check` before pushing.

## Not carried over

- **Analytics / consent banner** — none on production. Add before launch if
  needed.
- **Open Graph image** — `public/opengraph-image.png` is a flat placeholder.

## If you need to re-verify

Both pages side by side, same viewport, and measure rather than eyeball —
that is what caught every real difference here. Note that a **backgrounded tab
throttles `requestAnimationFrame`**, so a scroll sequence measured in a tab
that is not in front will read as completely frozen. Front the tab first.
