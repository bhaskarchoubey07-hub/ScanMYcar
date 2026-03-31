from __future__ import annotations

import smtplib
from email.message import EmailMessage

from config import SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER


def email_is_configured() -> bool:
    return bool(SMTP_USER and SMTP_PASSWORD and SMTP_FROM)


def send_password_reset_email(email: str, reset_link: str):
    if not email_is_configured():
        raise RuntimeError("SMTP is not configured.")

    message = EmailMessage()
    message["Subject"] = "Reset your Smart Vehicle QR password"
    message["From"] = SMTP_FROM
    message["To"] = email
    message.set_content(
        "\n".join(
            [
                "We received a request to reset your password.",
                "",
                f"Open this link to set a new password: {reset_link}",
                "",
                "If you did not request this, you can ignore this message.",
            ]
        )
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(message)
