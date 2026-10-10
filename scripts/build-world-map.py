"""Rasterise Natural Earth land polygons into the square-grid world map SVG.

    python3 scripts/build-world-map.py ne_110m_land.geojson 84.5 -53 0.52 \
        public/assets/img/world-squares.svg

Input is `ne_110m_land.geojson` from naturalearthdata.com (or the nvkelso/
natural-earth-vector mirror). Natural Earth is PUBLIC DOMAIN with no conditions,
and the projection, grid and rasterisation below are computed from that data
alone — so the output carries no licence obligation either. See the note in
src/content/philosophy.ts for what this replaced and why.

The three numbers are latitude top, latitude bottom, and the fraction of a cell
that must be land before it is filled. 84.5 / -53 / 0.52 are not taste: they came
from a search that minimised the difference in cells-per-row against the file
this replaced, under the constraint that ink has to touch all four edges of the
box. That is what keeps the map in the same frame at the same visual weight.
Antarctica falls outside the latitude range, as it did before.
"""
import json, sys
DATA, LAT_TOP, LAT_BOT, THRESH, OUT = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
COLS, ROWS, FINE_LON, FINE_LAT = 126, 71, 2880, 1440
PITCH, SIDE = 16.25, 13.4

def land_mask(path):
    gj = json.load(open(path, encoding="utf-8"))
    mask = [bytearray(FINE_LON) for _ in range(FINE_LAT)]
    for feat in gj["features"]:
        for ring in feat["geometry"]["coordinates"]:
            ys = [p[1] for p in ring]
            r0 = max(0, int((90 - max(ys)) / 180 * FINE_LAT) - 1)
            r1 = min(FINE_LAT - 1, int((90 - min(ys)) / 180 * FINE_LAT) + 1)
            n = len(ring)
            for r in range(r0, r1 + 1):
                lat = 90 - (r + 0.5) * 180 / FINE_LAT
                xs = []
                for i in range(n):
                    x1, y1 = ring[i]; x2, y2 = ring[(i + 1) % n]
                    if (y1 > lat) != (y2 > lat):
                        xs.append(x1 + (lat - y1) / (y2 - y1) * (x2 - x1))
                xs.sort()
                row = mask[r]
                for i in range(0, len(xs) - 1, 2):
                    c0 = max(0, int((xs[i] + 180) / 360 * FINE_LON))
                    c1 = min(FINE_LON - 1, int((xs[i + 1] + 180) / 360 * FINE_LON))
                    for c in range(c0, c1 + 1):
                        row[c] = 1
    return mask

mask = land_mask(DATA)
dlat = (LAT_TOP - LAT_BOT) / ROWS
cells = []
for r in range(ROWS):
    fr0 = max(0, int((90 - (LAT_TOP - r*dlat)) / 180 * FINE_LAT))
    fr1 = min(FINE_LAT-1, int((90 - (LAT_TOP - (r+1)*dlat)) / 180 * FINE_LAT))
    for c in range(COLS):
        fc0 = int(c/COLS*FINE_LON); fc1 = min(FINE_LON-1, int((c+1)/COLS*FINE_LON))
        tot = hit = 0
        for fr in range(fr0, fr1+1):
            row = mask[fr]
            for fc in range(fc0, fc1+1):
                tot += 1; hit += row[fc]
        if tot and hit/tot > THRESH:
            cells.append((c, r))

grid = set(cells)
for r in range(ROWS):
    print(f"{r:2d}|" + ''.join('#' if ((c,r) in grid or (c+1,r) in grid) else '.' for c in range(0, COLS, 2)))
print(f"\nso o: {len(cells)}", file=sys.stderr)

w = round((COLS - 1) * PITCH + SIDE, 1)
h = round((ROWS - 1) * PITCH + SIDE, 1)
parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" fill="currentColor" role="img" aria-label="Map of the world in squares">']
for c, r in cells:
    parts.append(f'<rect x="{c*PITCH:.1f}" y="{r*PITCH:.1f}" width="{SIDE}" height="{SIDE}"/>')
parts.append('</svg>')
open(OUT, "w", encoding="utf-8").write(''.join(parts))
print(f"viewBox 0 0 {w} {h}", file=sys.stderr)
