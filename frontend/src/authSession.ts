const BROWSER_SESSION_META_KEY = "browser_session_meta";
const TAB_SESSION_META_KEY = "tab_session_meta";
const USER_ROLE_STORAGE_KEY = "user_role";
const SESSION_AUTHENTICATED_AT_STORAGE_KEY = "session_authenticated_at";
const SESSION_RUNTIME_MARKER_KEY = "session_runtime_marker";
const FIRST_PARTY_SESSION_CONTEXT_KEY = "first_party_session_context";
const LEGACY_OIDC_STORAGE_KEYS = ["oidc_access_token", "oidc_id_token", "oidc_refresh_token", "oidc_scope"] as const;

export type StoredSessionMeta = {
  role: "admin" | "developer" | "user";
  authenticatedAt: string;
  userId: string;
  email: string;
  displayName: string;
};

type SessionProfile = {
  id?: string;
  email?: string;
  display_name?: string;
};

type FirstPartySessionContext = {
  role: StoredSessionMeta["role"];
  authenticatedAt: string;
  userId: string;
  recordedAt: string;
};

function safeParse(value: string | null) {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as StoredSessionMeta;
  } catch {
    return null;
  }
}

function safeParseFirstPartyContext(value: string | null) {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as FirstPartySessionContext;
  } catch {
    return null;
  }
}

function buildSessionIdentity(meta: Pick<StoredSessionMeta, "authenticatedAt" | "userId"> | null) {
  if (!meta?.authenticatedAt) {
    return "";
  }
  return `${meta.userId || "anonymous"}:${meta.authenticatedAt}`;
}

function clearStoredBrowserSessionMeta() {
  localStorage.removeItem(USER_ROLE_STORAGE_KEY);
  localStorage.removeItem(SESSION_AUTHENTICATED_AT_STORAGE_KEY);
  localStorage.removeItem(BROWSER_SESSION_META_KEY);
  localStorage.removeItem(FIRST_PARTY_SESSION_CONTEXT_KEY);
  clearLegacyOIDCTokens();
}

