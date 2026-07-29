"""Copyright 2026 Pradyumna Revur — Apache-2.0 (see LICENSE)

Draws the app icon directly with Pillow (no SVG/cairo dependency) at 4x
supersampling, then downsamples to each target size for clean edges."""
from PIL import Image, ImageDraw
import math

SCALE = 4
SIZE = 512 * SCALE


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def rounded_rect_gradient(draw, size, radius, c1, c2):
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / size
        row_color = lerp_color(c1, c2, t)
        for x in range(size):
            px[x, y] = row_color
    mask = Image.new("L", (size, size), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def draw_icon(size):
    s = size / 512.0
    canvas = rounded_rect_gradient(
        None, size, int(112 * s), (255, 154, 60), (232, 89, 12)
    )
    draw = ImageDraw.Draw(canvas)

    def P(x, y):
        return (x * s, y * s)

    def W(w):
        return max(1, int(w * s))

    # steam
    steam_color = (255, 243, 224, 230)
    for cx in (196, 256, 316):
        pts = [P(cx - 24, 150), P(cx - 4, 120), P(cx + 16, 100), P(cx - 4, 68)]
        draw.line(pts, fill=steam_color, width=W(15), joint="curve")

    # bowl body
    bowl_top, bowl_bottom = (255, 253, 247), (255, 239, 214)
    draw.pieslice(
        [P(120, 94)[0], P(120, 94)[1], P(392, 366)[0], P(392, 366)[1]],
        0, 180, fill=bowl_top, outline=(194, 65, 12), width=W(10),
    )
    draw.ellipse(
        [P(120, 200)[0], P(120, 200)[1], P(392, 260)[0], P(392, 260)[1]],
        fill=(255, 249, 238), outline=(194, 65, 12), width=W(10),
    )

    # veggie pieces
    draw.ellipse([P(189, 206)[0], P(189, 206)[1], P(221, 238)[0], P(221, 238)[1]], fill=(232, 89, 12))
    draw.ellipse([P(238, 196)[0], P(238, 196)[1], P(274, 232)[0], P(274, 232)[1]], fill=(47, 158, 68))
    draw.ellipse([P(293, 209)[0], P(293, 209)[1], P(323, 239)[0], P(323, 239)[1]], fill=(242, 192, 55))
    draw.arc([P(214, 214)[0], P(214, 214)[1], P(246, 246)[0], P(246, 246)[1]], 200, 340, fill=(47, 158, 68), width=W(8))

    # leaf accent
    leaf = [P(352, 356), P(392, 356), P(420, 384), P(420, 420), P(384, 420), P(356, 392)]
    draw.polygon(leaf, fill=(47, 158, 68))
    draw.line([P(360, 412), P(374, 396), P(398, 376)], fill=(27, 110, 46), width=W(6), joint="curve")

    # base/stand
    draw.polygon(
        [P(150, 396), P(362, 396), P(344, 436), P(168, 436)],
        fill=(255, 239, 214), outline=(194, 65, 12), width=W(9),
    )

    return canvas


def save(size, path, maskable_bg=False):
    img = draw_icon(SIZE).resize((size, size), Image.LANCZOS)
    if maskable_bg:
        # add extra padding margin of solid bg color for maskable safe-zone
        pad = int(size * 0.10)
        bg = Image.new("RGBA", (size, size), (232, 89, 12, 255))
        inner = img.resize((size - 2 * pad, size - 2 * pad), Image.LANCZOS)
        bg.paste(inner, (pad, pad), inner)
        bg.save(path)
    else:
        img.save(path)
    print("wrote", path, size)


if __name__ == "__main__":
    save(512, "icons/icon-512.png")
    save(192, "icons/icon-192.png")
    save(180, "icons/apple-touch-icon.png")
    save(32, "icons/favicon-32.png")
    save(16, "icons/favicon-16.png")
    save(512, "icons/maskable-512.png", maskable_bg=True)
