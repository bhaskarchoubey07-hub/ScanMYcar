from __future__ import annotations

import os
import secrets
from datetime import datetime, timedelta
from hashlib import sha256
from urllib.parse import urlencode

import streamlit as st

from config import ADMIN_EMAIL, APP_NAME, PUBLIC_BASE_URL, RESET_TOKEN_EXPIRY_MINUTES
from db import ensure_admin_user, execute, fetch_all, fetch_one, init_database
from email_utils import email_is_configured, send_password_reset_email
from qr_utils import STICKER_PRESETS, build_vehicle_link, generate_qr_png, generate_sticker_png, png_to_data_uri
from security import hash_password, verify_password


st.set_page_config(
    page_title=APP_NAME,
    page_icon=":oncoming_automobile:",
    layout="wide",
    initial_sidebar_state="expanded",
)


@st.cache_data
def load_styles():
    css_path = os.path.join(os.path.dirname(__file__), "styles.css")
    with open(css_path, "r", encoding="utf-8") as handle:
        return handle.read()


@st.cache_resource
def bootstrap():
    init_database()
    ensure_admin_user()


def init_state():
    if "user" not in st.session_state:
        st.session_state.user = None
    if "auth_view" not in st.session_state:
        st.session_state.auth_view = "Landing"
    if "password_reset_link" not in st.session_state:
        st.session_state.password_reset_link = ""


def set_query_params(**kwargs):
    st.query_params.clear()
    for key, value in kwargs.items():
        st.query_params[key] = str(value)


def get_request_context():
    headers = {}
    user_agent = "Unknown device"
    ip_address = "unknown"

    context = getattr(st, "context", None)
    if context is not None:
        headers = dict(getattr(context, "headers", {}) or {})

    user_agent = headers.get("User-Agent") or headers.get("user-agent") or user_agent
    forwarded = headers.get("X-Forwarded-For") or headers.get("x-forwarded-for")
    if forwarded:
        ip_address = forwarded.split(",")[0].strip()

    return ip_address, user_agent


def current_user():
    return st.session_state.user


def require_login():
    if not current_user():
        st.warning("Please login to continue.")
        st.session_state.auth_view = "Login"
        st.stop()


def require_admin():
    require_login()
    if current_user()["role"] != "admin":
        st.error("Admin access required.")
        st.stop()


