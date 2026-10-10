# Why Velocity 1

Snapshot of the Why Velocity section as it stood on 2026-10-01, taken before the
"Build with" block was rebuilt as a centred headline ringed by drifting logo
tiles.

This is the version with:

- a tall masked window scrubbing the 16-name tech list, "Build with" to its left
  and the active name's logo to its right
- the blurred IDE screenshot behind it
- the two-part "Built different, on purpose" tagline
- the four stat cards

## Files

| File | Restores to |
| --- | --- |
| `Why.tsx.bak` | `src/components/sections/why/Why.tsx` |
| `why.ts.bak` | `src/content/why.ts` |
| `site.css.bak` | `src/app/site.css` — the WHOLE stylesheet, not just the Why block |

`site.css.bak` is the entire file as of the snapshot. Restoring it wholesale
would also roll back every other section's CSS, so take only the `WHY VELOCITY`
block and its media-query fragments (`.tr-*`, `.ws-*`, `.why-*`) out of it.

The `.bak` extension keeps these out of `tsconfig.json`'s `**/*.tsx` include, so
nothing here is typechecked or bundled.

## To restore

```bash
cp backups/why-velocity-1/Why.tsx.bak src/components/sections/why/Why.tsx
cp backups/why-velocity-1/why.ts.bak src/content/why.ts
```

…then port the CSS block by hand.
