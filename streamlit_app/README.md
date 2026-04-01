# Streamlit Deployment

This directory contains a Streamlit version of the Smart Vehicle QR Contact System.

## Run locally

1. Create a Python virtual environment.
2. Install dependencies from the repo root `requirements.txt`.
3. Copy `streamlit_app/.env.example` to `streamlit_app/.env` and fill in your MySQL settings.
4. Start the app:

```bash
streamlit run streamlit_app/app.py
```

## Streamlit Cloud

- Repository: this repo
- Branch: `main`
- Main file path: `streamlit_app/app.py`

Set the same values from `streamlit_app/.env.example` in Streamlit Cloud secrets or environment variables.

## Forgot password

The Streamlit app now generates reset links directly inside the login screen. No SMTP or Gmail setup is required.
