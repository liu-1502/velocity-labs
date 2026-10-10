"""Generate the philosophy plate: two hands reaching for each other, in squares.

    python3 scripts/build-hands-grid.py public/assets/img/hands-squares.svg
    python3 scripts/build-hands-grid.py out.svg --preview

No input data and no source image. Both hands are built here out of tapered
capsules — forearm, palm, four fingers and a thumb — so the artwork is original
and carries no licence. The reference it was drawn from was a dot-grid picture
used for its CHARACTER, not traced: sparse, lit along the top edge, dissolving
downward, bleeding off the frame at both sides.

WHY HANDS, AND WHY THEY SURVIVE THIS PLATE
The plate renders at `opacity: 0.36` on zinc-800, which measures 3.2:1, over a
grid whose cells are about 7.9 CSS px wide at a 1100px window. Measured, not
estimated. At that contrast and that cell size nothing fine survives: anything
whose meaning lives in detail — a dimension line, a truss member, an annotation
— is resolved into texture by the time it reaches the reader, who is browsing
rather than reading and is taking the plate in peripherally.

Two hands are the opposite case. They are two large closed forms with a gap
between them, and that silhouette is recognised pre-attentively at any contrast
the plate can offer. It also says what the section says: the first pillar is
"Deep collaboration — you get a shared channel with the engineers writing the
code, not an account manager", and the gap between the fingertips is the whole
argument of the section's standfirst, that what goes wrong goes wrong in the way
of working rather than in the code.

THE GRID IS THE OLD GRID
Same 13.4 cell on the same 16.25 pitch, same 126 x 71 cells, same viewBox
2044.7 x 1150.9 as the world map this replaces, so the plate sits in the same
frame at the same scale and nothing in the section moves.
"""
import math
import sys

from PIL import Image, ImageDraw

OUT = sys.argv[1] if len(sys.argv) > 1 else "public/assets/img/hands-squares.svg"

COLS, ROWS = 126, 71
PITCH, CELL = 16.25, 13.4

"""
Supersample before deciding which cells are ink.

A limb edge almost never lands on a cell boundary, so the question for each cell
is how MUCH of it the form covers, not whether one sample point falls inside.
8 x 8 answers that to about 1.5%.

0.38 rather than a half: fingers are only four or five cells across, and at 0.5
the outer row of every finger dropped out — four fingers became three and a
smudge.
"""
SS = 8
COVERAGE = 0.38

# ---- the hands ------------------------------------------------------------

"""
Both hands in GRID units, left hand only — the right is the mirror.

The palm is a rounded RECTANGLE and the limbs are tapered capsules, and the
difference matters. A capsule's end is a half-circle, so a palm built as one
bulges out past the knuckles and swallows the base of every finger: the first
version of this came out as a single blob with no fingers in it at all. A flat
right edge is what lets four separate fingers leave the hand.

The proportions are forced by the grid, and the forcing goes one way: the
fingers set the size of everything else.

A finger has to be about six rows across with two rows of gap beside it, or four
of them come out as one paddle — the first version ran them at three rows and
that is exactly what happened. Four fingers at eight rows apiece is a palm
thirty rows deep, and a palm that deep needs an arm and a reach to match, so the
hand ends up seventy columns long and bleeding off the frame. The two of them
then leave a sixteen-column gap in the middle, which is as much as there is.

There is no room for a knuckle, a nail or a joint — anything under about three
cells is below the resolution worked out at the top of this file. Four fingers
and a thumb is the whole of the anatomy this medium can hold.

The fingers fan and differ in length — index, middle, ring, little — because
four of one length read as a comb. The middle finger reaches furthest, which is
what makes the centre gap read as two hands ALMOST touching rather than as two
objects that happen to be near each other.
"""
FOREARM = ((-16.0, 35.0, 10.0), (14.0, 35.0, 9.0))
PALM = (10.0, 20.0, 38.0, 50.0, 7.0)  # x0, y0, x1, y1, corner radius
FINGERS = [
    ((36.0, 23.2, 2.9), (52.0, 19.4, 2.0)),   # index
    ((36.0, 30.2, 3.0), (56.0, 26.6, 2.1)),   # middle — the longest
    ((36.0, 37.2, 2.9), (54.0, 35.0, 2.0)),   # ring
    ((36.0, 43.6, 2.6), (47.0, 43.8, 1.8)),   # little
]
THUMB = ((14.0, 47.0, 3.9), (33.0, 58.0, 2.5))