def register_user(name: str, phone: str, email: str, password: str):
    if len(name.strip()) < 2:
        raise ValueError("Name must be at least 2 characters long.")
    if len(phone.strip()) < 8:
        raise ValueError("Phone number must be at least 8 digits long.")
    if "@" not in email or "." not in email:
        raise ValueError("Please enter a valid email address.")
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")

    normalized_email = email.strip().lower()
    existing = fetch_one("SELECT id FROM users WHERE email = %s", (normalized_email,))
    if existing:
        raise ValueError("Email already registered.")

    role = "admin" if normalized_email == ADMIN_EMAIL else "user"
    user_id = execute(
        """
        INSERT INTO users (name, email, phone, password_hash, role)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (name.strip(), normalized_email, phone.strip(), hash_password(password), role),
    )
    return fetch_one(
        "SELECT id, name, email, phone, role, created_at FROM users WHERE id = %s",
        (user_id,),
    )


def login_user(email: str, password: str):
    user = fetch_one("SELECT * FROM users WHERE email = %s", (email.strip().lower(),))
    if not user or not verify_password(password, user["password_hash"]):
        raise ValueError("Invalid credentials.")

    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"],
    }


def build_reset_link(token: str) -> str:
    return f"{PUBLIC_BASE_URL}/?{urlencode({'view': 'reset_password', 'token': token})}"


def request_password_reset(email: str) -> str:
    normalized_email = email.strip().lower()
    user = fetch_one("SELECT id, email FROM users WHERE email = %s", (normalized_email,))
    if not user:
        return ""

    raw_token = secrets.token_urlsafe(32)
    token_hash = sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)

    execute(
        "UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = %s AND used_at IS NULL",
        (user["id"],),
    )
    execute(
        """
        INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
        VALUES (%s, %s, %s)
        """,
        (user["id"], token_hash, expires_at),
    )

    reset_link = build_reset_link(raw_token)
    if email_is_configured():
        send_password_reset_email(user["email"], reset_link)
        st.session_state.password_reset_link = ""
    else:
        st.session_state.password_reset_link = reset_link

    return reset_link


def consume_reset_token(token: str):
    token_hash = sha256(token.encode("utf-8")).hexdigest()
    return fetch_one(
        """
        SELECT prt.id, prt.user_id, u.email
        FROM password_reset_tokens prt
        JOIN users u ON u.id = prt.user_id
        WHERE prt.token_hash = %s
          AND prt.used_at IS NULL
          AND prt.expires_at > CURRENT_TIMESTAMP
        ORDER BY prt.created_at DESC
        LIMIT 1
        """,
        (token_hash,),
    )


def reset_password(token: str, new_password: str):
    if len(new_password) < 8:
        raise ValueError("Password must be at least 8 characters long.")

    reset_row = consume_reset_token(token)
    if not reset_row:
        raise ValueError("Reset link is invalid or expired.")

    execute(
        "UPDATE users SET password_hash = %s WHERE id = %s",
        (hash_password(new_password), reset_row["user_id"]),
    )
    execute("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = %s", (reset_row["id"],))


def load_user_vehicles(user_id: int):
    vehicles = fetch_all(
        """
        SELECT
          v.*,
          COUNT(s.id) AS total_scans
        FROM vehicles v
        LEFT JOIN scans s ON s.vehicle_id = v.id
        WHERE v.user_id = %s
        GROUP BY v.id
        ORDER BY v.created_at DESC
        """,
        (user_id,),
    )
    stats = fetch_one(
        """
        SELECT
          COUNT(DISTINCT v.id) AS totalVehicles,
          COUNT(s.id) AS totalScans
        FROM vehicles v
        LEFT JOIN scans s ON s.vehicle_id = v.id
        WHERE v.user_id = %s
        """,
        (user_id,),
    )
    return vehicles, stats or {"totalVehicles": 0, "totalScans": 0}


def add_vehicle(vehicle_number, vehicle_type, owner_name, contact_phone, emergency_contact):
    if len(vehicle_number.strip()) < 4:
        raise ValueError("Vehicle number must be at least 4 characters long.")
    if len(owner_name.strip()) < 2:
        raise ValueError("Owner name must be at least 2 characters long.")
    if len(contact_phone.strip()) < 8 or len(emergency_contact.strip()) < 8:
        raise ValueError("Contact numbers must be at least 8 digits long.")

    user = current_user()
    vehicle_id = execute(
        """
        INSERT INTO vehicles (
          user_id,
          vehicle_number,
          vehicle_type,
          owner_name,
          contact_phone,
          emergency_contact,
          qr_code_url
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            user["id"],
            vehicle_number.strip().upper(),
            vehicle_type,
            owner_name.strip(),
            contact_phone.strip(),
            emergency_contact.strip(),
            "",
        ),
    )
    vehicle_link, _ = generate_qr_png(vehicle_id)
    execute("UPDATE vehicles SET qr_code_url = %s WHERE id = %s", (vehicle_link, vehicle_id))
    return vehicle_id


def update_vehicle(vehicle_id, vehicle_number, vehicle_type, owner_name, contact_phone, emergency_contact):
    if len(vehicle_number.strip()) < 4:
        raise ValueError("Vehicle number must be at least 4 characters long.")
    if len(owner_name.strip()) < 2:
        raise ValueError("Owner name must be at least 2 characters long.")
    if len(contact_phone.strip()) < 8 or len(emergency_contact.strip()) < 8:
        raise ValueError("Contact numbers must be at least 8 digits long.")

    vehicle = fetch_one(
        "SELECT id FROM vehicles WHERE id = %s AND user_id = %s",
        (vehicle_id, current_user()["id"]),
    )
    if not vehicle:
        raise ValueError("Vehicle not found or you do not have permission to edit it.")

    execute(
        """
        UPDATE vehicles
        SET vehicle_number = %s,
            vehicle_type = %s,
            owner_name = %s,
            contact_phone = %s,
            emergency_contact = %s
        WHERE id = %s AND user_id = %s
        """,
        (
            vehicle_number.strip().upper(),
            vehicle_type,
            owner_name.strip(),
            contact_phone.strip(),
            emergency_contact.strip(),
            vehicle_id,
            current_user()["id"],
        ),
    )


