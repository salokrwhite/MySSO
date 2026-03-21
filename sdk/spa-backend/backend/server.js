const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const app = express();
const port = process.env.PORT || 3010;

const MYSSO_BASE = process.env.MYSSO_BASE || "http://localhost:8080";
const CLIENT_ID = process.env.MYSSO_CLIENT_ID || "replace-with-client-id";
const CLIENT_SECRET = process.env.MYSSO_CLIENT_SECRET || "replace-with-client-secret";
const REDIRECT_URI = process.env.MYSSO_REDIRECT_URI || `http://localhost:${port}/auth/callback`;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3020";
const SESSION_SECRET = (process.env.SESSION_SECRET || "").trim();
const SESSION_COOKIE_SECURE = (process.env.SESSION_COOKIE_SECURE || "true").trim().toLowerCase() !== "false";

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required. Demo defaults are intentionally disabled for safety.");
}

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: SESSION_COOKIE_SECURE
  }
}));

function base64url(input) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomString(size = 32) {
  return base64url(crypto.randomBytes(size));
}

function createPKCE() {
  const verifier = randomString(48);
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

app.get("/auth/login", (req, res) => {
  const state = randomString(24);
  const nonce = randomString(24);
  const pkce = createPKCE();

  req.session.oidc = {
    state,
    nonce,
    verifier: pkce.verifier
  };

  const query = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid profile email",
    state,
    nonce,
    code_challenge: pkce.challenge,
    code_challenge_method: "S256"
  });

  res.redirect(`${MYSSO_BASE}/oauth2/authorize?${query.toString()}`);
});

app.get("/auth/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;
  if (error) {
    res.status(400).json({ error, error_description });
    return;
  }

  if (!code || !state || !req.session.oidc || req.session.oidc.state !== state) {
    res.status(400).json({ error: "invalid authorization response" });
    return;
  }

  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: String(code),
    redirect_uri: REDIRECT_URI,
    code_verifier: req.session.oidc.verifier
  });

  const tokenResponse = await fetch(`${MYSSO_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: tokenBody.toString()
  });
  const tokenPayload = await tokenResponse.json();

  if (!tokenResponse.ok) {
    res.status(400).json(tokenPayload);
    return;
  }

  const userInfoResponse = await fetch(`${MYSSO_BASE}/oauth2/userinfo`, {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`
    }
  });
  const userInfo = await userInfoResponse.json();

  req.session.user = userInfo;
  req.session.tokens = tokenPayload;
  delete req.session.oidc;

  res.redirect(`${FRONTEND_ORIGIN}/`);
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: "not logged in" });
    return;
  }
  res.json({
    user: req.session.user
  });
});

app.listen(port, () => {
  console.log(`SPA backend demo listening at http://localhost:${port}`);
});