"""
The right hand is mirrored, then moved — not just flipped.

A mirror about the centre column gives a picture with an axis of symmetry down
the middle of the frame, which reads as an ornament rather than as two people.
Dropping it four rows and pulling it two columns across breaks the axis while
keeping the gesture.
"""
MIRROR_AXIS = 63.0
RIGHT_DY = 4.0
RIGHT_DX = 2.0


def capsule(draw, a, b):
    """One tapered limb: two circles and the quad between them."""
    (x0, y0, r0), (x1, y1, r1) = a, b
    draw.ellipse((x0 - r0, y0 - r0, x0 + r0, y0 + r0), fill=255)
    draw.ellipse((x1 - r1, y1 - r1, x1 + r1, y1 + r1), fill=255)
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy) or 1.0
    nx, ny = -dy / length, dx / length
    draw.polygon(
        [(x0 + nx * r0, y0 + ny * r0), (x1 + nx * r1, y1 + ny * r1),
         (x1 - nx * r1, y1 - ny * r1), (x0 - nx * r0, y0 - ny * r0)],
        fill=255,
    )


def place(x, y, mirrored):
    if mirrored:
        return 2 * MIRROR_AXIS - x + RIGHT_DX, y + RIGHT_DY
    return x, y


def hand(draw, mirrored):
    x0, y0, x1, y1, rad = PALM
    ax, ay = place(x0, y0, mirrored)
    bx, by = place(x1, y1, mirrored)
    draw.rounded_rectangle(
        (min(ax, bx) * SS, min(ay, by) * SS, max(ax, bx) * SS, max(ay, by) * SS),
        radius=rad * SS, fill=255,
    )
    for a, b in [FOREARM, *FINGERS, THUMB]:
        pts = []
        for x, y, r in (a, b):
            x, y = place(x, y, mirrored)
            pts.append((x * SS, y * SS, r * SS))
        capsule(draw, pts[0], pts[1])


def mask():
    """Per-cell coverage of the two hands, 0…1."""
    img = Image.new("L", (COLS * SS, ROWS * SS), 0)
    draw = ImageDraw.Draw(img)
    hand(draw, False)
    hand(draw, True)
    px = img.load()
    out = [[0.0] * COLS for _ in range(ROWS)]
    for r in range(ROWS):
        for c in range(COLS):
            total = 0
            for sy in range(SS):
                for sx in range(SS):
                    total += px[c * SS + sx, r * SS + sy]
            out[r][c] = total / (SS * SS * 255)
    return out


# ---- the dissolve ---------------------------------------------------------

"""
Lit along the top edge, thinning downward. This is the reference's whole
character, and it is also the thing that keeps the silhouette readable.

A solid form at this contrast is one flat grey shape; it is the EDGE that tells
you what you are looking at. Carrying the top edge at full size and full
strength and letting everything under it break up means the outline survives
even where the mass does not — which is exactly what the picture needs at 3.2:1.

`depth` is how many filled cells stand above a cell in its own column. It is a
cheap stand-in for distance from the lit edge and behaves correctly on fingers,
which is where it matters: a finger is thin, so every cell in it is near the
top and stays bright.
"""
LEVELS = [
    # depth below the lit edge, square side, opacity
    (4, CELL, 1.0),
    (11, 11.6, 1.0),
    (19, 9.6, 0.85),
    (999, 7.6, 0.7),
]

"""
How much of the mass survives at depth.

0.96 near the edge and a floor of 0.72 deep inside: the form has to stay
readable as a MASS, so the interior is thinned rather than emptied.

The first attempt ran this from 0.92 down to a floor of 0.3 with a decay of 7,
and the result was unreadable — a palm is eighteen rows deep, so almost all of
it fell past the floor and both hands came apart into scattered dots. Checked by
printing the grid, not by looking at the colours. A decay of 18 and a high floor
keeps nine tenths of the mass and spends the variation on texture instead.
"""


