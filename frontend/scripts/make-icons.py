"""Draw CodeBuddy app icons as PNGs using only the Python standard library."""

import math
import struct
import zlib
from pathlib import Path


def chunk(tag: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def write_png(path: Path, width: int, height: int, pixels: bytearray) -> None:
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        start = y * stride
        raw.extend(pixels[start : start + stride])
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )
    path.write_bytes(png)


def blend(base: tuple[int, int, int, int], src: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    sr, sg, sb, sa = src
    if sa <= 0:
        return base
    dr, dg, db, da = base
    sa_f = sa / 255
    da_f = da / 255
    out_a = sa_f + da_f * (1 - sa_f)
    if out_a <= 0:
        return (0, 0, 0, 0)

    def channel(sc: int, dc: int) -> int:
        return max(0, min(255, round((sc * sa_f + dc * da_f * (1 - sa_f)) / out_a)))

    return (channel(sr, dr), channel(sg, dg), channel(sb, db), max(0, min(255, round(out_a * 255))))


def fill_circle(buf: bytearray, size: int, cx: float, cy: float, radius: float, color: tuple[int, int, int, int]) -> None:
    r2 = radius * radius
    x0 = max(0, math.floor(cx - radius - 1))
    x1 = min(size - 1, math.ceil(cx + radius + 1))
    y0 = max(0, math.floor(cy - radius - 1))
    y1 = min(size - 1, math.ceil(cy + radius + 1))
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            coverage = 0
            for sy in (0.25, 0.75):
                for sx in (0.25, 0.75):
                    dx = x + sx - cx
                    dy = y + sy - cy
                    if dx * dx + dy * dy <= r2:
                        coverage += 1
            if coverage == 0:
                continue
            alpha = round(color[3] * coverage / 4)
            index = (y * size + x) * 4
            current = (buf[index], buf[index + 1], buf[index + 2], buf[index + 3])
            mixed = blend(current, (color[0], color[1], color[2], alpha))
            buf[index : index + 4] = bytes(mixed)


def rounded_background(size: int, color: tuple[int, int, int, int], radius_ratio: float) -> bytearray:
    buf = bytearray(size * size * 4)
    radius = size * radius_ratio
    for y in range(size):
        for x in range(size):
            px, py = x + 0.5, y + 0.5
            inside = True
            if px < radius and py < radius:
                inside = (px - radius) ** 2 + (py - radius) ** 2 <= radius ** 2
            elif px > size - radius and py < radius:
                inside = (px - (size - radius)) ** 2 + (py - radius) ** 2 <= radius ** 2
            elif px < radius and py > size - radius:
                inside = (px - radius) ** 2 + (py - (size - radius)) ** 2 <= radius ** 2
            elif px > size - radius and py > size - radius:
                inside = (px - (size - radius)) ** 2 + (py - (size - radius)) ** 2 <= radius ** 2
            if inside:
                index = (y * size + x) * 4
                buf[index : index + 4] = bytes(color)
    return buf


def draw_panda(size: int, maskable: bool) -> bytearray:
    purple = (95, 63, 193, 255)
    radius = 0.08 if maskable else 0.22
    buf = rounded_background(size, purple, radius)
    scale = size / 512
    face = 168 * scale
    cx = size / 2
    cy = size * 0.56
    fill_circle(buf, size, cx - 118 * scale, cy - 108 * scale, 58 * scale, (28, 24, 48, 255))
    fill_circle(buf, size, cx + 118 * scale, cy - 108 * scale, 58 * scale, (28, 24, 48, 255))
    fill_circle(buf, size, cx - 118 * scale, cy - 108 * scale, 28 * scale, (255, 214, 230, 255))
    fill_circle(buf, size, cx + 118 * scale, cy - 108 * scale, 28 * scale, (255, 214, 230, 255))
    fill_circle(buf, size, cx, cy, face, (255, 250, 252, 255))
    fill_circle(buf, size, cx - 62 * scale, cy - 8 * scale, 38 * scale, (36, 32, 58, 255))
    fill_circle(buf, size, cx + 62 * scale, cy - 8 * scale, 38 * scale, (36, 32, 58, 255))
    fill_circle(buf, size, cx - 54 * scale, cy - 16 * scale, 14 * scale, (255, 255, 255, 255))
    fill_circle(buf, size, cx + 70 * scale, cy - 16 * scale, 14 * scale, (255, 255, 255, 255))
    fill_circle(buf, size, cx - 58 * scale, cy - 12 * scale, 6 * scale, (20, 16, 32, 255))
    fill_circle(buf, size, cx + 66 * scale, cy - 12 * scale, 6 * scale, (20, 16, 32, 255))
    fill_circle(buf, size, cx, cy + 28 * scale, 16 * scale, (36, 32, 58, 255))
    fill_circle(buf, size, cx, cy + 24 * scale, 7 * scale, (255, 255, 255, 230))
    return buf


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "public" / "icons"
    out.mkdir(parents=True, exist_ok=True)
    icons = {
        "icon-192.png": (192, False),
        "icon-512.png": (512, False),
        "icon-1024.png": (1024, False),
        "apple-touch-icon.png": (180, False),
        "icon-maskable-512.png": (512, True),
    }
    for name, (size, maskable) in icons.items():
        write_png(out / name, size, size, draw_panda(size, maskable))
        print(out / name)


if __name__ == "__main__":
    main()
