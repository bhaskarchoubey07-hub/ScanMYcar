from __future__ import annotations

import base64
from io import BytesIO
from urllib.parse import urlencode

import qrcode

from config import PUBLIC_BASE_URL


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