export function clearLegacyOIDCTokens() {
  for (const key of LEGACY_OIDC_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

export function ensureSessionConsistency() {
  if (sessionStorage.getItem(SESSION_RUNTIME_MARKER_KEY) === "1") {
    return;
  }
  const browserMeta = safeParse(localStorage.getItem(BROWSER_SESSION_META_KEY));
  if (!browserMeta?.authenticatedAt) {
    clearStoredBrowserSessionMeta();
  }
}

// Compatibility helper for route guards and tab sync. This is not a credential.
export function readSessionToken() {
  ensureSessionConsistency();
  const tabMeta = readTabSessionMeta();
  const browserMeta = readBrowserSessionMeta();
  return buildSessionIdentity(tabMeta || browserMeta);
}

export function readUserRole(defaultRole: StoredSessionMeta["role"] = "user") {
  ensureSessionConsistency();
  const browserMeta = safeParse(localStorage.getItem(BROWSER_SESSION_META_KEY));
  return (browserMeta?.role || localStorage.getItem(USER_ROLE_STORAGE_KEY) || defaultRole) as StoredSessionMeta["role"];
}

export function readSessionAuthenticatedAt() {
  ensureSessionConsistency();
  const browserMeta = safeParse(localStorage.getItem(BROWSER_SESSION_META_KEY));
  return browserMeta?.authenticatedAt || localStorage.getItem(SESSION_AUTHENTICATED_AT_STORAGE_KEY) || "";
}

export function persistSessionAuth(role: StoredSessionMeta["role"], authenticatedAt: string) {
  localStorage.setItem(USER_ROLE_STORAGE_KEY, role);
  localStorage.setItem(SESSION_AUTHENTICATED_AT_STORAGE_KEY, authenticatedAt);
  sessionStorage.setItem(SESSION_RUNTIME_MARKER_KEY, "1");
}

export function buildStoredSessionMeta(
  role: StoredSessionMeta["role"],
  authenticatedAt: string,
  profile?: SessionProfile
): StoredSessionMeta {
  return {
    role,
    authenticatedAt,
    userId: profile?.id?.trim() || "",
    email: profile?.email?.trim() || "",
    displayName: profile?.display_name?.trim() || ""
  };
}

export function readBrowserSessionMeta() {
  ensureSessionConsistency();
  const parsed = safeParse(localStorage.getItem(BROWSER_SESSION_META_KEY));
  if (parsed?.authenticatedAt) {
    return parsed;
  }
  const role = localStorage.getItem(USER_ROLE_STORAGE_KEY);
  const authenticatedAt = localStorage.getItem(SESSION_AUTHENTICATED_AT_STORAGE_KEY);
  if (!role || !authenticatedAt) {
    return null;
  }
  return {
    role: role as StoredSessionMeta["role"],
    authenticatedAt,
    userId: "",
    email: "",
    displayName: ""
  } satisfies StoredSessionMeta;
}

export function readTabSessionMeta() {
  ensureSessionConsistency();
  return safeParse(sessionStorage.getItem(TAB_SESSION_META_KEY));
}

export function persistBrowserSessionMeta(meta: StoredSessionMeta) {
  persistSessionAuth(meta.role, meta.authenticatedAt);
  localStorage.setItem(BROWSER_SESSION_META_KEY, JSON.stringify(meta));
}

export function persistTabSessionMeta(meta: StoredSessionMeta) {
  sessionStorage.setItem(SESSION_RUNTIME_MARKER_KEY, "1");
  sessionStorage.setItem(TAB_SESSION_META_KEY, JSON.stringify(meta));
}

export function persistBrowserAndTabSessionMeta(meta: StoredSessionMeta) {
  persistBrowserSessionMeta(meta);
  persistTabSessionMeta(meta);
}

export function syncTabSessionFromBrowser() {
  const browser = readBrowserSessionMeta();
  if (!browser) {
    return null;
  }
  persistTabSessionMeta(browser);
  return browser;
}

export function promoteTabSessionToBrowser() {
  const tab = readTabSessionMeta();
  if (!tab) {
    return null;
  }
  persistBrowserSessionMeta(tab);
  return tab;
}

export function clearBrowserSessionMeta() {
  clearStoredBrowserSessionMeta();
}

export function clearTabSessionMeta() {
  sessionStorage.removeItem(SESSION_RUNTIME_MARKER_KEY);
  sessionStorage.removeItem(TAB_SESSION_META_KEY);
}

export function clearAllSessionMeta() {
  clearBrowserSessionMeta();
  clearTabSessionMeta();
}

export function getSessionDisplayLabel(meta: StoredSessionMeta | null) {
  if (!meta) {
    return "";
  }
  return meta.displayName || meta.email || meta.userId || meta.role;
}

export function persistFirstPartySessionContext(
  role: StoredSessionMeta["role"],
  authenticatedAt: string,
  userId = ""
) {
  localStorage.setItem(
    FIRST_PARTY_SESSION_CONTEXT_KEY,
    JSON.stringify({
      role,
      authenticatedAt,
      userId,
      recordedAt: new Date().toISOString()
    } satisfies FirstPartySessionContext)
  );
}

export function readFirstPartySessionContext() {
  ensureSessionConsistency();
  const parsed = safeParseFirstPartyContext(localStorage.getItem(FIRST_PARTY_SESSION_CONTEXT_KEY));
  if (!parsed?.authenticatedAt) {
    return null;
  }
  const current = readBrowserSessionMeta();
  if (!current) {
    localStorage.removeItem(FIRST_PARTY_SESSION_CONTEXT_KEY);
    return null;
  }
  if (
    current.role !== parsed.role ||
    current.authenticatedAt !== parsed.authenticatedAt ||
    current.userId !== parsed.userId
  ) {
    localStorage.removeItem(FIRST_PARTY_SESSION_CONTEXT_KEY);
    return null;
  }
  return parsed;
}
