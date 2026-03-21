#!/usr/bin/env python3
"""
Render a poster image from a PSD template with replaced main text and subtext.

Workflow:
1) Set DEFAULT_PSD and DEFAULT_FONT paths if needed.
2) Run with --line (1-3 lines) and optional --subline.
3) Output is a flattened PNG with optional grain/scratch texture.

Notes:
- Main text is drawn inside TEXT_LAYER_BBOX with red word randomization.
- Subtext is drawn using the PSD subtext layer as a positioning reference.
- The PSD type layers for main/sub/swipe are hidden before compositing.
"""
import argparse
import json
import os
import random
from pathlib import Path
from typing import List, Tuple, Optional, Set

from psd_tools import PSDImage
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops, ImageOps, ImageEnhance

DEFAULT_PSD = "/Users/samuelapata/Desktop/New Folder With Items/GlobalDirectory/Work/Tools/Photoshop/ .psd"
DEFAULT_FONT = "/Users/samuelapata/Library/Fonts/Poppins-Bold.ttf"
DEFAULT_FONT_INDEX = None
CONFIG_PATH = Path(__file__).with_name("poster_config.json")
DEFAULT_SUBLINE = "WHAT DO YOU HEAR IN THE SILENCE?"

TEXT_LAYER_NAME_SUBSTR = "SOMEHWERE BETWEEN ICONIC"
TEXT_LAYER_BBOX = (77, 871, 934, 1152)  # x1, y1, x2, y2
SUBTEXT_LAYER_NAME_SUBSTR = "What are your thoughts on this cover?"
SWIPE_LEFT_LAYER_NAME_SUBSTR = "SWIPE LEFT"

CANVAS_SIZE = (1019, 1350)
FONT_SIZE = 92
LINE_HEIGHT_RATIO = 0.9
LETTER_SPACING = -4

GLOW_RADIUS_PX = 5
GLOW_OPACITY = 0.25
MAIN_V_SCALE = 1.12
MAIN_H_SCALE = 1.06

# Subtext sizing/behavior (defaults are locked for the "perfect" render).
# Direct render draws subtext centered in the subtext layer bbox and bypasses
# PSD glyph bbox scaling. If you want PSD-driven sizing, set DIRECT_RENDER False
# and FORCE_STYLE False.
SUBTEXT_PSD_HEIGHT_SCALE = 1.0
SUBTEXT_EXTRA_SCALE = 1.0
SUBTEXT_TARGET_HEIGHT_PX = None  # hard clamp for subtext height in pixels
SUBTEXT_TARGET_HEIGHT_MULT = 1.0  # multiplier vs PSD height (1.0 = no change)
SUBTEXT_DEBUG_BOX = False
SUBTEXT_FONT_NAME = None
SUBTEXT_FONT_PATH = "/Users/samuelapata/Library/Fonts/ArgentumSans-Italic.ttf"
SUBTEXT_FORCE_STYLE = True
SUBTEXT_FORCE_SCALE_MULT = 1.25  # 25% increase over PSD font size
SUBTEXT_FORCE_FONT_SIZE = None   # if set, overrides computed size
SUBTEXT_FORCE_FONT_DELTA = -50   # px delta applied after scale
SUBTEXT_FORCE_TRACKING = 0.0
SUBTEXT_FORCE_FILL = (255, 255, 255, 255)
SUBTEXT_DIRECT_RENDER = True
SUBTEXT_Y_OFFSET = 10  # px; positive moves subtext down
SUBTEXT_X_OFFSET = 5  # px; positive moves subtext right
SUBTEXT_ALIGN_BOTTOM = False
SUBTEXT_BOTTOM_PADDING = 20  # px from canvas bottom
TEXT_BLOCK_Y_OFFSET = 50  # px; positive moves BOTH title and subtext down
MAIN_Y_OFFSET = 0  # px; negative moves main title up
SUBTEXT_GLOW_RADIUS = 2
SUBTEXT_GLOW_OPACITY = 0.35
TEMP_CONTRAST = 1.0  # 1.0 = no change
TEMP_BRIGHTNESS = 1.0  # 1.0 = no change
VIGNETTE_STRENGTH = 0.0  # 0..1
VIGNETTE_POWER = 1.6
BOTTOM_GRADIENT_STRENGTH = 0.0  # 0..1
BOTTOM_GRADIENT_START = 0.55  # 0..1 (top=0, bottom=1)

# Subtle vertical gradient blur behind the text block (for legibility)
TEXT_BG_GRADIENT_STRENGTH = 0.35  # 0..1
TEXT_BG_GRADIENT_HEIGHT = 520  # px
TEXT_BG_GRADIENT_BLUR = 60  # px
SUBTEXT_BELOW_MAIN_GAP = 8  # px gap between main block and subtext
SUBTEXT_FORCE_SENTENCE_CASE = False

