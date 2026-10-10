"""Generate the philosophy plate: the wordmark written in a working-week grid.

    python3 scripts/build-cadence-grid.py public/assets/img/cadence-grid.svg

No input data beyond the project's own font file. The letterforms are rasterised
from `src/app/fonts/space-grotesk-600.woff2` — the same face and weight the
header wordmark is set in — and every other cell is computed from a seeded model
of a week, so the file is reproducible: run it twice and you get the same bytes.

WHAT THIS IS, AND WHAT IT IS NOT
It is a PATTERN in the shape of a contribution graph with the wordmark written
through it: seven rows to a band, weekdays dense and weekends thin, and
"velocity.labs" carried at full strength across the middle. It is not a record of
anything. Nothing here is derived from a repository, and the output carries no
dates, no axis, no counts and no legend, because the moment it carried any of
those it would stop being a texture and start being a chart — and a chart drawn
from a model is a fabricated figure. It renders at 0.36 opacity behind the copy.

WHY IT REPLACED THE WORLD MAP
The section argues about method: "Six things we do on every project", "a
practice with a name, a cadence, and someone responsible for it". A world map
answers a question that page never asks — where we are — and implies a reach the
copy never claims. This answers the question the copy DOES ask, and signs it.

THE GRID IS THE OLD GRID
Same 13.4 square on the same 16.25 pitch, same 126 x 71 cells, same viewBox, so
the plate sits in exactly the same frame at the same scale and nothing in the
section moves. 71 rows is the part that made the banding fit: seven days to a
band plus a one-row gutter packs as 9 x 7 + 8 = 71 exactly, with nothing left
over at either edge.
"""
import math
import sys

from PIL import Image, ImageDraw, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else "public/assets/img/cadence-grid.svg"

# The old map's geometry, unchanged — see the module docstring.
COLS, ROWS = 126, 71
PITCH, SIDE = 16.25, 13.4

DAYS = 7
GUTTER = 1
BANDS = (ROWS + GUTTER) // (DAYS + GUTTER)  # 9
assert BANDS * DAYS + (BANDS - 1) * GUTTER == ROWS, "bands must fill the grid exactly"

# ---- the wordmark ---------------------------------------------------------

FONT = "src/app/fonts/space-grotesk-600.woff2"
WORD = "velocity.labs"

"""
Supersample before deciding which cells are ink.

A glyph edge almost never lands on a cell boundary, so the question for every
cell is how MUCH of it the letter covers, not whether a single sample point
happens to be inside. 8 x 8 subsamples per cell answers that to about 1.5%,
which is finer than the threshold is sensitive to.

0.42 rather than a half: Space Grotesk at this size puts a stem a little under a
cell and a half wide, and at 0.5 the lighter side of every stem dropped out, so
the thin strokes came through broken while the thick ones stayed solid.
"""
SUPERSAMPLE = 8
COVERAGE = 0.42

"""
How much of the plate's width the word spans.

0.96 — the whole plate, including the part of it the pillar copy stands on.

Fitting the word to the CLEAR left region instead was the obvious idea and it
does not work. The copy column starts at 60% of the drawn plate, so the word
would have to run at 0.58, and at 0.58 it is 231 cells rather than 638: cap
height falls to about six, the counters in `o`, `e` and `a` close up, and the
word has to be decoded rather than read. A wordmark that is legible across two
thirds of its length beats one that is illegible across all of it.

So the tail of it passes under the copy, which is what a watermark at page scale
does. "velocity" reads in the clear.
"""
WORD_WIDTH = 0.96


