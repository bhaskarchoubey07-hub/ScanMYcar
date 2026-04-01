import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / "backend" / ".env")
load_dotenv(BASE_DIR / ".env")


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


APP_NAME = os.getenv("APP_NAME", "Smart Vehicle QR Contact System")
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8501").rstrip("/")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "defaultdb")
DB_SSL = _as_bool(os.getenv("DB_SSL"))
DB_SSL_REJECT_UNAUTHORIZED = _as_bool(os.getenv("DB_SSL_REJECT_UNAUTHORIZED"), default=False)
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com").lower()
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "ChangeMe123")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)
RESET_TOKEN_EXPIRY_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRY_MINUTES", "30"))
