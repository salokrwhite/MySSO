const REQUEST_TIMEOUT_MS = 5000;
const LAST_SUCCESSFUL_API_BASE_STORAGE_KEY = "last_successful_api_base";

type ApiRequestInit = RequestInit & {
  timeout_ms?: number;
};

function normalizeApiBase(base: string) {
  return base.trim().replace(/\/$/, "");
}

function getStoredSuccessfulApiBase() {
  if (typeof window === "undefined") {
    return "";
  }
  return normalizeApiBase(window.localStorage.getItem(LAST_SUCCESSFUL_API_BASE_STORAGE_KEY) || "");
}

let lastSuccessfulApiBase = getStoredSuccessfulApiBase();

function rememberSuccessfulApiBase(base: string) {
  const normalizedBase = normalizeApiBase(base);
  if (!normalizedBase) {
    return;
  }
  lastSuccessfulApiBase = normalizedBase;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LAST_SUCCESSFUL_API_BASE_STORAGE_KEY, normalizedBase);
  }
}

function buildApiBaseCandidates() {
  const configuredOrigin = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_API_ORIGIN || "").trim();
  if (configuredOrigin) {
    return [`${configuredOrigin.replace(/\/$/, "")}/api`];
  }

  if (typeof window === "undefined") {
    return ["http://127.0.0.1:8080/api", "http://localhost:8080/api"];
  }

  const protocol = window.location.protocol || "http:";
  const localhostApi = `${protocol}//localhost:8080/api`;
  const loopbackApi = `${protocol}//127.0.0.1:8080/api`;
  const hostname = window.location.hostname;

  if (hostname === "127.0.0.1") {
    return [loopbackApi, localhostApi];
  }
  if (hostname === "localhost") {
    return [localhostApi, loopbackApi];
  }
  return [`${protocol}//${hostname}/api`, loopbackApi, localhostApi];
}

const API_BASE_CANDIDATES = Array.from(
  new Set(
    [
      getStoredSuccessfulApiBase(),
      ...buildApiBaseCandidates()
    ].filter(Boolean)
  )
);

export const API_BASE = API_BASE_CANDIDATES[0];

export function getPreferredApiBase() {
  return lastSuccessfulApiBase || API_BASE;
}

export function getPreferredBackendOrigin() {
  return getPreferredApiBase().replace(/\/api$/, "");
}

export class ApiError extends Error {
  status: number;
  payload: Record<string, unknown>;

  constructor(message: string, status: number, payload: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

async function fetchWithTimeout(input: string, init: ApiRequestInit) {
  const controller = new AbortController();
  const timeoutMs = typeof init.timeout_ms === "number" && init.timeout_ms > 0 ? init.timeout_ms : REQUEST_TIMEOUT_MS;
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const { timeout_ms: _timeoutMs, ...rest } = init;
    return await fetch(input, {
      ...rest,
      credentials: rest.credentials ?? "include",
      signal: controller.signal
    });
  } catch (error) {
    if (timedOut) {
      throw new ApiError("request timed out", 0, { timeout_ms: timeoutMs });
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function api<T>(path: string, init?: ApiRequestInit, _sessionToken?: string): Promise<T> {
  const headers = new Headers(init?.headers || {});
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response | undefined;
  let responseBase = "";
  let lastNetworkError: unknown;
  for (const base of API_BASE_CANDIDATES) {
    try {
      const candidateResponse = await fetchWithTimeout(`${base}${path}`, {
        ...init,
        headers
      });
      const contentType = (candidateResponse.headers.get("Content-Type") || "").toLowerCase();
      if (candidateResponse.status !== 204 && contentType.includes("text/html")) {
        lastNetworkError = new ApiError(
          `api endpoint returned HTML instead of JSON for ${base}${path}`,
          candidateResponse.status,
          { base, path, content_type: contentType }
        );
        continue;
      }
      response = candidateResponse;
      responseBase = base;
      break
    } catch (error) {
      lastNetworkError = error;
    }
  }

  if (!response) {
    throw new ApiError(
      lastNetworkError instanceof Error ? lastNetworkError.message : "network request failed",
      0,
      {}
    );
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({ error: response.statusText }))) as Record<string, unknown>;
    throw new ApiError(String(payload.error || "request failed"), response.status, payload);
  }

  if (response.status === 204) {
    if (responseBase) {
      rememberSuccessfulApiBase(responseBase);
    }
    return undefined as T;
  }

  const contentType = (response.headers.get("Content-Type") || "").toLowerCase();
  const text = await response.text();
  if (!text) {
    if (responseBase) {
      rememberSuccessfulApiBase(responseBase);
    }
    return undefined as T;
  }
  if (contentType.includes("text/html") || /^\s*</.test(text)) {
    throw new ApiError(
      "api endpoint returned HTML instead of JSON; please check VITE_API_ORIGIN or reverse proxy routing",
      response.status,
      {
        base: responseBase,
        path,
        content_type: contentType || "unknown"
      }
    );
  }
  if (responseBase) {
    rememberSuccessfulApiBase(responseBase);
  }
  return JSON.parse(text) as T;
}
