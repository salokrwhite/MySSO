import { api, API_BASE } from "../../../api/client";
import { defaultSettings } from "../constants";
import type {
  AppItem,
  AppListResponse,
  AuditLog,
  AuditLogListResponse,
  AdminPasskeyLogs,
  AdminDashboardSummary,
  AdminRiskStats,
  CreateUserInput,
  DeveloperAccessLog,
  DeveloperAccessLogListResponse,
  EmailSendLog,
  PhoneSendLog,
  Policy,
  RiskAccountSummaryListResponse,
  RiskEventListResponse,
  ScopeDefinition,
  SystemSettings,
  UpdateUserInput,
  UpdateUserSecurityPolicyInput,
  UserOperationLogListResponse,
  UserSecurityPolicy,
  UserListResponse,
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
  sessionToken: string,
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

const appsCache: SessionScopedCache<AppItem[]> = {
  value: null,
  inflight: null,
};
const auditLogsCache: SessionScopedCache<AuditLog[]> = {
  value: null,
  inflight: null,
};
const developerAccessLogsCache: SessionScopedCache<DeveloperAccessLog[]> = {
  value: null,
  inflight: null,
};
const passkeyLogsCache: SessionScopedCache<AdminPasskeyLogs> = {
  value: null,
  inflight: null,
};
const emailSendLogsCache: SessionScopedCache<EmailSendLog[]> = {
  value: null,
  inflight: null,
};
const phoneSendLogsCache: SessionScopedCache<PhoneSendLog[]> = {
  value: null,
  inflight: null,
};
const policiesCache: SessionScopedCache<Policy[]> = {
  value: null,
  inflight: null,
};
const scopesCache: SessionScopedCache<ScopeDefinition[]> = {
  value: null,
  inflight: null,
};
const systemSettingsCache: SessionScopedCache<SystemSettings> = {
  value: null,
  inflight: null,
};
const dashboardSummaryCache: SessionScopedCache<AdminDashboardSummary> = {
  value: null,
  inflight: null,
};

export async function fetchAdminUsers(
  sessionToken: string,
  query?: {
    page?: number;
    pageSize?: number;
    emailKeyword?: string;
    status?: string;
    userID?: string;
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
  if (query?.emailKeyword?.trim()) {
    params.set("email_keyword", query.emailKeyword.trim());
  }
  if (query?.userID?.trim()) {
    params.set("user_id", query.userID.trim());
  }
  if (query?.status?.trim() && query.status !== "all") {
    params.set("status", query.status.trim());
  }
  const path = `/admin/users${params.size > 0 ? `?${params.toString()}` : ""}`;
  return api<UserListResponse>(
    path,
    undefined,
    sessionToken,
  );
}

export async function fetchAdminDashboardSummary(
  sessionToken: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    dashboardSummaryCache,
    sessionToken,
    async () => {
      const result = await api<{ data: AdminDashboardSummary }>(
        "/admin/dashboard-summary",
        undefined,
        sessionToken,
      );
      return result.data;
    },
    options,
  );
}

export async function fetchAdminApps(
  sessionToken: string,
  query?: {
    page?: number;
    pageSize?: number;
    status?: string;
    nameKeyword?: string;
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
  if (query?.status && query.status !== "all") {
    params.set("status", query.status);
  }
  if (query?.nameKeyword?.trim()) {
    params.set("name_keyword", query.nameKeyword.trim());
  }
  return api<AppListResponse>(
    `/admin/apps${params.size > 0 ? `?${params.toString()}` : ""}`,
    undefined,
    sessionToken,
  );
}

export async function fetchAdminAppAuditLogs(
  sessionToken: string,
  appID: string,
) {
  const result = await api<{ items: AuditLog[] }>(
    `/admin/apps/${appID}/audit-logs`,
    undefined,
    sessionToken,
  );
  return result.items;
}

export async function deleteAdminAppAuditLogs(
  sessionToken: string,
  appID: string,
  input: { start_at: string; end_at: string },
) {
  return api<{ deleted: number }>(
    `/admin/apps/${appID}/audit-logs/delete`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function fetchAdminAuditLogs(
  sessionToken: string,
  query?: {
    page?: number;
    pageSize?: number;
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
  return api<AuditLogListResponse>(
    `/admin/audit-logs${params.size > 0 ? `?${params.toString()}` : ""}`,
    undefined,
    sessionToken,
  );
}

export async function fetchAdminDeveloperAccessLogs(
  sessionToken: string,
  query?: {
    page?: number;
    pageSize?: number;
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
  return api<DeveloperAccessLogListResponse>(
    `/admin/developer-access-logs${params.size > 0 ? `?${params.toString()}` : ""}`,
    undefined,
    sessionToken,
  );
}

export async function fetchAdminPasskeyLogs(
  sessionToken: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    passkeyLogsCache,
    sessionToken,
    () => api<AdminPasskeyLogs>("/admin/passkey-logs", undefined, sessionToken),
    options,
  );
}

export async function fetchAdminRiskEvents(
  sessionToken: string,
  query?: {
    page?: number;
    pageSize?: number;
    userID?: string;
    eventType?: string;
    level?: string;
  },
) {
  const params = new URLSearchParams();
  if (typeof query?.page === "number" && query.page > 0) {
    params.set("page", String(query.page));
  }
  if (typeof query?.pageSize === "number" && query.pageSize > 0) {
    params.set("page_size", String(query.pageSize));
  }
  if (query?.userID?.trim()) {
    params.set("user_id", query.userID.trim());
  }
  if (query?.eventType?.trim() && query.eventType !== "all") {
    params.set("event_type", query.eventType.trim());
  }
  if (query?.level?.trim() && query.level !== "all") {
    params.set("level", query.level.trim());
  }
  return api<RiskEventListResponse>(
    `/admin/risk/events${params.size > 0 ? `?${params.toString()}` : ""}`,
    undefined,
    sessionToken,
  );
}

export async function fetchAdminRiskAccountSummaries(
  sessionToken: string,
  query?: {
    page?: number;
    pageSize?: number;
    userID?: string;
    level?: string;
  },
) {
  const params = new URLSearchParams();
  if (typeof query?.page === "number" && query.page > 0) {
    params.set("page", String(query.page));
  }
  if (typeof query?.pageSize === "number" && query.pageSize > 0) {
    params.set("page_size", String(query.pageSize));
  }
  if (query?.userID?.trim()) {
    params.set("user_id", query.userID.trim());
  }
  if (query?.level?.trim() && query.level !== "all") {
    params.set("level", query.level.trim());
  }
  return api<RiskAccountSummaryListResponse>(
    `/admin/risk/account-summaries${params.size > 0 ? `?${params.toString()}` : ""}`,
    undefined,
    sessionToken,
  );
}

export async function fetchAdminRiskStats(
  sessionToken: string,
) {
  const result = await api<{ data: AdminRiskStats }>(
    "/admin/risk/stats",
    undefined,
    sessionToken,
  );
  return result.data;
}

export async function deleteAdminRiskEvents(
  sessionToken: string,
  input: { delete_all: boolean; start_at?: string; end_at?: string },
) {
  return api<{ deleted: number }>(
    "/admin/risk/events/delete",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function clearAdminUserRiskProfile(sessionToken: string, userID: string) {
  return api<{ updated: boolean }>(
    `/admin/risk/users/${encodeURIComponent(userID)}/clear-profile`,
    { method: "POST" },
    sessionToken,
  );
}

export async function markAdminUserRiskFalsePositive(
  sessionToken: string,
  userID: string,
  input: { note: string; hours: number },
) {
  return api<{ updated: boolean }>(
    `/admin/risk/users/${encodeURIComponent(userID)}/false-positive`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function fetchAdminEmailSendLogs(
  sessionToken: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    emailSendLogsCache,
    sessionToken,
    async () => {
      const result = await api<{ items: EmailSendLog[] }>(
        "/admin/send-logs/emails",
        undefined,
        sessionToken,
      );
      return result.items;
    },
    options,
  );
}

export async function fetchAdminPhoneSendLogs(
  sessionToken: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    phoneSendLogsCache,
    sessionToken,
    async () => {
      const result = await api<{ items: PhoneSendLog[] }>(
        "/admin/send-logs/phones",
        undefined,
        sessionToken,
      );
      return result.items;
    },
    options,
  );
}

export async function fetchAdminPolicies(
  sessionToken: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    policiesCache,
    sessionToken,
    async () => {
      const result = await api<{ items: Policy[] }>(
        "/admin/gateway-policies",
        undefined,
        sessionToken,
      );
      return result.items;
    },
    options,
  );
}

export async function fetchAdminScopes(
  sessionToken: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    scopesCache,
    sessionToken,
    async () => {
      const result = await api<{ items: ScopeDefinition[] }>(
        "/admin/scopes",
        undefined,
        sessionToken,
      );
      return result.items;
    },
    options,
  );
}

export async function fetchAdminSystemSettings(
  sessionToken: string,
  options?: { force?: boolean },
) {
  return loadCachedResource(
    systemSettingsCache,
    sessionToken,
    async () => {
      const result = await api<{ data: SystemSettings }>(
        "/admin/system-settings",
        undefined,
        sessionToken,
      );
      return { ...defaultSettings, ...result.data };
    },
    options,
  );
}

export function updateAdminScopesCache(
  sessionToken: string,
  scopes: ScopeDefinition[],
) {
  readSessionScopedCache(scopesCache, sessionToken).value = scopes;
}

export function updateAdminSystemSettingsCache(
  sessionToken: string,
  settings: SystemSettings,
) {
  readSessionScopedCache(systemSettingsCache, sessionToken).value = settings;
}

export function clearAdminResourceCaches(sessionToken: string) {
  readSessionScopedCache(dashboardSummaryCache, sessionToken).value = null;
  readSessionScopedCache(appsCache, sessionToken).value = null;
  readSessionScopedCache(auditLogsCache, sessionToken).value = null;
  readSessionScopedCache(developerAccessLogsCache, sessionToken).value = null;
  readSessionScopedCache(passkeyLogsCache, sessionToken).value = null;
  readSessionScopedCache(emailSendLogsCache, sessionToken).value = null;
  readSessionScopedCache(phoneSendLogsCache, sessionToken).value = null;
  readSessionScopedCache(policiesCache, sessionToken).value = null;
  readSessionScopedCache(scopesCache, sessionToken).value = null;
  readSessionScopedCache(systemSettingsCache, sessionToken).value = null;
}

export async function reviewApp(
  sessionToken: string,
  id: string,
  approved: boolean,
  comment?: string,
) {
  return api(
    `/admin/apps/${id}/review`,
    {
      method: "POST",
      body: JSON.stringify({
        approved,
        comment: comment?.trim() || (approved ? "审核通过" : "请补充信息"),
      }),
    },
    sessionToken,
  );
}

export async function createApp(
  sessionToken: string,
  input: {
    name: string;
    icon_url?: string;
    description?: string;
    redirect_uris: string[];
    post_logout_redirect_uris?: string[];
    frontchannel_logout_uri?: string;
    allow_get_session_logout?: boolean;
    scopes: string[];
  },
) {
  return api<AppItem>(
    "/admin/apps",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function updateApp(
  sessionToken: string,
  id: string,
  input: {
    name: string;
    icon_url?: string;
    description?: string;
    redirect_uris: string[];
    post_logout_redirect_uris?: string[];
    frontchannel_logout_uri?: string;
    allow_get_session_logout?: boolean;
    scopes: string[];
  },
) {
  return api<AppItem>(
    `/admin/apps/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function resetAdminAppSecret(sessionToken: string, id: string) {
  return api<AppItem>(
    `/admin/apps/${id}/reset-secret`,
    { method: "POST" },
    sessionToken,
  );
}

export async function setAdminAppDisabled(
  sessionToken: string,
  id: string,
  disabled: boolean,
) {
  return api<AppItem>(
    `/admin/apps/${id}/disabled`,
    {
      method: "POST",
      body: JSON.stringify({ disabled }),
    },
    sessionToken,
  );
}

export async function uploadAdminAppIcon(
  dataUrl: string,
  _sessionToken?: string,
) {
  const response = await fetch(`${API_BASE}/admin/apps/icon`, {
    method: "POST",
    credentials: "include",
    body: (() => {
      const formData = new FormData();
      const [meta, base64] = dataUrl.split(",", 2);
      const mime = meta.match(/data:(.*?);base64/)?.[1] || "image/webp";
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      formData.append(
        "file",
        new File([bytes], "app-icon.webp", { type: mime }),
      );
      return formData;
    })(),
  });

  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(payload.error || "应用图标上传失败");
  }

  const payload = (await response.json()) as { data?: { url?: string } };
  return payload.data?.url || "";
}

export async function deleteApp(sessionToken: string, id: string) {
  return api(
    `/admin/apps/${id}`,
    {
      method: "DELETE",
    },
    sessionToken,
  );
}

export async function batchDeleteApps(sessionToken: string, appIds: string[]) {
  return api(
    "/admin/apps/batch-delete",
    {
      method: "POST",
      body: JSON.stringify({ app_ids: appIds }),
    },
    sessionToken,
  );
}

export async function freezeUser(
  sessionToken: string,
  id: string,
  frozen: boolean,
  reason?: string,
) {
  return api(
    `/admin/users/${id}/freeze`,
    {
      method: "POST",
      body: JSON.stringify({ frozen, reason }),
    },
    sessionToken,
  );
}

export async function createUser(sessionToken: string, input: CreateUserInput) {
  return api(
    "/admin/users",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function updateUser(
  sessionToken: string,
  id: string,
  input: UpdateUserInput,
) {
  return api(
    `/admin/users/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function getUserSecurityPolicy(
  sessionToken: string,
  id: string,
) {
  return api<UserSecurityPolicy>(
    `/admin/users/${id}/security-policy`,
    undefined,
    sessionToken,
  );
}

export async function updateUserSecurityPolicy(
  sessionToken: string,
  id: string,
  input: UpdateUserSecurityPolicyInput,
) {
  return api<UserSecurityPolicy>(
    `/admin/users/${id}/security-policy`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function batchFreezeUsers(
  sessionToken: string,
  userIds: string[],
  frozen: boolean,
  reason?: string,
) {
  return api(
    "/admin/users/batch-freeze",
    {
      method: "POST",
      body: JSON.stringify({ user_ids: userIds, frozen, reason }),
    },
    sessionToken,
  );
}

export async function batchDeleteUsers(
  sessionToken: string,
  userIds: string[],
) {
  return api(
    "/admin/users/batch-delete",
    {
      method: "POST",
      body: JSON.stringify({ user_ids: userIds }),
    },
    sessionToken,
  );
}

export async function updateUserAnnouncement(
  sessionToken: string,
  userId: string,
  enabled: boolean,
  content: string,
) {
  return api(
    `/admin/users/${userId}/announcement`,
    {
      method: "POST",
      body: JSON.stringify({ enabled, content }),
    },
    sessionToken,
  );
}

export async function listUserOperationLogs(
  sessionToken: string,
  userId: string,
  page: number,
  pageSize: number,
) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return api<UserOperationLogListResponse>(
    `/admin/users/${userId}/operation-logs?${params.toString()}`,
    undefined,
    sessionToken,
  );
}

export async function deleteUserOperationLogs(
  sessionToken: string,
  userId: string,
  input: { delete_all?: boolean; start_at?: string; end_at?: string },
) {
  return api(
    `/admin/users/${userId}/operation-logs/delete`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function batchDeleteAuditLogs(
  sessionToken: string,
  logIds: string[],
) {
  return api(
    "/admin/audit-logs/batch-delete",
    {
      method: "POST",
      body: JSON.stringify({ log_ids: logIds }),
    },
    sessionToken,
  );
}

export async function batchDeleteDeveloperAccessLogs(
  sessionToken: string,
  logIds: string[],
) {
  return api(
    "/admin/developer-access-logs/batch-delete",
    {
      method: "POST",
      body: JSON.stringify({ log_ids: logIds }),
    },
    sessionToken,
  );
}

export async function batchDeletePasskeyLogs(
  sessionToken: string,
  table: string,
  recordIds: string[],
) {
  return api(
    "/admin/passkey-logs/batch-delete",
    {
      method: "POST",
      body: JSON.stringify({ table, record_ids: recordIds }),
    },
    sessionToken,
  );
}

export async function batchDeleteEmailSendLogs(
  sessionToken: string,
  logIds: string[],
) {
  return api(
    "/admin/send-logs/emails/batch-delete",
    {
      method: "POST",
      body: JSON.stringify({ log_ids: logIds }),
    },
    sessionToken,
  );
}

export async function batchDeletePhoneSendLogs(
  sessionToken: string,
  logIds: string[],
) {
  return api(
    "/admin/send-logs/phones/batch-delete",
    {
      method: "POST",
      body: JSON.stringify({ log_ids: logIds }),
    },
    sessionToken,
  );
}

export async function updateSystemSettings(
  sessionToken: string,
  settings: SystemSettings,
) {
  return api(
    "/admin/system-settings",
    {
      method: "PUT",
      body: JSON.stringify(settings),
    },
    sessionToken,
  );
}

export async function upsertScope(
  sessionToken: string,
  input: ScopeDefinition,
) {
  const path = input.key
    ? `/admin/scopes/${encodeURIComponent(input.key)}`
    : "/admin/scopes";
  const method = input.key ? "PUT" : "POST";
  return api(
    path,
    {
      method,
      body: JSON.stringify(input),
    },
    sessionToken,
  );
}

export async function deleteScope(sessionToken: string, key: string) {
  return api(
    `/admin/scopes/${encodeURIComponent(key)}`,
    {
      method: "DELETE",
    },
    sessionToken,
  );
}

export async function sendTestEmail(sessionToken: string, email: string) {
  return api(
    "/admin/system-settings/test-email",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    sessionToken,
  );
}

export async function sendTestSMS(
  sessionToken: string,
  provider: string,
  phone: string,
  content: string,
) {
  return api(
    "/admin/system-settings/test-sms",
    {
      method: "POST",
      body: JSON.stringify({ provider, phone, content }),
    },
    sessionToken,
  );
}
