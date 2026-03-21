import { api, getPreferredBackendOrigin } from "../../api/client";
import { pickAllowedSearchParams } from "../../utils/urlState";

const PENDING_AUTH_STORAGE_KEY = "oidc_pending_auth";
const OIDC_FETCH_TIMEOUT_MS = 15000;

export type PendingAuthorization = {
  state: string;
  nonce: string;
  redirectUri: string;
  clientId: string;
  codeVerifier: string;
  maxAge?: string;
  postLoginRedirect?: string;
};

const PROMPT_LOGIN_SATISFIED_PREFIX = "oidc_prompt_login_satisfied_";
const AUTHORIZATION_SESSION_STORAGE_KEY = "oidc_authorization_session";

export type AuthorizationSession = {
  role: "admin" | "developer" | "user";
  authenticatedAt: string;
};

type PublicSettings = {
  data?: {
    allow_user_registration?: boolean;
    frontend_base_url?: string;
    oidc_first_party_client_id?: string;
    oidc_first_party_scope?: string;
  };
};

function randomString(length: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function createCodeChallenge(verifier: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return encodeBase64Url(new Uint8Array(digest));
}

function getStorage() {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_AUTH_STORAGE_KEY) || "{}") as Record<string, PendingAuthorization>;
  } catch {
    return {};
  }
}

function setStorage(value: Record<string, PendingAuthorization>) {
  sessionStorage.setItem(PENDING_AUTH_STORAGE_KEY, JSON.stringify(value));
}

type BuildFirstPartyAuthPathOptions = {
  targetPath?: "/login" | "/authorize" | "/register" | "/forgot-password";
  currentSearch?: string;
  postLoginRedirect?: string;
};

export async function buildFirstPartyAuthorizePath(postLoginRedirect?: string) {
  return buildFirstPartyAuthPath({
    targetPath: "/authorize",
    postLoginRedirect
  });
}

export async function buildFirstPartyLoginPath(currentSearch?: string, postLoginRedirect?: string) {
  return buildFirstPartyAuthPath({
    targetPath: "/login",
    currentSearch,
    postLoginRedirect
  });
}

export async function buildFirstPartyRegisterPath(currentSearch?: string, postLoginRedirect?: string) {
  return buildFirstPartyAuthPath({
    targetPath: "/register",
    currentSearch,
    postLoginRedirect
  });
}

export async function buildFirstPartyForgotPasswordPath(currentSearch?: string, postLoginRedirect?: string) {
  return buildFirstPartyAuthPath({
    targetPath: "/forgot-password",
    currentSearch,
    postLoginRedirect
  });
}

async function buildFirstPartyAuthPath(options: BuildFirstPartyAuthPathOptions) {
  const { targetPath = "/authorize", currentSearch = "", postLoginRedirect } = options;
  const settings = await api<PublicSettings>("/public/settings");
  const frontendBaseURL = settings.data?.frontend_base_url?.trim() || window.location.origin;
  const clientId = settings.data?.oidc_first_party_client_id?.trim() || "demo-client";
  const scope = settings.data?.oidc_first_party_scope?.trim() || "openid profile email gateway.read";
  const state = randomString(32);
  const nonce = randomString(32);
  const codeVerifier = randomString(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const redirectUri = `${frontendBaseURL.replace(/\/$/, "")}/callback`;
  const preservedParams = pickAllowedSearchParams(currentSearch);
  const locale = preservedParams.get("locale");
  const redirect = preservedParams.get("redirect");
  const tab = preservedParams.get("tab");
  const prompt = preservedParams.get("prompt");
  const maxAge = preservedParams.get("max_age");
  const acrValues = preservedParams.get("acr_values");
  const pending = getStorage();
  pending[state] = {
    state,
    nonce,
    redirectUri,
    clientId,
    codeVerifier,
    maxAge: maxAge || undefined,
    postLoginRedirect
  };
  setStorage(pending);

  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256"
  });

  if (locale) {
    query.set("locale", locale);
  }
  if (redirect) {
    query.set("redirect", redirect);
  }
  if (tab) {
    query.set("tab", tab);
  }
  if (prompt) {
    query.set("prompt", prompt);
  }
  if (maxAge) {
    query.set("max_age", maxAge);
  }
  if (acrValues) {
    query.set("acr_values", acrValues);
  }

  return `${targetPath}?${query.toString()}`;
}

export function getPendingAuthorization(state: string) {
  const pending = getStorage();
  return pending[state];
}

export function clearPendingAuthorization(state: string) {
  const pending = getStorage();
  delete pending[state];
  setStorage(pending);
}

export function saveAuthorizationSession(role: AuthorizationSession["role"], authenticatedAt: string) {
  const value: AuthorizationSession = {
    role,
    authenticatedAt
  };
  sessionStorage.setItem(AUTHORIZATION_SESSION_STORAGE_KEY, JSON.stringify(value));
}

