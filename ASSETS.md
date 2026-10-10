# Assets

The repo ships with **generated grey placeholders** so a fresh clone runs
immediately. Replace them with the real media before launch.

```bash
npm run assets:fetch            # pull everything
npm run assets:fetch -- --force # re-download, overwriting existing files
```

Source origin defaults to the deployed site and can be overridden with
`ASSET_SOURCE_ORIGIN` (see `.env.example`).

---

## Manifest

### Video — `public/assets/video/`

| File | Used by | Source path | Notes |
| --- | --- | --- | --- |
| `hero-loop-audio.mp4` | `Hero` | `/assets/hero-loop-audio.mp4` | Has an audio track — the sound toggle depends on it |
| `philosophy.mp4` | `Philosophy` | `/assets/philosophy2.mp4` | Renamed on the way in |
| `contact-bg.mp4` | `Contact` | `/assets/contact-bg.mp4` | Silent |

Video files are **gitignored by default** (see `.gitignore`) so the repo stays
light. Comment those lines out if you'd rather commit them.

### Video posters — `public/assets/video/`

These do not exist on the original site, so there is nothing to download —
they have to be rendered from the videos. One command does all three:

```bash
npm run posters:make      # or: npm run assets:all  (fetch + posters)
```

ffmpeg comes from the `ffmpeg-static` devDependency, so `npm install` is the
only prerequisite. A system ffmpeg on PATH is used as a fallback if that
package is ever removed.

Each grabs the frame at **1.5s**, not 0s — all three clips open on a black
frame, so a naive `-vframes 1` produces a black poster. Timestamps, source
dimensions and durations in `scripts/make-posters.mjs` were verified against
the real videos.

### Video weight — `philosophy.mp4` re-encoded

As served by the deployed site, the three clips totalled **~40 MB**, and
`philosophy.mp4` was 34.5 MB of it — eight times the hero. It sits in an
896px-wide frame, so it was being served at more than double the resolution it
is ever displayed at, for 28 seconds of footage behind a scrim.

| File | Size (source → repo) | Dimensions | Duration |
| --- | --- | --- | --- |
| `hero-loop-audio.mp4` | 4.1 MB — unchanged | 1920×824 | 6.5s |
| `philosophy.mp4` | **34.5 MB → 2.9 MB** | 1920×1068 → 1280×712 | 28.0s |
| `contact-bg.mp4` | 1.7 MB — unchanged | 1280×720 | 10.0s |

Total is now **8.8 MB** including poster frames. The re-encode:

```bash
cd public/assets/video
ffmpeg -i philosophy.mp4 -vf scale=1280:-2 -c:v libx264 -crf 28 \
  -preset slow -an -movflags +faststart philosophy.opt.mp4
mv philosophy.opt.mp4 philosophy.mp4
```

Note the temp file — ffmpeg refuses to write its output over its own input.
Frames compared at the 896px display width show no visible difference. The
source had no audio track, so `-an` only guards against re-adding one.

**The other two were left alone deliberately.** Re-encoding
`hero-loop-audio.mp4` at visually-lossless settings produced a *larger* file
(4.5 MB), meaning the source is already efficiently compressed; anything
smaller trades real quality on the first thing a visitor sees.
`contact-bg.mp4` only dropped to 1.4 MB — not worth a generation of loss.

**`npm run assets:fetch` will not undo this** (it skips files already
present), but `assets:fetch --force` re-downloads the 34.5 MB original. Re-run
the command above if you ever do that. Add a WebM/AV1 source alongside if you
want to go further.

### Why Velocity backdrop — `public/assets/why/`

| File | Source path | Native size |
| --- | --- | --- |
| `vscode-bg.png` | `/assets/vscode-bg.png` | 3000 × 3120 |

Rendered `object-fit: cover` behind the whole pinned section, heavily blurred
and brightened (see `WhyBackdrop.tsx`). Because it is blurred to 6.5px there
is no need to ship it at full resolution — consider downscaling to ~1200px
wide and re-exporting as WebP. It will look identical and save ~90% of the
bytes.

### Project brand marks — `public/assets/brand/`

`novaland.png` · `btse-blue.png` · `yuzu-icon.png`

Referenced from `src/content/work.ts`. Three of the six projects have no
logo on the original — the card layout handles that case.

### Partner logos — `public/assets/partners/`

`w-fordefi.png` · `w-accountable.png` · `w-btse.png` · `w-perennial.png`
`w-anboto.png` · `w-treehouse.png` · `w-hypernative.svg`

`w-hypernative.svg` is the odd one out, and deliberately. It is Hypernative's
own horizontal logotype, taken from their site, with its one gradient path
flattened to white so the row stays monochrome like the other six. It replaced a
PNG of their STACKED lockup, which was 1.12 wide against the others' 2.96-6.14
and could only be made to fit by inflating its optical scale. It is also not
listed in `scripts/fetch-assets.mjs`: that script pulls from the deployed site,
which still serves the old stacked PNG.

Referenced from `src/content/work.ts`. Rendered white-on-transparent at ~32px
tall, desaturated until hover. The marquee duplicates the array internally —
list each logo once.

### Social — `public/opengraph-image.png` — **TODO**

Currently a flat 1200×630 placeholder. Needs a real card.

---

## Adding a new partner logo

1. Drop the file into `public/assets/partners/`
2. Append to `partners` in `src/content/work.ts`
3. Add the pair to `ASSETS` in `scripts/fetch-assets.mjs` if it should be
   fetchable

No component changes required.

## Guidelines

- **Logos:** PNG with transparency, ~2× the render size (so ~160px tall)
- **Video:** H.264 MP4, web-optimised (`-movflags +faststart`). Keep the hero
  under ~5 MB — it is on the critical path
- **Everything under `public/assets/`** is served with a one-year immutable
  cache header (`next.config.ts`). Change the filename when you change the
  file
