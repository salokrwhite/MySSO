import base64
import hashlib
import os
import secrets

import requests
from flask import Flask, jsonify, redirect, request, session

app = Flask(__name__)

MYSSO_BASE = os.getenv("MYSSO_BASE", "http://localhost:8080")
CLIENT_ID = os.getenv("MYSSO_CLIENT_ID", "replace-with-client-id")
CLIENT_SECRET = os.getenv("MYSSO_CLIENT_SECRET", "replace-with-client-secret")
REDIRECT_URI = os.getenv("MYSSO_REDIRECT_URI", "http://localhost:5000/callback")
SCOPE = os.getenv("MYSSO_SCOPE", "openid profile email")
FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "").strip()
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "").strip().lower() in {"1", "true", "yes", "on"}
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "true").strip().lower() in {"1", "true", "yes", "on"}

if not FLASK_SECRET_KEY:
    raise RuntimeError("FLASK_SECRET_KEY is required. Demo defaults are intentionally disabled for safety.")

app.secret_key = FLASK_SECRET_KEY
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=SESSION_COOKIE_SECURE,
)


def random_string(size=32):
    return secrets.token_urlsafe(size)


def create_code_challenge(verifier: str) -> str:
    digest = hashlib.sha256(verifier.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")


@app.route("/")
def index():
    return '<a href="/login">Use MySSO Login</a>'


@app.route("/login")
def login():
    state = random_string(18)
    nonce = random_string(18)
    verifier = random_string(48)

    session["oidc_state"] = state
    session["oidc_nonce"] = nonce
    session["oidc_verifier"] = verifier

    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPE,
        "state": state,
        "nonce": nonce,
        "code_challenge": create_code_challenge(verifier),
        "code_challenge_method": "S256",
    }

    query = "&".join(f"{key}={requests.utils.quote(str(value), safe='')}" for key, value in params.items())
    return redirect(f"{MYSSO_BASE}/oauth2/authorize?{query}")


@app.route("/callback")
def callback():
    error = request.args.get("error")
    if error:
        return jsonify(
            {
                "error": error,
                "error_description": request.args.get("error_description", ""),
            }
        ), 400

    code = request.args.get("code", "")
    state = request.args.get("state", "")
    if not code or not state or state != session.get("oidc_state"):
        return jsonify({"error": "invalid authorization response"}), 400

    token_response = requests.post(
        f"{MYSSO_BASE}/oauth2/token",
        data={
            "grant_type": "authorization_code",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "code_verifier": session.get("oidc_verifier", ""),
        },
        timeout=5,
    )
    token_payload = token_response.json()
    if token_response.status_code >= 400:
        return jsonify(token_payload), token_response.status_code

    userinfo_response = requests.get(
        f"{MYSSO_BASE}/oauth2/userinfo",
        headers={"Authorization": f"Bearer {token_payload['access_token']}"},
        timeout=5,
    )
    return jsonify(
        {
            "token": token_payload,
            "userinfo": userinfo_response.json(),
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=FLASK_DEBUG)