def word_mask():
    """Which cells the wordmark covers, as a list of bytearrays."""
    w, h = COLS * SUPERSAMPLE, ROWS * SUPERSAMPLE

    """
    Fit by measuring, not by solving.

    The relation between point size and rendered width is very nearly linear but
    not exactly — hinting and integer advances make it a staircase — so one
    linear estimate lands a per cent or two out. Measure, scale, measure again:
    the second pass is inside a pixel at this size.
    """
    size = 100
    font = ImageFont.truetype(FONT, size)
    for _ in range(2):
        box = font.getbbox(WORD)
        size = max(1, round(size * (w * WORD_WIDTH) / (box[2] - box[0])))
        font = ImageFont.truetype(FONT, size)

    img = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(img)

    """
    Centred on the INK, not on the line box.

    "velocity.labs" has no capitals and no ascenders above the `l` and `b`, and
    one descender in the `y`. Its line box is therefore mostly empty air, and
    centring that put the visible word noticeably high in the plate.
    """
    box = font.getbbox(WORD)
    draw.text(((w - (box[2] - box[0])) / 2 - box[0],
               (h - (box[3] - box[1])) / 2 - box[1]), WORD, font=font, fill=255)

    px = img.load()
    cells = [bytearray(COLS) for _ in range(ROWS)]
    need = COVERAGE * SUPERSAMPLE * SUPERSAMPLE * 255
    for r in range(ROWS):
        for c in range(COLS):
            total = 0
            for sy in range(SUPERSAMPLE):
                for sx in range(SUPERSAMPLE):
                    total += px[c * SUPERSAMPLE + sx, r * SUPERSAMPLE + sy]
            if total >= need:
                cells[r][c] = 1
    return cells


def halo(mask):
    """One empty cell around every letter cell.

    Without it the field runs straight up to the strokes and fills the counters —
    the hole in the `o`, the gap in the `e` — and those are exactly the features
    a reader uses to tell one round letter from another. A single cell of
    clearance is enough at this size, and it costs about 5% of the field.
    """
    out = [bytearray(COLS) for _ in range(ROWS)]
    for r in range(ROWS):
        for c in range(COLS):
            if mask[r][c]:
                continue
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    rr, cc = r + dr, c + dc
                    if 0 <= rr < ROWS and 0 <= cc < COLS and mask[rr][cc]:
                        out[r][c] = 1
                        break
                else:
                    continue
                break
    return out


# ---- the field ------------------------------------------------------------

"""
How likely a day is to be worked at all.

Monday to Friday carry the week; Saturday and Sunday are the thin pair that make
a contribution graph instantly readable as one — without the quiet rows at the
foot of each band the thing is just noise on a grid. They are not empty, because
a studio that never shipped at a weekend would be the less believable picture.
"""
DAY_WEIGHT = (1.0, 1.0, 1.0, 1.0, 0.96, 0.28, 0.18)

"""
The swell across the columns: a slow rise and fall, not a sprint stripe.

A two-week cycle — the obvious reading of "cadence" — lands on a grid whose
columns ARE weeks, so it comes out as hard vertical banding. 26 columns is long
enough that the eye reads it as the year breathing rather than as a pattern it
can count, and 0.22 is shallow enough that no column is ever empty.

Each band gets its own phase, or all nine rise and fall together and the plate
develops vertical stripes down its whole height.
"""
SWELL_PERIOD = 26.0
SWELL_AMP = 0.22
BAND_PHASE = 0.37  # turns per band, irrational enough not to repeat in nine

"""
The field is QUIETER than the word, in both density and tone.

The wordmark is drawn at full strength and the field tops out at 0.32 — THREE
TIMES the gap it first had, and the figure this artwork lives or dies on.

The first attempt put the field at 0.3/0.5/0.72 against a word at 1.0, which on
paper is a comfortable separation and on the page was none at all. The plate
renders at 0.36 opacity: 0.72 and 1.0 both composite into the same narrow band
of grey up there, the difference between them falls under what the eye resolves
against a busy backdrop, and the word simply was not visible. Checked on the
rendered page, not in the file.

So the field goes down rather than the word coming up, because the word is
already at the ceiling. At 0.32 the brightest field cell is a third of the
letters and the mean is a fifth, which is separation the 0.36 pass cannot close.

The cost is weight: this lands around 1,500 full-cell equivalents against the
2,794 the world map carried, so the plate is quieter than what it replaces. That
is the right trade. A plate matching the old ink is one where the wordmark
cannot be read, and the wordmark is the entire reason for the artwork.
"""
DENSITY = 0.78
FIELD_TONES = (0.14, 0.22, 0.32)
WORD_TONE = 1.0


