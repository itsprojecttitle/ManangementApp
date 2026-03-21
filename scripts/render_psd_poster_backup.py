#!/usr/bin/env python3
import argparse
import random
from pathlib import Path
from typing import List, Tuple, Optional

from psd_tools import PSDImage
from PIL import Image, ImageDraw, ImageFont, ImageFilter

DEFAULT_PSD = "/Users/samuelapata/Desktop/New Folder With Items/GlobalDirectory/Work/Tools/Photoshop/ .psd"
DEFAULT_FONT = "/Users/samuelapata/Library/Fonts/Poppins-ExtraBold.ttf"
DEFAULT_FONT_INDEX = None

TEXT_LAYER_NAME_SUBSTR = "SOMEHWERE BETWEEN ICONIC"
TEXT_LAYER_BBOX = (77, 871, 934, 1152)  # x1, y1, x2, y2
SUBTEXT_LAYER_NAME_SUBSTR = "What are your thoughts on this cover?"
SWIPE_LEFT_LAYER_NAME_SUBSTR = "SWIPE LEFT"

CANVAS_SIZE = (1012, 1350)
FONT_SIZE = 92
LINE_HEIGHT_RATIO = 0.9
LETTER_SPACING = -4

GLOW_RADIUS_PX = 5
GLOW_OPACITY = 0.25
MAIN_V_SCALE = 1.12
MAIN_H_SCALE = 1.06
SUBTEXT_SCALE = 0.175
SUBTEXT_FONT_NAME = "Helvetica-Oblique"


def text_width(font: ImageFont.FreeTypeFont, text: str, letter_spacing: float) -> float:
    width = 0.0
    for i, ch in enumerate(text):
        width += font.getlength(ch)
        if i != len(text) - 1:
            width += letter_spacing
    return width


