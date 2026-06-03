import { api } from "../../../api/client";
import { fetchPublicSettings } from "../../../publicSettings";
import type {
  AppItem,
  AppUserBan,
  DeveloperAccessApp,
  DeveloperAccessLog,
  DeveloperAccessLogListResponse,
  DeveloperAnalyticsData,
  DeveloperAuditLog,
  DeveloperGroup,
  DeveloperManagedUser,
  DeveloperManagedUserListResponse,
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
const developerGroupsCache: SessionScopedCache<{ items: DeveloperGroup[] }> = {
  value: null,
  inflight: null,
};
const developerAccessAppsCache: SessionScopedCache<{
  items: DeveloperAccessApp[];
}> = {
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

export async function fetchDeveloperGroups(
  sessionToken?: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    developerGroupsCache,
    sessionToken,
    () => api<{ items: DeveloperGroup[] }>("/developer/user-groups", undefined, sessionToken),
    options,
  );
}

export async function fetchDeveloperManagedUsers(
  sessionToken?: string,
  query?: {
    page?: number;
    pageSize?: number;
    appId?: string;
    emailKeyword?: string;
    groupIds?: string[];
  },
  options?: { force?: boolean },
) {
  const params = new URLSearchParams();
  if (typeof query?.page === "number" && query.page > 0) {
    params.set("page", String(query.page));
  }
  if (typeof query?.pageSize === "number" && query.pageSize > 0) {
    params.set("page_size", String(query.pageSize));
  }
  if (query?.appId?.trim()) {
    params.set("app_id", query.appId.trim());
  }
  if (query?.emailKeyword?.trim()) {
    params.set("email_keyword", query.emailKeyword.trim());
  }
  const groupIds = (query?.groupIds ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
  if (groupIds.length > 0) {
    params.set("group_ids", groupIds.join(","));
  }
  const path = `/developer/managed-users${params.size > 0 ? `?${params.toString()}` : ""}`;
  return api<DeveloperManagedUserListResponse>(path, undefined, sessionToken);
}

export async function fetchDeveloperAccessApps(
  sessionToken?: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    developerAccessAppsCache,
    sessionToken,
    () => api<{ items: DeveloperAccessApp[] }>("/developer/access-apps", undefined, sessionToken),
    options,
  );
}

export async function fetchDeveloperAccessLogs(
  sessionToken?: string,
  query?: {
    page?: number;
    pageSize?: number;
  },
) {
  const params = new URLSearchParams();
  if (typeof query?.page === "number" && query.page > 0) {
    params.set("page", String(query.page));
  }
  if (typeof query?.pageSize === "number" && query.pageSize > 0) {
    params.set("page_size", String(query.pageSize));
  }
  const path = `/developer/access-logs${params.size > 0 ? `?${params.toString()}` : ""}`;
  return api<DeveloperAccessLogListResponse>(path, undefined, sessionToken);
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
  readSessionScopedCache(developerGroupsCache, sessionToken).value = null;
  readSessionScopedCache(developerAccessAppsCache, sessionToken).value = null;
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

export async function createDeveloperGroup(
  sessionToken: string | undefined,
  payload: { name: string; description?: string },
) {
  return api<{ item: DeveloperGroup }>(
    "/developer/user-groups",
    { method: "POST", body: JSON.stringify(payload) },
    sessionToken,
  );
}

export async function updateDeveloperGroup(
  sessionToken: string | undefined,
  id: string,
  payload: { name: string; description?: string },
) {
  return api<{ item: DeveloperGroup }>(
    `/developer/user-groups/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    sessionToken,
  );
}

export async function deleteDeveloperGroup(
  sessionToken: string | undefined,
  id: string,
) {
  return api(`/developer/user-groups/${id}`, { method: "DELETE" }, sessionToken);
}

export async function updateDeveloperManagedUserGroups(
  sessionToken: string | undefined,
  userId: string,
  groupIds: string[],
) {
  return api(
    `/developer/managed-users/${userId}/groups`,
    {
      method: "PUT",
      body: JSON.stringify({ group_ids: groupIds }),
      timeout_ms: 30000,
    },
    sessionToken,
  );
}

export async function batchUpdateDeveloperManagedUserGroups(
  sessionToken: string | undefined,
  userIds: string[],
  groupIds: string[],
  mode: "append" | "replace" | "remove" = "replace",
) {
  return api(
    "/developer/managed-users/groups/batch-update",
    {
      method: "PUT",
      body: JSON.stringify({ user_ids: userIds, group_ids: groupIds, mode }),
      timeout_ms: 30000,
    },
    sessionToken,
  );
}

export async function updateDeveloperAppBindings(
  sessionToken: string | undefined,
  appId: string,
  groupIds: string[],
) {
  return api(
    `/developer/apps/${appId}/access-groups`,
    { method: "PUT", body: JSON.stringify({ group_ids: groupIds }) },
    sessionToken,
  );
}

export async function banDeveloperAppUser(
  sessionToken: string | undefined,
  appId: string,
  payload: { user_id: string; reason: string; expires_at?: string },
) {
  return api<{ item: AppUserBan }>(
    `/developer/apps/${appId}/bans`,
    { method: "POST", body: JSON.stringify(payload) },
    sessionToken,
  );
}

export async function unbanDeveloperAppUser(
  sessionToken: string | undefined,
  appId: string,
  userId: string,
) {
  return api(
    `/developer/apps/${appId}/bans/${userId}`,
    { method: "DELETE" },
    sessionToken,
  );
}

export async function deleteDeveloperAccessLogs(
  sessionToken: string | undefined,
  logIds: string[],
) {
  return api(
    "/developer/access-logs/batch-delete",
    { method: "POST", body: JSON.stringify({ log_ids: logIds }) },
    sessionToken,
  );
}