export function getAuthorizationSession() {
  try {
    const raw = sessionStorage.getItem(AUTHORIZATION_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AuthorizationSession;
  } catch {
    return null;
  }
}

export function clearAuthorizationSession() {
  sessionStorage.removeItem(AUTHORIZATION_SESSION_STORAGE_KEY);
}

export function markPromptLoginSatisfied(state: string) {
  if (!state) {
    return;
  }
  sessionStorage.setItem(`${PROMPT_LOGIN_SATISFIED_PREFIX}${state}`, "1");
}

export function consumePromptLoginSatisfied(state: string) {
  if (!state) {
    return false;
  }
  const key = `${PROMPT_LOGIN_SATISFIED_PREFIX}${state}`;
  const satisfied = sessionStorage.getItem(key) === "1";
  if (satisfied) {
    sessionStorage.removeItem(key);
  }
  return satisfied;
}

type DiscoveryDocument = {
  issuer: string;
  jwks_uri: string;
};

type JWKWithKid = JsonWebKey & {
  kid?: string;
  kty?: string;
};

type JWTHeader = {
  alg?: string;
  kid?: string;
};

type IDTokenClaims = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  nonce?: string;
  sub?: string;
  auth_time?: number;
};

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(normalized + padding);
}

function decodeJSON<T>(input: string): T {
  return JSON.parse(decodeBase64Url(input)) as T;
}

function toUint8Array(input: string) {
  return Uint8Array.from(decodeBase64Url(input), (char) => char.charCodeAt(0));
}

function textEncoder(input: string) {
  return new TextEncoder().encode(input);
}

async function fetchWithTimeout(input: string) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), OIDC_FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, { signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function resolveOIDCURL(input: string) {
  const preferredOrigin = getPreferredBackendOrigin();
  try {
    const url = new URL(input);
    const preferred = new URL(preferredOrigin);
    const hostAliases = new Set([url.hostname, preferred.hostname]);
    const isLoopbackAlias = hostAliases.has("localhost") && hostAliases.has("127.0.0.1");
    if (isLoopbackAlias && url.port === preferred.port && url.protocol === preferred.protocol) {
      url.hostname = preferred.hostname;
      return url.toString();
    }
    return input;
  } catch {
    return input;
  }
}

async function fetchDiscoveryDocument() {
  const backendOrigin = getPreferredBackendOrigin();
  let response: Response;
  try {
    response = await fetchWithTimeout(`${backendOrigin}/.well-known/openid-configuration`);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("failed to load discovery document");
    }
    throw err;
  }
  if (!response.ok) {
    throw new Error("failed to load discovery document");
  }
  return (await response.json()) as DiscoveryDocument;
}

async function fetchJWKS(jwksURI: string) {
  let response: Response;
  try {
    response = await fetchWithTimeout(resolveOIDCURL(jwksURI));
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("failed to load jwks");
    }
    throw err;
  }
  if (!response.ok) {
    throw new Error("failed to load jwks");
  }
  return (await response.json()) as { keys?: JWKWithKid[] };
}

function audienceMatches(aud: string | string[] | undefined, clientId: string) {
  if (typeof aud === "string") {
    return aud === clientId;
  }
  if (Array.isArray(aud)) {
    return aud.includes(clientId);
  }
  return false;
}

export async function validateIDToken(idToken: string, pending: PendingAuthorization) {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("invalid id_token format");
  }
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJSON<JWTHeader>(encodedHeader);
  const claims = decodeJSON<IDTokenClaims>(encodedPayload);
  if (header.alg !== "RS256") {
    throw new Error("unsupported id_token alg");
  }
  if (!header.kid) {
    throw new Error("missing id_token kid");
  }

  const discovery = await fetchDiscoveryDocument();
  const jwks = await fetchJWKS(discovery.jwks_uri);
  const jwk = (jwks.keys || []).find((item) => item.kid === header.kid && item.kty === "RSA");
  if (!jwk) {
    throw new Error("signing key not found");
  }
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    toUint8Array(encodedSignature),
    textEncoder(`${encodedHeader}.${encodedPayload}`)
  );
  if (!verified) {
    throw new Error("id_token signature verification failed");
  }

  const now = Math.floor(Date.now() / 1000);
  const allowedClockSkewSeconds = 60;
  if (claims.iss !== discovery.issuer) {
    throw new Error("id_token issuer mismatch");
  }
  if (!audienceMatches(claims.aud, pending.clientId)) {
    throw new Error("id_token audience mismatch");
  }
  if (!claims.sub) {
    throw new Error("id_token subject missing");
  }
  if (typeof claims.exp !== "number" || claims.exp <= now - allowedClockSkewSeconds) {
    throw new Error("id_token expired");
  }
  if (typeof claims.iat !== "number" || claims.iat > now + allowedClockSkewSeconds) {
    throw new Error("id_token issued-at invalid");
  }
  if (claims.nonce !== pending.nonce) {
    throw new Error("id_token nonce mismatch");
  }
  if (pending.maxAge) {
    const maxAgeSeconds = Number(pending.maxAge);
    if (!Number.isFinite(maxAgeSeconds) || maxAgeSeconds < 0) {
      throw new Error("invalid max_age context");
    }
    if (typeof claims.auth_time !== "number") {
      throw new Error("id_token auth_time missing");
    }
    if (now - claims.auth_time > maxAgeSeconds + allowedClockSkewSeconds) {
      throw new Error("id_token auth_time exceeds max_age");
    }
  }
  return claims;
}
