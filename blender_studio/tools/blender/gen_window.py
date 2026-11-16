# window gobo for a 60 m plane: opaque except a 4.6 x 3.6 m window (4 x 3 panes) centred, with leaf shadows in the lower-left panes
import sys, random, math
from PIL import Image, ImageDraw
random.seed(3)
SIZE_M, PX = 60.0, 6144
ppm = PX / SIZE_M
im = Image.new('LA', (PX, PX), (0, 255)); d = ImageDraw.Draw(im)
ww, wh, cols, rows, mull = 7.2 * ppm, 5.4 * ppm, 4, 3, 0.17 * ppm
x0, y0 = PX / 2 - ww / 2, PX / 2 - wh / 2
pw, ph = (ww - (cols - 1) * mull) / cols, (wh - (rows - 1) * mull) / rows
for c in range(cols):
    for r in range(rows):
        px, py = x0 + c * (pw + mull), y0 + r * (ph + mull)
        d.rectangle([px, py, px + pw, py + ph], fill=(0, 0))
for i in range(30):
    cx, cy = x0 + random.random() * pw * 1.6, y0 + wh * (0.55 + random.random() * 0.45)
    L, a = (0.18 + random.random() * 0.22) * ppm, random.random() * math.pi
    pts = [(cx + math.cos(t) * L * math.cos(a) - math.sin(t) * L * 0.32 * math.sin(a), cy + math.cos(t) * L * math.sin(a) + math.sin(t) * L * 0.32 * math.cos(a)) for t in [k / 23 * 2 * math.pi for k in range(24)]]
    d.polygon(pts, fill=(0, 255))
im = im.convert('RGBA')
for path in sys.argv[1:]:
    im.save(path)
