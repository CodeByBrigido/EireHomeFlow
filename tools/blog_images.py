"""Blog pictures: turns one picture into the four WebP sizes the site uses.

    python tools/blog_images.py <picture> <slug> [--focus 0.5]

Crops the picture to 16:9 and writes docs/img/blog/<slug>-320.webp, -640, -960 and
-1440. A picture wider than 16:9 loses its sides: --focus says where to keep, from 0
(the left edge) to 1 (the right edge); 0.5 keeps the middle. A taller one loses the
top and bottom equally. Needs Python 3 and Pillow (pip install Pillow).
"""
import argparse
import os
import sys

from PIL import Image

WIDTHS = (320, 640, 960, 1440)  # keep in step with IMAGE_WIDTHS in docs/js/lib/posts.js
RATIO = 16 / 9
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "img", "blog")


def crop_16_9(image, focus=0.5):
    width, height = image.size
    if width / height > RATIO:
        new_width = round(height * RATIO)
        left = round((width - new_width) * focus)
        return image.crop((left, 0, left + new_width, height))
    new_height = round(width / RATIO)
    top = (height - new_height) // 2
    return image.crop((0, top, width, top + new_height))


def write_sizes(picture, slug, focus=0.5):
    image = crop_16_9(Image.open(picture).convert("RGB"), focus)
    if image.width < WIDTHS[-1]:
        sys.exit(f"{picture}: {image.width}px wide after cropping to 16:9; the site needs at least {WIDTHS[-1]}px.")
    written = []
    for width in WIDTHS:
        path = os.path.join(OUT, f"{slug}-{width}.webp")
        image.resize((width, round(width / RATIO)), Image.LANCZOS).save(path, "WEBP", quality=80, method=6)
        written.append(path)
    return written


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Write the four WebP sizes of a blog picture.")
    parser.add_argument("picture")
    parser.add_argument("slug")
    parser.add_argument("--focus", type=float, default=0.5, help="where to keep a wide picture: 0 left, 1 right")
    args = parser.parse_args()
    if not 0 <= args.focus <= 1:
        sys.exit("--focus must be between 0 and 1.")
    for path in write_sizes(args.picture, args.slug, args.focus):
        print(f"{os.path.relpath(path)}  {os.path.getsize(path) // 1024} KB")
