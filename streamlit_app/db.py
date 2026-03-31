from __future__ import annotations

from contextlib import contextmanager

import pymysql
from pymysql.cursors import DictCursor

from config import (
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_PORT,
    DB_SSL,
    DB_SSL_REJECT_UNAUTHORIZED,
    DB_USER,
)
from security import hash_password


def _connection_kwargs() -> dict:
    kwargs = {
        "host": DB_HOST,
        "port": DB_PORT,
        "user": DB_USER,
        "password": DB_PASSWORD,
        "database": DB_NAME,
        "cursorclass": DictCursor,
        "autocommit": False,
    }

    if DB_SSL:
        kwargs["ssl"] = {"check_hostname": DB_SSL_REJECT_UNAUTHORIZED}

    return kwargs


@contextmanager
def get_connection():
    connection = pymysql.connect(**_connection_kwargs())
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_database():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            for statement in [
                """
                CREATE TABLE IF NOT EXISTS users (
                  id INT PRIMARY KEY AUTO_INCREMENT,
                  name VARCHAR(100) NOT NULL,
                  email VARCHAR(150) NOT NULL UNIQUE,
                  phone VARCHAR(20) NOT NULL,
                  password_hash VARCHAR(255) NOT NULL,
                  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS vehicles (
                  id INT PRIMARY KEY AUTO_INCREMENT,
                  user_id INT NOT NULL,
                  vehicle_number VARCHAR(30) NOT NULL,
                  vehicle_type VARCHAR(30) NOT NULL,
                  owner_name VARCHAR(100) NOT NULL,
                  contact_phone VARCHAR(20) NOT NULL,
                  emergency_contact VARCHAR(20) NOT NULL,
                  qr_code_url TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS scans (
                  id INT PRIMARY KEY AUTO_INCREMENT,
                  vehicle_id INT NOT NULL,
                  scan_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                  ip_address VARCHAR(100) NOT NULL,
                  device VARCHAR(255) NOT NULL,
                  latitude DECIMAL(10, 7) NULL,
                  longitude DECIMAL(10, 7) NULL,
                  CONSTRAINT fk_scan_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
                )
                """,
                """
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                  id INT PRIMARY KEY AUTO_INCREMENT,
                  user_id INT NOT NULL,
                  token_hash VARCHAR(255) NOT NULL,
                  expires_at DATETIME NOT NULL,
                  used_at DATETIME NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
                """,
            ]:
                cursor.execute(statement)

            for table_name, index_name, ddl in [
                (
                    "vehicles",
                    "idx_vehicles_user_id",
                    "CREATE INDEX idx_vehicles_user_id ON vehicles(user_id)",
                ),
                (
                    "scans",
                    "idx_scans_vehicle_id",
                    "CREATE INDEX idx_scans_vehicle_id ON scans(vehicle_id)",
                ),
                (
                    "scans",
                    "idx_scans_scan_time",
                    "CREATE INDEX idx_scans_scan_time ON scans(scan_time)",
                ),
                (
                    "password_reset_tokens",
                    "idx_reset_user_id",
                    "CREATE INDEX idx_reset_user_id ON password_reset_tokens(user_id)",
                ),
                (
                    "password_reset_tokens",
                    "idx_reset_token_hash",
                    "CREATE INDEX idx_reset_token_hash ON password_reset_tokens(token_hash)",
                ),
            ]:
                cursor.execute(
                    """
                    SELECT 1
                    FROM information_schema.statistics
                    WHERE table_schema = %s AND table_name = %s AND index_name = %s
                    """,
                    (DB_NAME, table_name, index_name),
                )
                if not cursor.fetchone():
                    cursor.execute(ddl)


def ensure_admin_user():
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s", (ADMIN_EMAIL,))
            existing = cursor.fetchone()
            if existing:
                return

            cursor.execute(
                """
                INSERT INTO users (name, email, phone, password_hash, role)
                VALUES (%s, %s, %s, %s, 'admin')
                """,
                ("System Admin", ADMIN_EMAIL, "0000000000", hash_password(ADMIN_PASSWORD)),
            )


def fetch_one(query: str, params: tuple | list | None = None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            return cursor.fetchone()


def fetch_all(query: str, params: tuple | list | None = None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            return cursor.fetchall()


def execute(query: str, params: tuple | list | None = None):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            return cursor.lastrowid
