import { api } from "../../../api/client";
import { fetchPublicSettings } from "../../../publicSettings";
import type {
  AppItem,
  DeveloperAnalyticsData,
  DeveloperAuditLog,
  ResetSecretResult,
  ScopeDefinition,
} from "../types";

type SessionScopedCache<T> = {
  value: T | null;
  inflight: Promise<T> | null;
  sessionToken?: string;
};

function sameSessionToken(
  cacheSessionToken?: string,
  sessionToken?: string,
) {
  return (cacheSessionToken || "") === (sessionToken || "");
}

function resetSessionScopedCache<T>(cache: SessionScopedCache<T>) {
  cache.value = null;
  cache.inflight = null;
  cache.sessionToken = undefined;
}

function readSessionScopedCache<T>(
  cache: SessionScopedCache<T>,
  sessionToken?: string,
) {
  if (!sameSessionToken(cache.sessionToken, sessionToken)) {
    resetSessionScopedCache(cache);
    cache.sessionToken = sessionToken;
  }
  return cache;
}

async function loadCachedResource<T>(
  cache: SessionScopedCache<T>,
  sessionToken: string | undefined,
  loader: () => Promise<T>,
  options?: { force?: boolean },
) {
  const currentCache = readSessionScopedCache(cache, sessionToken);
  if (options?.force) {
    currentCache.value = null;
    currentCache.inflight = null;
  } else {
    if (currentCache.value) {
      return currentCache.value;
    }
    if (currentCache.inflight) {
      return currentCache.inflight;
    }
  }

  currentCache.inflight = loader()
    .then((result) => {
      currentCache.value = result;
      return result;
    })
    .finally(() => {
      currentCache.inflight = null;
    });

  return currentCache.inflight;
}

const developerAppsCache: SessionScopedCache<{ items: AppItem[] }> = {
  value: null,
  inflight: null,
};
const developerAuditLogsCache: SessionScopedCache<{
  items: DeveloperAuditLog[];
}> = {
  value: null,
  inflight: null,
};
const developerAnalyticsCache: SessionScopedCache<{
  data: DeveloperAnalyticsData;
}> = {
  value: null,
  inflight: null,
};
const developerScopesCache: SessionScopedCache<{ items: ScopeDefinition[] }> = {
  value: null,
  inflight: null,
};

export async function fetchDeveloperApps(
  sessionToken?: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    developerAppsCache,
    sessionToken,
    () => api<{ items: AppItem[] }>("/developer/apps", undefined, sessionToken),
    options,
  );
}

export async function fetchDeveloperAuditLogs(
  sessionToken?: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    developerAuditLogsCache,
    sessionToken,
    () =>
      api<{ items: DeveloperAuditLog[] }>(
        "/developer/audit-logs",
        undefined,
        sessionToken,
      ),
    options,
  );
}

export async function fetchDeveloperAnalytics(
  sessionToken?: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    developerAnalyticsCache,
    sessionToken,
    () =>
      api<{ data: DeveloperAnalyticsData }>(
        "/developer/analytics",
        undefined,
        sessionToken,
      ),
    options,
  );
}

export async function fetchDeveloperScopes(
  sessionToken?: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    developerScopesCache,
    sessionToken,
    () =>
      api<{ items: ScopeDefinition[] }>(
        "/developer/scopes",
        undefined,
        sessionToken,
      ),
    options,
  );
}

export async function fetchDeveloperAnnouncement() {
  const settings = await fetchPublicSettings();
  return {
    data: {
      developer_announcement_enabled: settings.developer_announcement_enabled,
      developer_announcement_content: settings.developer_announcement_content,
    },
  };
}

export async function createDeveloperApp(
  sessionToken: string | undefined,
  payload: Record<string, unknown>,
) {
  return api(
    "/developer/apps",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export function clearDeveloperResourceCaches(sessionToken?: string) {
  readSessionScopedCache(developerAppsCache, sessionToken).value = null;
  readSessionScopedCache(developerAuditLogsCache, sessionToken).value = null;
  readSessionScopedCache(developerAnalyticsCache, sessionToken).value = null;
  readSessionScopedCache(developerScopesCache, sessionToken).value = null;
}

export async function updateDeveloperApp(
  sessionToken: string | undefined,
  id: string,
  payload: Record<string, unknown>,
) {
  return api(
    `/developer/apps/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    sessionToken,
  );
}

export async function resetDeveloperAppSecret(
  sessionToken: string | undefined,
  id: string,
) {
  return api<ResetSecretResult>(
    `/developer/apps/${id}/reset-secret`,
    { method: "POST" },
    sessionToken,
  );
}

export async function deleteDeveloperApp(
  sessionToken: string | undefined,
  id: string,
) {
  return api(`/developer/apps/${id}`, { method: "DELETE" }, sessionToken);
}

export async function deleteDeveloperAuditLogs(
  sessionToken: string | undefined,
  logIds: string[],
) {
  return api(
    "/developer/audit-logs/batch-delete",
    {
      method: "POST",
      body: JSON.stringify({ log_ids: logIds }),
    },
    sessionToken,
  );
}