# Title overlay (image placed above main title, screen-blended)
TITLE_OVERLAY_PATH = "/Users/samuelapata/Desktop/title_wordmark_Tdots_helvetica_bold.png"
TITLE_OVERLAY_ENABLED = False
TITLE_OVERLAY_SCALE = 0.9
TITLE_OVERLAY_GAP = 122  # px above main title
TITLE_OVERLAY_DEBUG_BOX = False
TITLE_OVERLAY_GLOW_RADIUS = 2
TITLE_OVERLAY_GLOW_OPACITY = 0.10
TITLE_OVERLAY_Y_OFFSET = 200  # px; positive moves overlay down
TITLE_UNDERLINE = False
TITLE_UNDERLINE_THICKNESS = 1
TITLE_UNDERLINE_OFFSET = -26  # px below title (negative = tighter)
TITLE_UNDERLINE_TRIM = 20  # px trim from both ends
TITLE_OVERLAY_DEBUG_BOX = False
TITLE_OVERLAY_OPACITY = 0.50  # reduce title fill by 50%
TITLE_BOX_SCALE = 0.75  # 75% size (25% smaller)

# Full-canvas gradient overlay (between background and text)
GRADIENT_OVERLAY_PATH = "/Users/samuelapata/Desktop/New Folder With Items/GlobalDirectory/GlobalDee/ManagementApp_Project/scripts/Gradient Fill 1.png"
GRADIENT_OVERLAY_ENABLED = True
GRADIENT_OVERLAY_SCALE = 1.2
GRADIENT_OVERLAY_Y_SHIFT = 0.25  # fraction of canvas height

# Texture overlay
GRAIN_ENABLED = True
GRAIN_INTENSITY = 0.09  # 0..1
SCRATCH_INTENSITY = 0.0  # 0..1 (locked off)
SCRATCH_COUNT = 0  # locked off
HIDE_SWIPE_LEFT = False
HIDE_LAYER_NAME_SUBSTRS = []
SUBJECT_LAYER_NAME_SUBSTRS = [
    "2025 ✔️— 2026",
    "5 STAGES OF JUVY",
    "Nvrlüst",
    "Conceived & Created by @lensesnvrlust & @chiefadigo_",
    "Shot by @lense",
    "avatars-RNxvGBoJBajDMKuG-ahZ2gw-t1080x1080",
]
BACKGROUND_LAYER_NAME_SUBSTRS = [
    "Starting #2026 right! @juveniall.mk HEADLINE!6th FebBrixton Jamm 📍 with support from @chefbkay",
    "Background",
]
GRAIN_BOTTOM_FOCUS = True
GRAIN_FADE_START = 0.62  # 0..1 (top=0, bottom=1)
GRAIN_FADE_END = 0.98  # 0..1 (top=0, bottom=1)


