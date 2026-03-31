from __future__ import annotations

import base64
from io import BytesIO
from urllib.parse import urlencode

import qrcode
from PIL import Image, ImageDraw, ImageFont

from config import PUBLIC_BASE_URL


STICKER_PRESETS = {
    "Modern Sans": {
        "heading_font": ["DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"],
        "meta_font": ["DejaVuSans.ttf", "Arial.ttf", "arial.ttf"],
        "eyebrow_font": ["DejaVuSans.ttf", "Arial.ttf", "arial.ttf"],
        "background": "#F8FAFC",
        "panel": "#FFFFFF",
        "title": "#0F172A",
        "body": "#1E293B",
        "accent": "#0F766E",
        "border": "#D6E4F0",
    },
    "Elegant Serif": {
        "heading_font": ["DejaVuSerif-Bold.ttf", "Georgia Bold.ttf", "georgiab.ttf"],
        "meta_font": ["DejaVuSerif.ttf", "Georgia.ttf", "georgia.ttf"],
        "eyebrow_font": ["DejaVuSans.ttf", "Arial.ttf", "arial.ttf"],
        "background": "#FFFDF8",
        "panel": "#FFFFFF",
        "title": "#1F2937",
        "body": "#374151",
        "accent": "#B45309",
        "border": "#F0E4C9",
    },
    "Mono Grid": {
        "heading_font": ["DejaVuSansMono-Bold.ttf", "Courier New Bold.ttf", "courbd.ttf"],
        "meta_font": ["DejaVuSansMono.ttf", "Courier New.ttf", "cour.ttf"],
        "eyebrow_font": ["DejaVuSansMono.ttf", "Courier New.ttf", "cour.ttf"],
        "background": "#F8FAFC",
        "panel": "#F8FAFC",
        "title": "#111827",
        "body": "#334155",
        "accent": "#2563EB",
        "border": "#CBD5E1",
    },
    "Bold Banner": {
        "heading_font": ["DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"],
        "meta_font": ["DejaVuSans.ttf", "Arial.ttf", "arial.ttf"],
        "eyebrow_font": ["DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"],
        "background": "#0F172A",
        "panel": "#111827",
        "title": "#F8FAFC",
        "body": "#E2E8F0",
        "accent": "#22C55E",
        "border": "#1E293B",
    },
    "Soft Rounded": {
        "heading_font": ["DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf"],
        "meta_font": ["DejaVuSans.ttf", "Arial.ttf", "arial.ttf"],
        "eyebrow_font": ["DejaVuSans.ttf", "Arial.ttf", "arial.ttf"],
        "background": "#FDF2F8",
        "panel": "#FFFFFF",
        "title": "#1F2937",
        "body": "#475569",
        "accent": "#DB2777",
        "border": "#F5D0E6",
    },
}


def _load_font(candidates: list[str], size: int):
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def build_vehicle_link(vehicle_id: int) -> str:
    query = urlencode({"view": "vehicle", "vehicle_id": vehicle_id})
    return f"{PUBLIC_BASE_URL}/?{query}"


def generate_qr_png(vehicle_id: int) -> tuple[str, bytes]:
    vehicle_link = build_vehicle_link(vehicle_id)
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(vehicle_link)
    qr.make(fit=True)

    image = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return vehicle_link, buffer.getvalue()


def png_to_data_uri(png_bytes: bytes) -> str:
    encoded = base64.b64encode(png_bytes).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def generate_sticker_png(vehicle_id: int, website_name: str, preset_name: str, qr_png: bytes | None = None) -> bytes:
    preset = STICKER_PRESETS.get(preset_name, STICKER_PRESETS["Modern Sans"])
    _, fallback_qr = generate_qr_png(vehicle_id)
    qr_bytes = qr_png or fallback_qr

    qr_image = Image.open(BytesIO(qr_bytes)).convert("RGB").resize((176, 176))
    canvas = Image.new("RGB", (1120, 260), preset["background"])
    draw = ImageDraw.Draw(canvas)

    draw.rounded_rectangle((6, 6, 1114, 254), radius=26, fill=preset["panel"], outline=preset["border"], width=2)

    qr_box = (22, 22, 214, 214)
    draw.rounded_rectangle(qr_box, radius=16, fill="#FFFFFF")
    canvas.paste(qr_image, (30, 30))

    eyebrow_font = _load_font(preset["eyebrow_font"], 28)
    title_font = _load_font(preset["heading_font"], 58)
    meta_font = _load_font(preset["meta_font"], 34)
    website_font = _load_font(preset["meta_font"], 26)

    content_x = 245
    draw.text((content_x, 28), website_name.upper(), font=eyebrow_font, fill=preset["accent"], spacing=6)
    draw.text((content_x, 78), "Need to contact the vehicle owner?", font=title_font, fill=preset["title"])
    draw.text((content_x, 158), "Scan QR", font=meta_font, fill=preset["body"])
    draw.text((content_x, 204), f"Vehicle ID #{vehicle_id}", font=meta_font, fill=preset["title"])

    website_text = f"Powered by {website_name}"
    text_width = draw.textbbox((0, 0), website_text, font=website_font)[2]
    draw.text((1088 - text_width, 220), website_text, font=website_font, fill=preset["accent"])

    buffer = BytesIO()
    canvas.save(buffer, format="PNG")
    return buffer.getvalue()