def rng(seed):
    """A seeded LCG — the numerical recipes constants.

    Deterministic by design: the plate is checked into the repository, so the
    script has to produce the same file every time or every run shows up as a
    diff. Python's own `random` would do, but its stream is an implementation
    detail across versions and this is four lines.
    """
    state = seed

    def next_float():
        nonlocal state
        state = (1664525 * state + 1013904223) % (1 << 32)
        return state / (1 << 32)

    return next_float


word = word_mask()
clear = halo(word)
rand = rng(20251010)
cells = []

for band in range(BANDS):
    top = band * (DAYS + GUTTER)
    phase = band * BAND_PHASE
    for col in range(COLS):
        swell = 1.0 + SWELL_AMP * math.sin(2 * math.pi * (col / SWELL_PERIOD + phase))
        for day in range(DAYS):
            row = top + day
            if word[row][col] or clear[row][col]:
                continue
            p = DAY_WEIGHT[day] * swell * DENSITY
            if rand() >= p:
                continue
            """
            Tone follows the same probability that decided the cell.

            A busy day in a busy week is darker than a day that only just made
            it in, which is what gives the bands their grain. Drawing the tone
            independently would scatter the darkest cells evenly and flatten the
            swell back out.
            """
            r = rand()
            heat = min(p, 1.0)
            if r < heat * 0.42:
                tone = FIELD_TONES[2]
            elif r < heat * 0.78:
                tone = FIELD_TONES[1]
            else:
                tone = FIELD_TONES[0]
            cells.append((col, row, tone))

"""
The word goes in last, and it ignores the banding.

A gutter row crossing a letter would cut it in half — the word runs through rows
the field leaves empty, so it has to be written over the structure rather than
inside it. That is also what makes it read as a signature ON the plate rather
than as an unusually busy fortnight.
"""
for r in range(ROWS):
    for c in range(COLS):
        if word[r][c]:
            cells.append((c, r, WORD_TONE))

w = (COLS - 1) * PITCH + SIDE
h = (ROWS - 1) * PITCH + SIDE

parts = [
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" '
    f'fill="currentColor" role="img" '
    f'aria-label="The velocity.labs wordmark written across a grid of squares">'
]

"""
Grouped by tone rather than written cell by cell.

`fill-opacity` inherits, so one attribute on a `<g>` covers every rect inside
it. Per rect it was 22 characters on four thousand of them — a third of the
file, for four distinct values. Nothing about the drawing changes; the groups do
not overlap and rects do not blend with each other.
"""
for tone in (*FIELD_TONES, WORD_TONE):
    group = [c for c in cells if c[2] == tone]
    if not group:
        continue
    parts.append("<g>" if tone == 1.0 else f'<g fill-opacity="{tone}">')
    for col, row, _ in group:
        parts.append(f'<rect x="{col * PITCH:.1f}" y="{row * PITCH:.1f}" '
                     f'width="{SIDE}" height="{SIDE}"/>')
    parts.append("</g>")
parts.append("</svg>")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("".join(parts))

letters = sum(sum(r) for r in word)
ink = sum(t for _, _, t in cells)
print(f"{OUT}: {len(cells)} squares of {COLS * ROWS} ({len(cells) / (COLS * ROWS):.1%}), "
      f"{letters} of them wordmark, ink equivalent {ink:.0f} full cells, "
      f"viewBox {w:.1f} x {h:.1f}")

if "--preview" in sys.argv:
    for r in range(ROWS):
        print("".join("#" if word[r][c] else ("." if clear[r][c] else " ")
                      for c in range(COLS)))
