# Streamlit Deployment

This directory contains a Streamlit version of the Smart Vehicle QR Contact System.

## Run locally

1. Create a Python virtual environment.
2. Install dependencies from the repo root `requirements.txt`.
3. Copy `streamlit_app/.env.example` to `streamlit_app/.env` and fill in your PostgreSQL settings.
4. Start the app:

```bash
streamlit run streamlit_app/app.py
```

## Streamlit Cloud

- Repository: this repo
- Branch: `main`
- Main file path: `streamlit_app/app.py`

Set the same values from `streamlit_app/.env.example` in Streamlit Cloud secrets or environment variables.

## Gmail SMTP for forgot password

Use an App Password from your Gmail account, then set:

```toml
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "your_gmail@gmail.com"
SMTP_PASSWORD = "your_16_char_app_password"
SMTP_FROM = "your_gmail@gmail.com"
RESET_TOKEN_EXPIRY_MINUTES = 30
```