def draw_text_lines(
    base: Image.Image,
    lines: List[str],
    bbox: Tuple[int, int, int, int],
    font: ImageFont.FreeTypeFont,
    line_height_ratio: float,
    letter_spacing: float,
    fill=(255, 255, 255, 255),
):
    x1, y1, x2, y2 = bbox
    layer_w = x2 - x1
    layer_h = y2 - y1
    line_height = int(font.size * line_height_ratio)
    block_height = len(lines) * line_height
    start_y = y1 + (layer_h - block_height) // 2

    draw = ImageDraw.Draw(base)
    for i, line in enumerate(lines):
        line_w = text_width(font, line, letter_spacing)
        x = x1 + int((layer_w - line_w) // 2)
        y = start_y + i * line_height
        cx = x
        for j, ch in enumerate(line):
            draw.text((cx, y), ch, font=font, fill=fill)
            cx += font.getlength(ch)
            if j != len(line) - 1:
                cx += letter_spacing


def resolve_font_from_psd(font_name: str):
    if font_name == "Helvetica-Oblique":
        return ("/System/Library/Fonts/Helvetica.ttc", 2)
    if font_name == "Helvetica":
        return ("/System/Library/Fonts/Helvetica.ttc", 0)
    if font_name == "Helvetica-Bold":
        return ("/System/Library/Fonts/Helvetica.ttc", 1)
    if font_name in ("Helvetica-BoldOblique", "Helvetica-Bold Oblique"):
        return ("/System/Library/Fonts/Helvetica.ttc", 3)
    if font_name == "Helvetica-Light":
        return ("/System/Library/Fonts/Helvetica.ttc", 4)
    if font_name == "Helvetica-LightOblique":
        return ("/System/Library/Fonts/Helvetica.ttc", 5)
    return (None, None)


def get_psd_subtext_style(layer) -> Optional[dict]:
    try:
        engine = layer.engine_dict
        style = engine["StyleRun"]["RunArray"][0]["StyleSheet"]["StyleSheetData"]
        font_index = style.get("Font", 0)
        font_name = None
        if hasattr(layer, "resource_dict"):
            fontset = layer.resource_dict.get("FontSet", [])
            if fontset and font_index < len(fontset):
                font_name = fontset[font_index].get("Name")
        fill = style.get("FillColor", {"Type": 1, "Values": [1.0, 1.0, 1.0, 1.0]})
        fill_vals = fill.get("Values", [1.0, 1.0, 1.0, 1.0])
        return {
            "font_size": float(style.get("FontSize", 54.0)),
            "tracking": float(style.get("Tracking", 0.0)),
            "h_scale": float(style.get("HorizontalScale", 1.0)),
            "v_scale": float(style.get("VerticalScale", 1.0)),
            "baseline_shift": float(style.get("BaselineShift", 0.0)),
            "font_name": font_name,
            "fill_rgba": (
                int(fill_vals[0] * 255),
                int(fill_vals[1] * 255),
                int(fill_vals[2] * 255),
                int(fill_vals[3] * 255),
            ),
        }
    except Exception:
        return None


def alpha_bbox(img: Image.Image):
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    return bbox


def draw_subtext_exact(base: Image.Image, layer, text: str):
    style = get_psd_subtext_style(layer) or {}
    # Force Helvetica for subtext (subtitle under main text)
    font_name = SUBTEXT_FONT_NAME or style.get("font_name")
    font_path = DEFAULT_FONT
    font_index = None
    if font_name:
        resolved_path, resolved_index = resolve_font_from_psd(font_name)
        if resolved_path:
            font_path = resolved_path
            font_index = resolved_index

    font_size = int(style.get("font_size", 54))
    tracking = float(style.get("tracking", 0.0))
    h_scale = float(style.get("h_scale", 1.0))
    v_scale = float(style.get("v_scale", 1.0))
    fill = style.get("fill_rgba", (255, 255, 255, 255))

    if font_index is None:
        font = ImageFont.truetype(font_path, font_size)
    else:
        font = ImageFont.truetype(font_path, font_size, index=font_index)

    letter_spacing = (tracking / 1000.0) * font_size
    temp_w = int(text_width(font, text, letter_spacing) + 40)
    temp_h = int(font_size * 1.6)
    temp = Image.new("RGBA", (max(1, temp_w), max(1, temp_h)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(temp)
    cx = 0
    for i, ch in enumerate(text):
        draw.text((cx, 0), ch, font=font, fill=fill)
        cx += font.getlength(ch)
        if i != len(text) - 1:
            cx += letter_spacing

    temp = temp.resize((max(1, int(temp.size[0] * h_scale)), max(1, int(temp.size[1] * v_scale))), Image.LANCZOS)

    # Align to the PSD-rendered glyph bbox inside the layer for precise position.
    orig = layer.composite()
    orig_bbox = alpha_bbox(orig)
    if orig_bbox:
        obx1, oby1, obx2, oby2 = orig_bbox
        target_w = max(1, obx2 - obx1)
        target_h = max(1, oby2 - oby1)
        # scale to match target height, then clamp to width
        scale = target_h / max(1, temp.size[1])
        temp = temp.resize((max(1, int(temp.size[0] * scale)), max(1, int(temp.size[1] * scale))), Image.LANCZOS)
        if SUBTEXT_SCALE != 1.0:
            temp = temp.resize(
                (max(1, int(temp.size[0] * SUBTEXT_SCALE)), max(1, int(temp.size[1] * SUBTEXT_SCALE))),
                Image.LANCZOS,
            )
        if temp.size[0] > target_w:
            scale_w = target_w / temp.size[0]
            temp = temp.resize((max(1, int(temp.size[0] * scale_w)), max(1, int(temp.size[1] * scale_w))), Image.LANCZOS)
        # place inside original glyph bbox
        lx1, ly1, _, _ = layer.bbox
        x = lx1 + obx1 + (target_w - temp.size[0]) // 2
        y = ly1 + oby1 + (target_h - temp.size[1]) // 2
        base.alpha_composite(temp, (int(x), int(y)))
        return

    # fallback center in layer bbox
    lx1, ly1, lx2, ly2 = layer.bbox
    max_w = max(1, lx2 - lx1)
    max_h = max(1, ly2 - ly1)
    x = lx1 + (max_w - temp.size[0]) // 2
    y = ly1 + (max_h - temp.size[1]) // 2
    base.alpha_composite(temp, (int(x), int(y)))


def fit_main_font_size(lines: List[str], bbox: Tuple[int, int, int, int], font_path: str, font_index: Optional[int], line_height_ratio: float, letter_spacing: float, max_size: int = 140) -> int:
    x1, y1, x2, y2 = bbox
    max_w = x2 - x1
    max_h = y2 - y1
    size = max_size
    while size > 8:
        if font_index is None:
            font = ImageFont.truetype(font_path, size)
        else:
            font = ImageFont.truetype(font_path, size, index=font_index)
        line_height = int(size * line_height_ratio)
        block_height = len(lines) * line_height
        if block_height > max_h:
            size -= 1
            continue
        widths_ok = True
        for line in lines:
            if text_width(font, line, letter_spacing) > max_w:
                widths_ok = False
                break
        if widths_ok:
            return size
        size -= 1
    return 8


def choose_red_word_indices(words: List[str], max_red: int = 2) -> set:
    if not words:
        return set()
    count = min(max_red, max(1, len(words) // 3))
    return set(random.sample(range(len(words)), count))


def draw_main_text_with_random_red(
    base: Image.Image,
    lines: List[str],
    bbox: Tuple[int, int, int, int],
    font: ImageFont.FreeTypeFont,
    line_height_ratio: float,
    letter_spacing: float,
    glow_radius: int,
    glow_opacity: float,
):
    x1, y1, x2, y2 = bbox
    layer_w = x2 - x1
    layer_h = y2 - y1
    line_height = int(font.size * line_height_ratio)
    block_height = len(lines) * line_height
    start_y = y1 + (layer_h - block_height) // 2

    # Build a text layer with random red words
    text_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_layer)

    white = (255, 255, 255, 255)
    red = (192, 0, 0, 255)
    space_w = font.getlength(" ")
    for i, line in enumerate(lines):
        words = line.split(" ")
        red_indices = choose_red_word_indices(words)
        line_w = text_width(font, line, letter_spacing)
        x = x1 + int((layer_w - line_w) // 2)
        y = start_y + i * line_height
        cx = x
        word_index = 0
        for ch in line:
            if ch == " ":
                cx += space_w
                word_index += 1
                continue
            color = red if word_index in red_indices else white
            draw.text((cx, y), ch, font=font, fill=color)
            cx += font.getlength(ch) + letter_spacing


    # Stretch width/height
    if MAIN_V_SCALE != 1.0 or MAIN_H_SCALE != 1.0:
        text_layer = text_layer.resize(
            (
                max(1, int(text_layer.size[0] * MAIN_H_SCALE)),
                max(1, int(text_layer.size[1] * MAIN_V_SCALE)),
            ),
            Image.LANCZOS,
        )

    # Glow layer (from PSD style)
    glow = text_layer.filter(ImageFilter.GaussianBlur(radius=glow_radius))
    if glow_opacity < 1.0:
        alpha = glow.split()[-1].point(lambda p: int(p * glow_opacity))
        glow.putalpha(alpha)

    # Re-center after scaling
    if MAIN_V_SCALE != 1.0 or MAIN_H_SCALE != 1.0:
        x_offset = (base.size[0] - text_layer.size[0]) // 2
        y_offset = (base.size[1] - text_layer.size[1]) // 2
        base.alpha_composite(glow, (x_offset, y_offset))
        base.alpha_composite(text_layer, (x_offset, y_offset))
    else:
        base.alpha_composite(glow)
        base.alpha_composite(text_layer)


def render(psd_path: str, out_path: str, lines: List[str], font_path: str = DEFAULT_FONT, font_index: Optional[int] = DEFAULT_FONT_INDEX, subline: str = None):
    if not lines:
        raise SystemExit("Provide at least 1 line of text.")
    if len(lines) > 3:
        raise SystemExit("Max 3 lines.")

    psd = PSDImage.open(psd_path)

    subtext_layer = None
    for layer in psd.descendants():
        if layer.is_visible() and layer.kind == "type" and TEXT_LAYER_NAME_SUBSTR in str(layer.name):
            layer.visible = False
        if layer.is_visible() and layer.kind == "type" and SUBTEXT_LAYER_NAME_SUBSTR in str(layer.name):
            subtext_layer = layer
            if subline:
                layer.visible = False
        if layer.is_visible() and layer.kind == "type" and SWIPE_LEFT_LAYER_NAME_SUBSTR in str(layer.name):
            layer.visible = False

    base = psd.composite()
    if base.mode != "RGBA":
        base = base.convert("RGBA")
    if base.size != CANVAS_SIZE:
        base = base.resize(CANVAS_SIZE, Image.LANCZOS)

    main_font_size = max(
        8,
        fit_main_font_size(lines, TEXT_LAYER_BBOX, font_path, font_index, LINE_HEIGHT_RATIO, LETTER_SPACING, max_size=140) - 5,
    )
    if font_index is None:
        font = ImageFont.truetype(font_path, main_font_size)
    else:
        font = ImageFont.truetype(font_path, main_font_size, index=font_index)

    draw_main_text_with_random_red(
        base,
        lines,
        TEXT_LAYER_BBOX,
        font,
        LINE_HEIGHT_RATIO,
        LETTER_SPACING,
        glow_radius=GLOW_RADIUS_PX,
        glow_opacity=GLOW_OPACITY,
    )

    if subline and subtext_layer is not None:
        draw_subtext_exact(base, subtext_layer, subline)

    out = Path(out_path).expanduser()
    out.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(out, quality=95)
    print(out)


def parse_args():
    p = argparse.ArgumentParser(description="Render PSD poster with replaced main text.")
    p.add_argument("--psd", default=DEFAULT_PSD, help="Path to PSD file")
    p.add_argument("--out", required=True, help="Output PNG path")
    p.add_argument("--font", default=DEFAULT_FONT, help="Path to main font")
    p.add_argument("--font-index", type=int, default=DEFAULT_FONT_INDEX, help="Font index for TTC fonts")
    p.add_argument("--line", action="append", default=[], help="Main text line (repeat up to 3x)")
    p.add_argument("--subline", default=None, help="Subtext line (replaces the small text under main text)")
    return p.parse_args()


def main():
    args = parse_args()
    render(args.psd, args.out, args.line, font_path=args.font, font_index=args.font_index, subline=args.subline)


if __name__ == "__main__":
    main()
