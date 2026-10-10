# Work — horizontal rail

Snapshot of the Work section as it stood on 2026-10-08, taken before the
six-card grid replaced it. This is the layout to restore when "layout ngang" —
the horizontal one — is asked for.

What it is: a pinned stage where vertical scroll drives a row of six cards
sideways, each card scaling from `MIN_SCALE` at the edges up to full size as it
passes the middle of the rail.

## Restoring it

`Pillars.tsx` was never deleted — it is still on disk at
`src/components/sections/work/Pillars.tsx`, unused. Switching back is one change
in `Work.tsx`: render `<Pillars>` around the `.section-head` again instead of
`<WorkGrid />`.

All of the rail's CSS is still in `site.css` too (`.work-track`, `.work-stage`,
`.work-spacer`, `.pillar-rail`, `.pillars`, `.pillar*`). It is inert without the
markup, and leaving it there is what keeps the switch to one line.

So the `.bak` files here are a belt-and-braces copy rather than the only record:

| File | Was |
| --- | --- |
| `Pillars.tsx.bak` | `src/components/sections/work/Pillars.tsx` |
| `Work.tsx.bak` | `src/components/sections/work/Work.tsx` |
| `site.css.bak` | `src/app/site.css` — the WHOLE stylesheet |

`site.css.bak` is the entire file as of the snapshot, so restoring it wholesale
would roll back every other section too. Take only what you need out of it.

The `.bak` extension keeps these out of `tsconfig.json`'s `**/*.tsx` include, so
nothing here is typechecked or bundled.
