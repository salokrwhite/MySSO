const crypto = require("crypto");
const express = require("express");

const app = express();
const port = process.env.PORT || 3001;

const MYSSO_BASE = process.env.MYSSO_BASE || "http://localhost:8080";
const CLIENT_ID = process.env.MYSSO_CLIENT_ID || "replace-with-client-id";
const CLIENT_SECRET = process.env.MYSSO_CLIENT_SECRET || "replace-with-client-secret";
const REDIRECT_URI = process.env.MYSSO_REDIRECT_URI || `http://localhost:${port}/callback`;
const SCOPE = process.env.MYSSO_SCOPE || "openid profile email";

const pendingAuth = new Map();

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

app.get("/", (_, res) => {
  res.send('<a href="/login">Use MySSO Login</a>');
});

app.get("/login", (req, res) => {
  const state = randomString(24);
  const nonce = randomString(24);
  const pkce = createPKCE();

  pendingAuth.set(state, {
    nonce,
    verifier: pkce.verifier
  });

  const query = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    state,
    nonce,
    code_challenge: pkce.challenge,
    code_challenge_method: "S256"
  });

  res.redirect(`${MYSSO_BASE}/oauth2/authorize?${query.toString()}`);
});

app.get("/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;
  if (error) {
    res.status(400).json({ error, error_description });
    return;
  }
  if (!code || !state || !pendingAuth.has(state)) {
    res.status(400).json({ error: "missing or invalid authorization context" });
    return;
  }

  const auth = pendingAuth.get(state);
  pendingAuth.delete(state);

  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: auth.verifier
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

  res.json({
    token: tokenPayload,
    userinfo: userInfo
  });
});

app.listen(port, () => {
  console.log(`Node.js demo app listening at http://localhost:${port}`);
});