def text_width(font: ImageFont.FreeTypeFont, text: str, letter_spacing: float) -> float:
    """Measure text width with tracking applied."""
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
    """Draw centered multiline text into a bbox (used for fallback/debug)."""
    x1, y1, x2, y2 = bbox
    layer_w = x2 - x1
    layer_h = y2 - y1
    line_height = int(font.size * line_height_ratio)
    block_height = len(lines) * line_height
    start_y = y1 + (layer_h - block_height) // 2

    draw = ImageDraw.Draw(base)
    for i, line in enumerate(lines):
        line_w = text_width(font, line, letter_spacing)
        x = int((base.size[0] - line_w) // 2)
        y = start_y + i * line_height
        cx = x
        for j, ch in enumerate(line):
            draw.text((cx, y), ch, font=font, fill=fill)
            cx += font.getlength(ch)
            if j != len(line) - 1:
                cx += letter_spacing


def resolve_font_from_psd(font_name: str):
    """Map PSD font names to local font files (Helvetica family)."""
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
    """Extract font/scale/fill info from a PSD type layer engine dict."""
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
    """Return alpha bbox of an RGBA image (used to align drawn text)."""
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    return bbox


def load_config() -> dict:
    """Load poster config from JSON if present."""
    if CONFIG_PATH.exists():
        try:
            return json.loads(CONFIG_PATH.read_text())
        except Exception:
            return {}
    return {}


def sanitize_filename(name: str) -> str:
    keep = []
    for ch in name:
        if ch.isalnum() or ch in (" ", "-", "_", "."):
            keep.append(ch)
        else:
            keep.append("_")
    return "".join(keep).strip() or "layer"


def export_layers(psd_path: str, out_dir: str, include_hidden: bool = False):
    """Export PSD layers to PNGs with index + name."""
    psd = PSDImage.open(psd_path)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    i = 0
    for layer in psd.descendants():
        if not include_hidden and not layer.is_visible():
            continue
        name = sanitize_filename(str(layer.name))
        try:
            img = layer.composite()
        except Exception:
            continue
        if img is None:
            continue
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        img.save(out / f"{i:04d}_{name}.png")
        i += 1


def apply_texture(base: Image.Image):
    """Apply grain and optional scratch overlays to the final image.

    Grain is masked to darker regions so it stays on shadows/black gradients.
    """
    if (not GRAIN_ENABLED) or (GRAIN_INTENSITY <= 0 and SCRATCH_INTENSITY <= 0):
        return
    w, h = base.size
    if GRAIN_INTENSITY > 0:
        try:
            noise = Image.effect_noise((w, h), 64).convert("L")
        except Exception:
            noise = Image.new("L", (w, h))
            noise.putdata([random.randint(0, 255) for _ in range(w * h)])
        alpha = int(255 * max(0.0, min(1.0, GRAIN_INTENSITY)))
        # Dark-region mask: white in shadows, black in highlights.
        lum = ImageOps.grayscale(base)
        dark_mask = ImageOps.invert(lum)
        if GRAIN_BOTTOM_FOCUS:
            grad = Image.linear_gradient("L").resize((w, h))

            def remap(v):
                x = v / 255.0
                if x <= GRAIN_FADE_START:
                    return 0
                if x >= GRAIN_FADE_END:
                    return 255
                return int(255 * (x - GRAIN_FADE_START) / (GRAIN_FADE_END - GRAIN_FADE_START))

            bottom_mask = grad.point(remap)
            mask = ImageChops.multiply(dark_mask, bottom_mask)
        else:
            mask = dark_mask
        if alpha < 255:
            mask = mask.point(lambda v: int(v * alpha / 255))
        grain = Image.merge("RGBA", (noise, noise, noise, mask))
        base.alpha_composite(grain)

    if SCRATCH_INTENSITY > 0 and SCRATCH_COUNT > 0:
        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        opacity = int(255 * max(0.0, min(1.0, SCRATCH_INTENSITY)))
        for _ in range(SCRATCH_COUNT):
            x1 = random.randint(0, w)
            y1 = random.randint(0, h)
            length = random.randint(int(h * 0.2), int(h * 0.8))
            dx = random.randint(-40, 40)
            x2 = max(0, min(w, x1 + dx))
            y2 = max(0, min(h, y1 + length))
            width = random.randint(1, 2)
            draw.line((x1, y1, x2, y2), fill=(255, 255, 255, opacity), width=width)
        base.alpha_composite(overlay)


def apply_cinematic_depth(base: Image.Image):
    """Add cinematic contrast + vignette + bottom gradient for depth."""
    w, h = base.size
    # Vignette
    if VIGNETTE_STRENGTH > 0:
        vignette = Image.new("L", (w, h), 0)
        draw = ImageDraw.Draw(vignette)
        draw.ellipse(
            (-w * 0.1, -h * 0.1, w * 1.1, h * 1.1),
            fill=255,
        )
        vignette = vignette.filter(ImageFilter.GaussianBlur(radius=int(min(w, h) * 0.12)))
        if VIGNETTE_POWER != 1.0:
            vignette = vignette.point(lambda p: int(255 * ((p / 255.0) ** VIGNETTE_POWER)))
        strength = int(255 * max(0.0, min(1.0, VIGNETTE_STRENGTH)))
        mask = vignette.point(lambda p: int((p * strength) / 255))
        dark = Image.new("RGBA", (w, h), (0, 0, 0, 255))
        base.paste(dark, (0, 0), mask)

    # Bottom gradient for text legibility and depth
    if BOTTOM_GRADIENT_STRENGTH > 0:
        grad = Image.linear_gradient("L").resize((w, h))

        def remap(v):
            x = v / 255.0
            if x <= BOTTOM_GRADIENT_START:
                return 0
            return int(255 * (x - BOTTOM_GRADIENT_START) / (1.0 - BOTTOM_GRADIENT_START))

        mask = grad.point(remap)
        strength = int(255 * max(0.0, min(1.0, BOTTOM_GRADIENT_STRENGTH)))
        mask = mask.point(lambda p: int((p * strength) / 255))
        dark = Image.new("RGBA", (w, h), (0, 0, 0, 255))
        base.paste(dark, (0, 0), mask)


def apply_text_bg_gradient(base: Image.Image, text_center_y: int):
    """Apply a soft vertical gradient blur behind the text block."""
    if TEXT_BG_GRADIENT_STRENGTH <= 0 or TEXT_BG_GRADIENT_HEIGHT <= 0:
        return
    w, h = base.size
    band_h = min(TEXT_BG_GRADIENT_HEIGHT, h)
    top = max(0, int(text_center_y - band_h // 2))
    bottom = min(h, top + band_h)
    band_h = bottom - top
    if band_h <= 0:
        return

    grad = Image.linear_gradient("L").resize((w, band_h))
    # Symmetric fade (darker in the middle, fade to edges)
    grad_top = grad.transpose(Image.FLIP_TOP_BOTTOM)
    mask = ImageChops.lighter(grad, grad_top)
    mask = ImageOps.invert(mask)
    if TEXT_BG_GRADIENT_BLUR > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(radius=TEXT_BG_GRADIENT_BLUR))
    strength = int(255 * max(0.0, min(1.0, TEXT_BG_GRADIENT_STRENGTH)))
    mask = mask.point(lambda p: int(p * strength / 255))

    dark = Image.new("RGBA", (w, band_h), (0, 0, 0, 255))
    base.paste(dark, (0, top), mask)


def apply_gradient_overlay(base: Image.Image):
    """Apply a full-canvas gradient image between background and text."""
    if not GRADIENT_OVERLAY_ENABLED or not GRADIENT_OVERLAY_PATH:
        return
    try:
        grad = Image.open(GRADIENT_OVERLAY_PATH).convert("RGBA")
    except Exception:
        return
    # scale gradient and shift down
    scale = GRADIENT_OVERLAY_SCALE if GRADIENT_OVERLAY_SCALE else 1.0
    if scale != 1.0:
        grad = grad.resize(
            (max(1, int(grad.size[0] * scale)), max(1, int(grad.size[1] * scale))),
            Image.LANCZOS,
        )
    # place on canvas with vertical shift
    canvas = Image.new("RGBA", base.size, (0, 0, 0, 0))
    x = (base.size[0] - grad.size[0]) // 2
    y = int((base.size[1] - grad.size[1]) // 2 + (base.size[1] * GRADIENT_OVERLAY_Y_SHIFT))
    canvas.alpha_composite(grad, (x, y))
    base.alpha_composite(canvas)


def apply_title_overlay(base: Image.Image, main_start_y: int):
    """Place a title image above the main text with screen blend to remove black."""
    if not TITLE_OVERLAY_ENABLED or not TITLE_OVERLAY_PATH:
        return
    try:
        overlay = Image.open(TITLE_OVERLAY_PATH).convert("RGBA")
    except Exception:
        return
    # Trim transparent padding to fit the word tightly
    alpha_bbox = overlay.split()[-1].getbbox()
    if alpha_bbox:
        overlay = overlay.crop(alpha_bbox)
    # Apply title opacity (fill) before blending
    if TITLE_OVERLAY_OPACITY < 1.0:
        oa = overlay.split()[-1].point(lambda p: int(p * TITLE_OVERLAY_OPACITY))
        overlay.putalpha(oa)
    if TITLE_OVERLAY_SCALE and TITLE_OVERLAY_SCALE != 1.0:
        overlay = overlay.resize(
            (
                max(1, int(overlay.size[0] * TITLE_OVERLAY_SCALE)),
                max(1, int(overlay.size[1] * TITLE_OVERLAY_SCALE)),
            ),
            Image.LANCZOS,
        )
    x = int(round((base.size[0] - overlay.size[0]) / 2))
    y = int(main_start_y - TITLE_OVERLAY_GAP - overlay.size[1] + TITLE_OVERLAY_Y_OFFSET)
    if y < 0:
        y = 0

    # Screen blend only where overlay exists
    base_rgb = base.convert("RGB")
    temp = Image.new("RGB", base.size, (0, 0, 0))
    temp.paste(overlay.convert("RGB"), (x, y), overlay.split()[-1])
    screened = ImageChops.screen(base_rgb, temp).convert("RGBA")
    mask = Image.new("L", base.size, 0)
    mask.paste(overlay.split()[-1], (x, y))
    base.paste(screened, (0, 0), mask)
    if TITLE_OVERLAY_GLOW_RADIUS > 0 and TITLE_OVERLAY_GLOW_OPACITY > 0:
        glow = overlay.filter(ImageFilter.GaussianBlur(radius=TITLE_OVERLAY_GLOW_RADIUS))
        alpha = glow.split()[-1].point(lambda p: int(p * TITLE_OVERLAY_GLOW_OPACITY))
        glow.putalpha(alpha)
        base.alpha_composite(glow, (x, y))
    if TITLE_UNDERLINE:
        # Place underline directly under glyphs using alpha bbox
        alpha_bbox = overlay.split()[-1].getbbox()
        if alpha_bbox:
            _, _, _, oy2 = alpha_bbox
        else:
            oy2 = overlay.size[1]
        uy = y + oy2 + TITLE_UNDERLINE_OFFSET
        if uy < base.size[1]:
            w = max(1, overlay.size[0] - (TITLE_UNDERLINE_TRIM * 2))
            line = Image.new("RGBA", (w, TITLE_UNDERLINE_THICKNESS), (255, 255, 255, 255))
            base.alpha_composite(line, (x + TITLE_UNDERLINE_TRIM, uy))
    if TITLE_OVERLAY_DEBUG_BOX:
        dbg = Image.new("RGBA", base.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(dbg)
        inset = 2
        bw = int(overlay.size[0] * TITLE_BOX_SCALE)
        bh = int(overlay.size[1] * TITLE_BOX_SCALE)
        bx = x + (overlay.size[0] - bw) // 2
        by = y + (overlay.size[1] - bh) // 2
        d.rectangle([bx + inset, by + inset, bx + bw - inset, by + bh - inset], outline=(255, 255, 255, 255), width=2)
        base.alpha_composite(dbg)

def draw_subtext_exact(
    base: Image.Image,
    layer,
    text: str,
    text_block_y_offset: int = TEXT_BLOCK_Y_OFFSET,
    subtext_top_y: Optional[int] = None,
):
    """Render subtext using PSD style or forced settings, then align to layer."""
    if text and SUBTEXT_FORCE_SENTENCE_CASE:
        text = text[:1].upper() + text[1:].lower()
    style = get_psd_subtext_style(layer) or {}
    # Subtext font: use explicit path if provided, else resolve by name.
    font_name = SUBTEXT_FONT_NAME or style.get("font_name")
    font_path = SUBTEXT_FONT_PATH or DEFAULT_FONT
    font_index = None
    if SUBTEXT_FONT_PATH:
        font_name = None
    if font_name:
        resolved_path, resolved_index = resolve_font_from_psd(font_name)
        if resolved_path:
            font_path = resolved_path
            font_index = resolved_index

    base_font_size = float(style.get("font_size", 54))
    if SUBTEXT_FORCE_STYLE:
        if SUBTEXT_FORCE_FONT_SIZE:
            font_size = int(SUBTEXT_FORCE_FONT_SIZE)
        else:
            font_size = max(1, int(base_font_size * SUBTEXT_FORCE_SCALE_MULT) + int(SUBTEXT_FORCE_FONT_DELTA))
        tracking = float(SUBTEXT_FORCE_TRACKING)
        h_scale = 1.0
        v_scale = 1.0
        fill = SUBTEXT_FORCE_FILL
    else:
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

    if SUBTEXT_DIRECT_RENDER:
        # Draw directly centered in layer bbox (no PSD bbox scaling)
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
        # Trim transparent padding for true visual centering
        bbox = temp.split()[-1].getbbox()
        if bbox:
            temp = temp.crop(bbox)
        # center on canvas
        lx1, ly1, lx2, ly2 = layer.bbox
        max_h = max(1, ly2 - ly1)
        x = int(round((base.size[0] - temp.size[0]) / 2)) + SUBTEXT_X_OFFSET
        if SUBTEXT_ALIGN_BOTTOM:
            y = base.size[1] - SUBTEXT_BOTTOM_PADDING - temp.size[1]
        else:
            y = (
                subtext_top_y
                if subtext_top_y is not None
                else ly1 + (max_h - temp.size[1]) // 2 + SUBTEXT_Y_OFFSET + text_block_y_offset
            )
        # Subtext glow (soften harsh edges)
        if SUBTEXT_GLOW_RADIUS > 0 and SUBTEXT_GLOW_OPACITY > 0:
            glow = temp.filter(ImageFilter.GaussianBlur(radius=SUBTEXT_GLOW_RADIUS))
            if SUBTEXT_GLOW_OPACITY < 1.0:
                alpha = glow.split()[-1].point(lambda p: int(p * SUBTEXT_GLOW_OPACITY))
                glow.putalpha(alpha)
            base.alpha_composite(glow, (int(x), int(y)))
        base.alpha_composite(temp, (int(x), int(y)))
        if SUBTEXT_DEBUG_BOX:
            dbg = Image.new("RGBA", base.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(dbg)
            d.rectangle([x, y, x + temp.size[0], y + temp.size[1]], outline=(255, 0, 0, 255), width=1)
            base.alpha_composite(dbg)
        return
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
    bbox = temp.split()[-1].getbbox()
    if bbox:
        temp = temp.crop(bbox)

    # Align to the PSD-rendered glyph bbox inside the layer for precise position.
    orig = layer.composite()
    orig_bbox = alpha_bbox(orig)
    if orig_bbox:
        obx1, oby1, obx2, oby2 = orig_bbox
        target_w = max(1, obx2 - obx1)
        target_h = max(1, oby2 - oby1)
        # scale to match target height (PSD), then apply optional clamps
        scale = target_h / max(1, temp.size[1])
        temp = temp.resize((max(1, int(temp.size[0] * scale)), max(1, int(temp.size[1] * scale))), Image.LANCZOS)
        if SUBTEXT_PSD_HEIGHT_SCALE != 1.0:
            temp = temp.resize(
                (
                    max(1, int(temp.size[0] * SUBTEXT_PSD_HEIGHT_SCALE)),
                    max(1, int(temp.size[1] * SUBTEXT_PSD_HEIGHT_SCALE)),
                ),
                Image.LANCZOS,
            )
        if SUBTEXT_EXTRA_SCALE != 1.0:
            temp = temp.resize(
                (
                    max(1, int(temp.size[0] * SUBTEXT_EXTRA_SCALE)),
                    max(1, int(temp.size[1] * SUBTEXT_EXTRA_SCALE)),
                ),
                Image.LANCZOS,
            )
        target_px = None
        if SUBTEXT_TARGET_HEIGHT_PX:
            target_px = SUBTEXT_TARGET_HEIGHT_PX
        elif SUBTEXT_TARGET_HEIGHT_MULT and SUBTEXT_TARGET_HEIGHT_MULT != 1.0:
            target_px = max(1, int(target_h * SUBTEXT_TARGET_HEIGHT_MULT))
        if target_px:
            scale_px = target_px / max(1, temp.size[1])
            temp = temp.resize(
                (max(1, int(temp.size[0] * scale_px)), max(1, int(temp.size[1] * scale_px))),
                Image.LANCZOS,
            )
        if temp.size[0] > target_w:
            scale_w = target_w / temp.size[0]
            temp = temp.resize((max(1, int(temp.size[0] * scale_w)), max(1, int(temp.size[1] * scale_w))), Image.LANCZOS)
        # place centered on canvas, keep vertical alignment from PSD glyph bbox
        lx1, ly1, _, _ = layer.bbox
        x = int(round((base.size[0] - temp.size[0]) / 2)) + SUBTEXT_X_OFFSET
        if SUBTEXT_ALIGN_BOTTOM:
            y = base.size[1] - SUBTEXT_BOTTOM_PADDING - temp.size[1]
        else:
            y = (
                subtext_top_y
                if subtext_top_y is not None
                else ly1 + oby1 + (target_h - temp.size[1]) // 2 + SUBTEXT_Y_OFFSET + text_block_y_offset
            )
        if SUBTEXT_GLOW_RADIUS > 0 and SUBTEXT_GLOW_OPACITY > 0:
            glow = temp.filter(ImageFilter.GaussianBlur(radius=SUBTEXT_GLOW_RADIUS))
            if SUBTEXT_GLOW_OPACITY < 1.0:
                alpha = glow.split()[-1].point(lambda p: int(p * SUBTEXT_GLOW_OPACITY))
                glow.putalpha(alpha)
            base.alpha_composite(glow, (int(x), int(y)))
        base.alpha_composite(temp, (int(x), int(y)))
        if SUBTEXT_DEBUG_BOX:
            dbg = Image.new("RGBA", base.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(dbg)
            d.rectangle([x, y, x + temp.size[0], y + temp.size[1]], outline=(255, 0, 0, 255), width=1)
            base.alpha_composite(dbg)
        return

    # fallback center on canvas
    lx1, ly1, lx2, ly2 = layer.bbox
    max_h = max(1, ly2 - ly1)
    x = int(round((base.size[0] - temp.size[0]) / 2)) + SUBTEXT_X_OFFSET
    if SUBTEXT_ALIGN_BOTTOM:
        y = base.size[1] - SUBTEXT_BOTTOM_PADDING - temp.size[1]
    else:
        y = (
            subtext_top_y
            if subtext_top_y is not None
            else ly1 + (max_h - temp.size[1]) // 2 + SUBTEXT_Y_OFFSET + text_block_y_offset
        )
    if SUBTEXT_GLOW_RADIUS > 0 and SUBTEXT_GLOW_OPACITY > 0:
        glow = temp.filter(ImageFilter.GaussianBlur(radius=SUBTEXT_GLOW_RADIUS))
        if SUBTEXT_GLOW_OPACITY < 1.0:
            alpha = glow.split()[-1].point(lambda p: int(p * SUBTEXT_GLOW_OPACITY))
            glow.putalpha(alpha)
        base.alpha_composite(glow, (int(x), int(y)))
    base.alpha_composite(temp, (int(x), int(y)))


def fit_main_font_size(lines: List[str], bbox: Tuple[int, int, int, int], font_path: str, font_index: Optional[int], line_height_ratio: float, letter_spacing: float, max_size: int = 140) -> int:
    """Find the largest font size that fits the bbox for all main text lines."""
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


def choose_red_word_indices(words: List[str], max_red: int = 2, red_words: Optional[Set[str]] = None) -> set:
    """Pick word indices to render in red. If red_words set, ONLY those are red."""
    if not words:
        return set()
    if red_words:
        red_indices = set()
        for i, w in enumerate(words):
            cleaned = w.strip(".,!?;:\"'").lower()
            if cleaned in red_words:
                red_indices.add(i)
        if red_indices:
            return red_indices
    return set()


RED_HEX = "#B40000"
RED_RGB = (180, 0, 0, 255)
ALT_RED_HEX = "#000000"
ALT_RED_RGB = (0, 0, 0, 255)


def draw_main_text_with_random_red(
    base: Image.Image,
    lines: List[str],
    bbox: Tuple[int, int, int, int],
    font: ImageFont.FreeTypeFont,
    line_height_ratio: float,
    letter_spacing: float,
    glow_radius: int,
    glow_opacity: float,
    text_block_y_offset: int = TEXT_BLOCK_Y_OFFSET,
    red_words: Optional[Set[str]] = None,
):
    """Draw main text with randomized red words and glow, centered in bbox."""
    x1, y1, x2, y2 = bbox
    layer_w = x2 - x1
    layer_h = y2 - y1
    line_height = int(font.size * line_height_ratio)
    block_height = len(lines) * line_height
    start_y = y1 + (layer_h - block_height) // 2 + text_block_y_offset + MAIN_Y_OFFSET

    # Build a text layer with random red words
    text_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(text_layer)

    white = (255, 255, 255, 255)
    red = RED_RGB
    space_w = font.getlength(" ")
    for i, line in enumerate(lines):
        words = line.split(" ")
        red_indices = choose_red_word_indices(words, red_words=red_words)
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

    return start_y, block_height


def load_image_as_base(image_path: str, canvas_size: Tuple[int, int]) -> Image.Image:
    """Load and center-crop an image to the target canvas size."""
    img = Image.open(image_path)
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    return ImageOps.fit(img, canvas_size, method=Image.LANCZOS, centering=(0.5, 0.5))


def render(
    psd_path: str,
    out_path: str,
    lines: List[str],
    font_path: str = DEFAULT_FONT,
    font_index: Optional[int] = DEFAULT_FONT_INDEX,
    subline: str = None,
    image_path: Optional[str] = None,
    red_words: Optional[Set[str]] = None,
):
    """Render the final poster image to out_path."""
    if not lines:
        raise SystemExit("Provide at least 1 line of text.")
    if len(lines) > 3:
        raise SystemExit("Max 3 lines.")

    psd = PSDImage.open(psd_path)

    subtext_layer = None
    type_layers = []
    for layer in psd.descendants():
        if layer.is_visible() and layer.kind == "type" and TEXT_LAYER_NAME_SUBSTR in str(layer.name):
            layer.visible = False
        if layer.is_visible() and layer.kind == "type" and SUBTEXT_LAYER_NAME_SUBSTR in str(layer.name):
            subtext_layer = layer
            if subline:
                layer.visible = False
        if layer.is_visible():
            lname = str(layer.name)
            if "logo" in lname.lower():
                layer.visible = True
            elif HIDE_SWIPE_LEFT and SWIPE_LEFT_LAYER_NAME_SUBSTR in lname:
                layer.visible = False
            elif any(s in lname for s in HIDE_LAYER_NAME_SUBSTRS):
                layer.visible = False
            elif any(s in lname for s in SUBJECT_LAYER_NAME_SUBSTRS):
                layer.visible = False
            elif any(s in lname for s in BACKGROUND_LAYER_NAME_SUBSTRS):
                layer.visible = False
        if layer.is_visible() and layer.kind == "type":
            type_layers.append(layer)

    # Fallback: if subtext layer name doesn't match, pick the nearest visible type layer
    # below the main text bbox (excluding known main/swipe layers).
    if subline and subtext_layer is None and type_layers:
        candidates = []
        for layer in type_layers:
            name = str(layer.name)
            if TEXT_LAYER_NAME_SUBSTR in name:
                continue
            if SWIPE_LEFT_LAYER_NAME_SUBSTR in name:
                continue
            if SUBTEXT_LAYER_NAME_SUBSTR in name:
                continue
            if not hasattr(layer, "bbox") or not layer.bbox:
                continue
            lx1, ly1, lx2, ly2 = layer.bbox
            if ly2 <= ly1:
                continue
            candidates.append((layer, ly1, ly2))
        if candidates:
            target_y = TEXT_LAYER_BBOX[3]
            below = [c for c in candidates if c[1] >= target_y]
            pick = None
            if below:
                pick = min(below, key=lambda c: abs(c[1] - target_y))
            else:
                pick = min(candidates, key=lambda c: abs(c[1] - target_y))
            subtext_layer = pick[0]
            subtext_layer.visible = False

    base = psd.composite()
    # Preserve logo on top of background replacements
    logo_layer = None
    for layer in psd.descendants():
        if str(layer.name).lower() == "logo":
            logo_layer = layer
            break

    if base.mode != "RGBA":
        base = base.convert("RGBA")
    if base.size != CANVAS_SIZE:
        base = base.resize(CANVAS_SIZE, Image.LANCZOS)

    if image_path:
        base = load_image_as_base(image_path, CANVAS_SIZE)
    if TEMP_CONTRAST and TEMP_CONTRAST != 1.0:
        base = ImageEnhance.Contrast(base).enhance(TEMP_CONTRAST)
    if TEMP_BRIGHTNESS and TEMP_BRIGHTNESS != 1.0:
        base = ImageEnhance.Brightness(base).enhance(TEMP_BRIGHTNESS)
    apply_cinematic_depth(base)

    # Subtle gradient blur behind text (centered on the text block)
    text_center_y = int((TEXT_LAYER_BBOX[1] + TEXT_LAYER_BBOX[3]) / 2 + TEXT_BLOCK_Y_OFFSET + MAIN_Y_OFFSET)
    apply_text_bg_gradient(base, text_center_y)
    apply_gradient_overlay(base)

    # Re-apply logo over background/gradients so it never disappears
    if logo_layer is not None:
        try:
            logo_img = logo_layer.composite()
            if logo_img is not None:
                if logo_img.mode != "RGBA":
                    logo_img = logo_img.convert("RGBA")
                base.alpha_composite(logo_img, (int(logo_layer.bbox[0]), int(logo_layer.bbox[1])))
        except Exception:
            pass

    main_font_size = max(
        8,
        fit_main_font_size(lines, TEXT_LAYER_BBOX, font_path, font_index, LINE_HEIGHT_RATIO, LETTER_SPACING, max_size=140) - 10,
    )
    if font_index is None:
        font = ImageFont.truetype(font_path, main_font_size)
    else:
        font = ImageFont.truetype(font_path, main_font_size, index=font_index)

    main_start_y, main_block_h = draw_main_text_with_random_red(
        base,
        lines,
        TEXT_LAYER_BBOX,
        font,
        LINE_HEIGHT_RATIO,
        LETTER_SPACING,
        glow_radius=GLOW_RADIUS_PX,
        glow_opacity=GLOW_OPACITY,
        text_block_y_offset=TEXT_BLOCK_Y_OFFSET,
        red_words=red_words,
    )
    apply_title_overlay(base, main_start_y)

    if subtext_layer is not None:
        use_subline = subline if (subline is not None and subline != "") else DEFAULT_SUBLINE
        if use_subline:
            norm_subline = use_subline
            if SUBTEXT_FORCE_SENTENCE_CASE:
                norm_subline = use_subline[:1].upper() + use_subline[1:].lower()
            draw_subtext_exact(
                base,
                subtext_layer,
                norm_subline,
                text_block_y_offset=TEXT_BLOCK_Y_OFFSET,
            )

    apply_texture(base)
    out = Path(out_path).expanduser()
    out.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(out, quality=95)
    print(out)


def parse_args():
    """CLI argument parsing."""
    p = argparse.ArgumentParser(description="Render PSD poster with replaced main text.")
    p.add_argument("--psd", default=None, help="Path to PSD file")
    p.add_argument("--out", required=True, help="Output PNG path")
    p.add_argument("--font", default=None, help="Path to main font")
    p.add_argument("--font-index", type=int, default=None, help="Font index for TTC fonts")
    p.add_argument("--line", action="append", default=[], help="Main text line (repeat up to 3x)")
    p.add_argument("--subline", default=None, help="Subtext line (replaces the small text under main text)")
    p.add_argument("--image", default=None, help="Path to background image (center-cropped to canvas)")
    p.add_argument("--red", action="append", default=[], help="Word to force red (repeatable)")
    p.add_argument("--export-layers", default=None, help="Export PSD layers to this folder and exit")
    p.add_argument("--export-all", action="store_true", help="Include hidden layers when exporting")
    return p.parse_args()


def main():
    args = parse_args()
    cfg = load_config()
    psd_path = args.psd or os.getenv("AIPOSTER_PSD") or cfg.get("psd_path") or DEFAULT_PSD
    font_path = args.font or os.getenv("AIPOSTER_FONT") or cfg.get("font_path") or DEFAULT_FONT
    font_index = args.font_index
    if font_index is None:
        env_idx = os.getenv("AIPOSTER_FONT_INDEX")
        if env_idx is not None and env_idx != "":
            try:
                font_index = int(env_idx)
            except Exception:
                font_index = DEFAULT_FONT_INDEX
        else:
            font_index = cfg.get("font_index", DEFAULT_FONT_INDEX)

    if args.export_layers:
        export_layers(psd_path, args.export_layers, include_hidden=args.export_all)
        return

    red_words = {w.strip().lower() for w in (args.red or []) if w.strip()}
    render(
        psd_path,
        args.out,
        args.line,
        font_path=font_path,
        font_index=font_index,
        subline=args.subline,
        image_path=args.image,
        red_words=red_words if red_words else None,
    )


if __name__ == "__main__":
    main()
HIDE_SWIPE_LEFT = True