def keep(depth):
    return max(0.8, 0.97 * math.exp(-depth / 24.0))


"""
A scatter of cells just outside the silhouette.

The reference has them and they do real work: a hard edge on a grid this coarse
reads as a staircase, and a few strays off the boundary break the stepping up
without softening the shape. Only within two cells of the form, and only at the
smallest size.
"""
SCATTER_REACH = 2
SCATTER_P = 0.1


def rng(seed):
    """A seeded LCG — the numerical recipes constants.

    Deterministic by design: the plate is checked into the repository, so the
    script has to produce the same file every time or every run shows up as a
    diff.
    """
    state = seed

    def next_float():
        nonlocal state
        state = (1664525 * state + 1013904223) % (1 << 32)
        return state / (1 << 32)

    return next_float


cov = mask()
solid = [[cov[r][c] >= COVERAGE for c in range(COLS)] for r in range(ROWS)]

# depth = filled cells directly above, in the same column
depth = [[0] * COLS for _ in range(ROWS)]
for c in range(COLS):
    run = 0
    for r in range(ROWS):
        depth[r][c] = run
        run = run + 1 if solid[r][c] else 0

near = [[False] * COLS for _ in range(ROWS)]
for r in range(ROWS):
    for c in range(COLS):
        if solid[r][c]:
            continue
        for dr in range(-SCATTER_REACH, SCATTER_REACH + 1):
            for dc in range(-SCATTER_REACH, SCATTER_REACH + 1):
                rr, cc = r + dr, c + dc
                if 0 <= rr < ROWS and 0 <= cc < COLS and solid[rr][cc]:
                    near[r][c] = True
                    break
            if near[r][c]:
                break

rand = rng(20251010)
cells = []
for r in range(ROWS):
    for c in range(COLS):
        if solid[r][c]:
            if rand() >= keep(depth[r][c]):
                continue
            for limit, side, op in LEVELS:
                if depth[r][c] <= limit:
                    break
        elif near[r][c]:
            if rand() >= SCATTER_P:
                continue
            side, op = LEVELS[-1][1], LEVELS[-1][2]
        else:
            continue
        cells.append((c, r, side, op))

w = (COLS - 1) * PITCH + CELL
h = (ROWS - 1) * PITCH + CELL

parts = [
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" '
    f'fill="currentColor" role="img" '
    f'aria-label="Two hands reaching towards each other, drawn in squares">'
]

"""
Grouped by opacity, with the square's size carried per rect.

`fill-opacity` inherits, so one attribute on a `<g>` covers everything inside
it; the side cannot be grouped that way because it is geometry rather than
paint. Each cell is centred in its own slot whatever its size, so the smaller
squares sit on the same lattice as the full ones instead of drifting.
"""
for op in sorted({c[3] for c in cells}, reverse=True):
    group = [c for c in cells if c[3] == op]
    parts.append("<g>" if op == 1.0 else f'<g fill-opacity="{op}">')
    for col, row, side, _ in group:
        inset = (CELL - side) / 2
        parts.append(f'<rect x="{col * PITCH + inset:.1f}" y="{row * PITCH + inset:.1f}" '
                     f'width="{side}" height="{side}"/>')
    parts.append("</g>")
parts.append("</svg>")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("".join(parts))

ink = sum((c[2] / CELL) ** 2 * c[3] for c in cells)
print(f"{OUT}: {len(cells)} squares of {COLS * ROWS} ({len(cells) / (COLS * ROWS):.1%}), "
      f"ink equivalent {ink:.0f} full cells, viewBox {w:.1f} x {h:.1f}")

if "--preview" in sys.argv:
    glyph = {level[1]: ch for level, ch in zip(LEVELS, "#+:.")}
    grid = [[" "] * COLS for _ in range(ROWS)]
    for col, row, side, _ in cells:
        grid[row][col] = glyph[side]
    for row in grid:
        print("".join(row))
