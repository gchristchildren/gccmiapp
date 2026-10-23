"""Turn the supplied GCCMI logo into a transparent PNG and PWA icons.

Usage: python3 -I scripts/make-logo.py <source.png>
"""
import sys
from PIL import Image

GREEN = (6, 127, 5)
raw = Image.open(sys.argv[1]).convert("RGBA")
src = Image.new("RGBA", raw.size, (255, 255, 255, 255))  # flatten any existing alpha onto white
src.alpha_composite(raw)
src = src.convert("RGB")

# alpha = how far each pixel is from white; colour is flattened to brand green
alpha = src.point(lambda v: 0).convert("L")
px = src.load(); ap = alpha.load()
for y in range(src.height):
    for x in range(src.width):
        m = min(px[x, y])
        ap[x, y] = max(0, min(255, round((255 - m) * 255 / 250)))
out = Image.new("RGBA", src.size, GREEN + (0,))
out.putalpha(alpha)
out = out.crop(out.getbbox())
pad = round(out.width * 0.03)
canvas = Image.new("RGBA", (out.width + 2 * pad, out.height + 2 * pad), GREEN + (0,))
canvas.alpha_composite(out, (pad, pad))
canvas.thumbnail((1200, 1200), Image.LANCZOS)
canvas.save("public/brand/gccmi-logo.png")

# square PWA icons: logo on cream, plus a maskable variant with a safe zone
def icon(size, logo_frac, name, bg=(247, 243, 232, 255)):
    c = Image.new("RGBA", (size, size), bg)
    l = canvas.copy(); l.thumbnail((int(size * logo_frac),) * 2, Image.LANCZOS)
    c.alpha_composite(l, ((size - l.width) // 2, (size - l.height) // 2))
    c.convert("RGB").save(f"public/{name}")
icon(192, 0.86, "icon-192.png"); icon(512, 0.86, "icon-512.png")
icon(512, 0.62, "icon-maskable-512.png"); icon(180, 0.86, "apple-touch-icon.png")
icon(64, 0.92, "favicon.png")
print("done", canvas.size)
