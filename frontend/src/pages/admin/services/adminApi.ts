import { api, API_BASE } from "../../../api/client";
import { defaultSettings } from "../constants";
import type {
  AdminDataResponse,
  AppItem,
  AuditLog,
  AdminPasskeyLogs,
  CreateUserInput,
  EmailSendLog,
  PhoneSendLog,
  Policy,
  RiskLog,
  ScopeDefinition,
  SystemSettings,
  UpdateUserInput,
  UpdateUserSecurityPolicyInput,
  UserOperationLogListResponse,
  UserSecurityPolicy,
  User,
} from "../types";

export async function loadAdminData(
  sessionToken: string,
): Promise<AdminDataResponse> {
  const [
    userResult,
    appResult,
    logResult,
    riskLogResult,
    passkeyLogResult,
    emailSendLogResult,
    phoneSendLogResult,
    policyResult,
    scopeResult,
    settingsResult,
  ] = await Promise.all([
    api<{ items: User[] }>("/admin/users", undefined, sessionToken),
    api<{ items: AppItem[] }>("/admin/apps", undefined, sessionToken),
    api<{ items: AuditLog[] }>("/admin/audit-logs", undefined, sessionToken),
    api<{ items: RiskLog[] }>("/admin/risk-logs", undefined, sessionToken),
    api<AdminPasskeyLogs>("/admin/passkey-logs", undefined, sessionToken),
    api<{ items: EmailSendLog[] }>(
      "/admin/send-logs/emails",
      undefined,
      sessionToken,
    ),
    api<{ items: PhoneSendLog[] }>(
      "/admin/send-logs/phones",
      undefined,
      sessionToken,
    ),
    api<{ items: Policy[] }>(
      "/admin/gateway-policies",
      undefined,
      sessionToken,
    ),
    api<{ items: ScopeDefinition[] }>("/admin/scopes", undefined, sessionToken),
    api<{ data: SystemSettings }>(
      "/admin/system-settings",
      undefined,
      sessionToken,
    ),
  ]);

  return {
    users: userResult.items,
    apps: appResult.items,
    logs: logResult.items,
    riskLogs: riskLogResult.items,
    passkeyLogs: passkeyLogResult,
    emailSendLogs: emailSendLogResult.items,
    phoneSendLogs: phoneSendLogResult.items,
    policies: policyResult.items,
    scopes: scopeResult.items,
    settings: { ...defaultSettings, ...settingsResult.data },
  };
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
    scopes: string[];
  },
) {
  return api(
    `/admin/apps/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
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

export async function batchDeleteRiskLogs(
  sessionToken: string,
  logIds: string[],
) {
  return api(
    "/admin/risk-logs/batch-delete",
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