def render_metric_cards(metrics):
    columns = st.columns(len(metrics))
    for column, (label, value) in zip(columns, metrics):
        with column:
            st.markdown(
                f"""
                <div class="metric-card">
                  <div class="eyebrow">{label}</div>
                  <div style="font-size:2.4rem;font-weight:700;">{value}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )


def render_landing():
    hero_left, hero_right = st.columns([1.2, 0.8], gap="large")
    with hero_left:
        st.markdown(
            """
            <div class="hero-card">
              <div class="eyebrow">Smart Vehicle QR Contact System</div>
              <div class="hero-title">Protect owner privacy and still make every parked vehicle reachable.</div>
              <p class="muted">
                Register a car or bike, generate a secure QR sticker, and let finders contact the owner
                without exposing phone numbers publicly.
              </p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with hero_right:
        st.markdown(
            """
            <div class="surface-card">
              <div class="eyebrow">How It Works</div>
              <ol class="muted">
                <li>Create an owner account.</li>
                <li>Register your vehicle and generate a QR sticker.</li>
                <li>When someone scans it, they get safe contact actions instead of your raw number.</li>
              </ol>
            </div>
            """,
            unsafe_allow_html=True,
        )

    render_metric_cards(
        [
            ("Private Contact", "100%"),
            ("PostgreSQL Ready", "Live"),
            ("QR Stickers", "Printable"),
        ]
    )

    st.markdown("### Feature Stack")
    c1, c2, c3 = st.columns(3, gap="large")
    for column, title, items in [
        (
            c1,
            "Owner Tools",
            ["Registration and login", "Vehicle dashboard", "QR download and sticker preview"],
        ),
        (
            c2,
            "Public Safety",
            ["Vehicle public page", "Scan logging", "Call, WhatsApp, and SMS actions"],
        ),
        (
            c3,
            "Admin Analytics",
            ["Users overview", "Vehicles overview", "Scan activity timeline"],
        ),
    ]:
        with column:
            st.markdown(
                f"""
                <div class="surface-card">
                  <h4>{title}</h4>
                  <ul class="feature-list muted">
                    <li>{items[0]}</li>
                    <li>{items[1]}</li>
                    <li>{items[2]}</li>
                  </ul>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown("### Buy QR Sticker")
    st.info(
        "Generate a QR sticker inside the dashboard, download the PNG, and print it on weatherproof vinyl."
    )

    st.markdown("### FAQ")
    with st.expander("Does the scan page expose my number publicly?"):
        st.write("No. The page shows secure contact actions and never prints the raw number on screen.")
    with st.expander("Can I use this for bikes and scooters too?"):
        st.write("Yes. Cars, bikes, scooters, trucks, and custom vehicle types are supported.")
    with st.expander("Does it store scan analytics?"):
        st.write("Yes. Each scan records timestamp, IP address, user agent, and optional location values.")


def render_register():
    st.subheader("Create your account")
    with st.form("register_form", clear_on_submit=False):
        name = st.text_input("Full name")
        phone = st.text_input("Phone number")
        email = st.text_input("Email address")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Register")

    if submitted:
        try:
            user = register_user(name, phone, email, password)
            st.session_state.user = user
            st.session_state.auth_view = "Dashboard"
            st.success("Registration successful.")
            st.rerun()
        except Exception as error:
            st.error(str(error))


def render_login():
    st.subheader("Welcome back")
    with st.form("login_form", clear_on_submit=False):
        email = st.text_input("Email address")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Login")

    if submitted:
        try:
            st.session_state.user = login_user(email, password)
            st.session_state.auth_view = "Admin" if st.session_state.user["role"] == "admin" else "Dashboard"
            st.success("Login successful.")
            st.rerun()
        except Exception as error:
            st.error(str(error))

    st.markdown("#### Forgot password?")
    with st.form("forgot_password_form", clear_on_submit=False):
        reset_email = st.text_input("Enter your registered email", key="forgot_email")
        requested = st.form_submit_button("Send reset link")

    if requested:
        try:
            reset_link = request_password_reset(reset_email)
            if reset_link:
                if email_is_configured():
                    st.success("Password reset link sent to your email.")
                else:
                    st.warning("SMTP is not configured yet. Use the reset link below for testing.")
                    st.code(reset_link, language="text")
            else:
                st.success("If that email exists, a reset link is ready.")
        except Exception as error:
            st.error(str(error))

    if st.session_state.password_reset_link:
        st.info("Developer fallback reset link")
        st.code(st.session_state.password_reset_link, language="text")


def render_reset_password(token: str):
    st.subheader("Set a new password")
    token_row = consume_reset_token(token)
    if not token_row:
        st.error("This reset link is invalid or expired.")
        if st.button("Back to login"):
            set_query_params()
            st.session_state.auth_view = "Login"
            st.rerun()
        return

    with st.form("reset_password_form"):
        new_password = st.text_input("New password", type="password")
        confirm_password = st.text_input("Confirm new password", type="password")
        submitted = st.form_submit_button("Update password")

    if submitted:
        try:
            if new_password != confirm_password:
                raise ValueError("Passwords do not match.")
            reset_password(token, new_password)
            st.success("Password updated. Please login with your new password.")
            if st.button("Go to login"):
                set_query_params()
                st.session_state.auth_view = "Login"
                st.rerun()
        except Exception as error:
            st.error(str(error))


def render_dashboard():
    require_login()
    vehicles, stats = load_user_vehicles(current_user()["id"])
    st.subheader("Your dashboard")
    render_metric_cards(
        [
            ("Vehicles", stats.get("totalVehicles", 0)),
            ("Scans", stats.get("totalScans", 0)),
            ("Active QR", len([v for v in vehicles if v["qr_code_url"]])),
        ]
    )

    if not vehicles:
        st.info("No vehicles registered yet. Open 'Add Vehicle' from the sidebar to create your first sticker.")
        return

    for vehicle in vehicles:
        qr_target, qr_png = generate_qr_png(vehicle["id"])
        qr_src = png_to_data_uri(qr_png)
        with st.container(border=True):
            title_col, action_col = st.columns([1.3, 1], gap="large")
            with title_col:
                st.markdown(f"### {vehicle['vehicle_number']}")
                st.write(f"{vehicle['vehicle_type'].title()} - {vehicle['owner_name']}")
                st.caption(
                    f"Created {vehicle['created_at'].strftime('%Y-%m-%d %H:%M') if hasattr(vehicle['created_at'], 'strftime') else vehicle['created_at']}"
                )
                st.write(f"Total scans: {vehicle['total_scans']}")
                st.code(qr_target, language="text")
            with action_col:
                st.image(qr_png, caption="QR Sticker Preview", width=220)
                st.download_button(
                    label=f"Download QR for {vehicle['vehicle_number']}",
                    data=qr_png,
                    file_name=f"vehicle-{vehicle['id']}.png",
                    mime="image/png",
                    key=f"download-{vehicle['id']}",
                )
                st.link_button(
                    "Open public page",
                    build_vehicle_link(vehicle["id"]),
                    use_container_width=True,
                )

            st.markdown(
                f"""
                <div class="qr-sticker">
                  <img src="{qr_src}" alt="QR code" width="120" />
                  <div>
                    <div style="font-size:0.8rem;letter-spacing:0.2em;text-transform:uppercase;color:#0f766e;">Vehicle Sticker</div>
                    <div style="font-size:1.6rem;font-weight:700;">Need to contact the vehicle owner?</div>
                    <div>Scan QR</div>
                    <div style="margin-top:0.5rem;font-weight:600;">Vehicle ID #{vehicle['id']}</div>
                  </div>
                </div>
                """,
                unsafe_allow_html=True,
            )


def render_history():
    require_login()
    vehicles, stats = load_user_vehicles(current_user()["id"])
    st.subheader("History and edits")
    st.caption("Review generated QR entries and fix any vehicle details that were entered by mistake.")

    render_metric_cards(
        [
            ("Vehicles", stats.get("totalVehicles", 0)),
            ("Scans", stats.get("totalScans", 0)),
            ("Editable Entries", len(vehicles)),
        ]
    )

    if not vehicles:
        st.info("No history yet. Add a vehicle first.")
        return

    history_csv = "\n".join(
        [
            "vehicle_id,vehicle_number,vehicle_type,owner_name,total_scans,created_at",
            *[
                f"{vehicle['id']},{vehicle['vehicle_number']},{vehicle['vehicle_type']},{vehicle['owner_name']},{vehicle['total_scans']},{vehicle['created_at']}"
                for vehicle in vehicles
            ],
        ]
    )
    st.download_button(
        "Download vehicle history CSV",
        data=history_csv,
        file_name="vehicle-history.csv",
        mime="text/csv",
    )

    vehicle_types = ["car", "bike", "scooter", "truck", "other"]
    preset_names = list(STICKER_PRESETS.keys())
    for vehicle in vehicles:
        qr_target, qr_png = generate_qr_png(vehicle["id"])
        with st.expander(f"{vehicle['vehicle_number']} - edit details", expanded=False):
            top_col, qr_col = st.columns([1.4, 0.8], gap="large")
            with top_col:
                st.write(f"Owner: {vehicle['owner_name']}")
                st.write(f"Type: {vehicle['vehicle_type'].title()}")
                st.write(f"Scans: {vehicle['total_scans']}")
                st.code(qr_target, language="text")
            with qr_col:
                st.image(qr_png, width=180)
                st.download_button(
                    f"Download QR #{vehicle['id']}",
                    data=qr_png,
                    file_name=f"vehicle-{vehicle['id']}.png",
                    mime="image/png",
                    key=f"history-download-{vehicle['id']}",
                )

            with st.form(f"edit_vehicle_{vehicle['id']}"):
                vehicle_number = st.text_input("Vehicle number", value=vehicle["vehicle_number"])
                vehicle_type = st.selectbox(
                    "Vehicle type",
                    vehicle_types,
                    index=vehicle_types.index(vehicle["vehicle_type"]),
                    key=f"type-{vehicle['id']}",
                )
                owner_name = st.text_input("Owner name", value=vehicle["owner_name"], key=f"owner-{vehicle['id']}")
                contact_phone = st.text_input(
                    "Primary contact phone",
                    value=vehicle["contact_phone"],
                    key=f"phone-{vehicle['id']}",
                )
                emergency_contact = st.text_input(
                    "Emergency contact",
                    value=vehicle["emergency_contact"],
                    key=f"emergency-{vehicle['id']}",
                )
                submitted = st.form_submit_button("Save changes")

            if submitted:
                try:
                    update_vehicle(
                        vehicle["id"],
                        vehicle_number,
                        vehicle_type,
                        owner_name,
                        contact_phone,
                        emergency_contact,
                    )
                    st.success(f"Vehicle #{vehicle['id']} updated.")
                    st.rerun()
                except Exception as error:
                    st.error(str(error))

            st.markdown("#### Customize branded sticker")
            selected_preset = st.selectbox(
                "Choose a sticker style",
                preset_names,
                key=f"preset-{vehicle['id']}",
            )
            sticker_png = generate_sticker_png(vehicle["id"], APP_NAME, selected_preset, qr_png=qr_png)
            preview_col, info_col = st.columns([1.1, 0.9], gap="large")
            with preview_col:
                st.image(sticker_png, caption=f"{selected_preset} preview", use_container_width=True)
            with info_col:
                st.write("Included in this design:")
                st.write("- QR image")
                st.write(f"- Website name: {APP_NAME}")
                st.write('- “Need to contact the vehicle owner?”')
                st.write(f"- Vehicle ID #{vehicle['id']}")
                st.download_button(
                    f"Download {selected_preset} sticker",
                    data=sticker_png,
                    file_name=f"vehicle-{vehicle['id']}-{selected_preset.lower().replace(' ', '-')}.png",
                    mime="image/png",
                    key=f"sticker-download-{vehicle['id']}",
                )


def render_add_vehicle():
    require_login()
    st.subheader("Register a vehicle")
    user = current_user()
    with st.form("add_vehicle_form", clear_on_submit=False):
        vehicle_number = st.text_input("Vehicle number")
        vehicle_type = st.selectbox("Vehicle type", ["car", "bike", "scooter", "truck", "other"])
        owner_name = st.text_input("Owner name", value=user["name"])
        contact_phone = st.text_input("Primary contact phone", value=user["phone"])
        emergency_contact = st.text_input("Emergency contact")
        submitted = st.form_submit_button("Add vehicle")

    if submitted:
        try:
            vehicle_id = add_vehicle(
                vehicle_number,
                vehicle_type,
                owner_name,
                contact_phone,
                emergency_contact,
            )
            st.success(f"Vehicle added successfully. Vehicle ID: {vehicle_id}")
            st.session_state.auth_view = "Dashboard"
            st.rerun()
        except Exception as error:
            st.error(str(error))


def render_admin():
    require_admin()
    st.subheader("Admin analytics dashboard")
    users = fetch_all(
        "SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC"
    )
    vehicles = fetch_all(
        """
        SELECT v.*, u.email AS user_email
        FROM vehicles v
        JOIN users u ON u.id = v.user_id
        ORDER BY v.created_at DESC
        """
    )
    scans = fetch_all(
        """
        SELECT s.*, v.vehicle_number
        FROM scans s
        JOIN vehicles v ON v.id = s.vehicle_id
        ORDER BY s.scan_time DESC
        """
    )

    render_metric_cards(
        [
            ("Users", len(users)),
            ("Vehicles", len(vehicles)),
            ("Scans", len(scans)),
            ("Active QR", len([item for item in vehicles if item["qr_code_url"]])),
        ]
    )

    tab_users, tab_vehicles, tab_scans = st.tabs(["Users", "Vehicles", "Scans"])
    with tab_users:
        st.dataframe(users, use_container_width=True)
    with tab_vehicles:
        st.dataframe(vehicles, use_container_width=True)
    with tab_scans:
        st.dataframe(scans, use_container_width=True)


def render_public_vehicle(vehicle_id: int):
    vehicle = fetch_one(
        """
        SELECT v.*, u.email AS user_email
        FROM vehicles v
        JOIN users u ON u.id = v.user_id
        WHERE v.id = %s
        """,
        (vehicle_id,),
    )

    if not vehicle:
        st.error("Vehicle not found.")
        return

    scan_key = f"scan_logged_{vehicle_id}"
    if scan_key not in st.session_state:
        ip_address, user_agent = get_request_context()
        execute(
            """
            INSERT INTO scans (vehicle_id, ip_address, device, latitude, longitude)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (vehicle_id, ip_address, user_agent, None, None),
        )
        st.session_state[scan_key] = True

    safe_phone = "".join(ch for ch in str(vehicle["contact_phone"]) if ch.isdigit() or ch == "+")
    st.markdown(
        f"""
        <div class="hero-card">
          <div class="eyebrow">Vehicle Contact Page</div>
          <div class="hero-title" style="font-size:2.4rem;">{vehicle['vehicle_number']}</div>
          <p class="muted">Owner: {vehicle['owner_name']}</p>
          <p class="muted">Use one of the protected actions below to contact the owner.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    col1, col2, col3 = st.columns(3)
    with col1:
        st.link_button("Call Owner", f"tel:{safe_phone}", use_container_width=True)
    with col2:
        st.link_button("Send WhatsApp", f"https://wa.me/{safe_phone.replace('+', '')}", use_container_width=True)
    with col3:
        st.link_button("Send Message", f"sms:{safe_phone}", use_container_width=True)

    st.caption(f"Scan logged at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


def render_sidebar():
    with st.sidebar:
        st.markdown(f"## {APP_NAME}")
        if current_user():
            st.success(f"Signed in as {current_user()['name']}")
            options = ["Dashboard", "History", "Add Vehicle"]
            if current_user()["role"] == "admin":
                options.append("Admin")
            choice = st.radio("Navigate", options, index=options.index(st.session_state.auth_view) if st.session_state.auth_view in options else 0)
            st.session_state.auth_view = choice
            if st.button("Logout", use_container_width=True):
                st.session_state.user = None
                st.session_state.auth_view = "Landing"
                set_query_params()
                st.rerun()
        else:
            choice = st.radio("Navigate", ["Landing", "Register", "Login"], index=["Landing", "Register", "Login"].index(st.session_state.auth_view) if st.session_state.auth_view in {"Landing", "Register", "Login"} else 0)
            st.session_state.auth_view = choice


def main():
    st.markdown(f"<style>{load_styles()}</style>", unsafe_allow_html=True)
    bootstrap()
    init_state()

    query_params = st.query_params
    view = query_params.get("view")
    vehicle_id = query_params.get("vehicle_id")
    token = query_params.get("token")

    if view == "vehicle" and vehicle_id:
        render_public_vehicle(int(vehicle_id))
        return

    if view == "reset_password" and token:
        render_reset_password(str(token))
        return

    render_sidebar()

    if st.session_state.auth_view == "Landing":
        render_landing()
    elif st.session_state.auth_view == "Register":
        render_register()
    elif st.session_state.auth_view == "Login":
        render_login()
    elif st.session_state.auth_view == "Dashboard":
        render_dashboard()
    elif st.session_state.auth_view == "History":
        render_history()
    elif st.session_state.auth_view == "Add Vehicle":
        render_add_vehicle()
    elif st.session_state.auth_view == "Admin":
        render_admin()


if __name__ == "__main__":
    main()
