import { api } from "../../../api/client";
import type {
  AppItem,
  DeveloperAnalyticsData,
  DeveloperAuditLog,
  ResetSecretResult,
  ScopeDefinition,
} from "../types";

export async function fetchDeveloperApps(sessionToken?: string) {
  return api<{ items: AppItem[] }>("/developer/apps", undefined, sessionToken);
}

export async function fetchDeveloperAuditLogs(sessionToken?: string) {
  return api<{ items: DeveloperAuditLog[] }>(
    "/developer/audit-logs",
    undefined,
    sessionToken,
  );
}

export async function fetchDeveloperAnalytics(sessionToken?: string) {
  return api<{ data: DeveloperAnalyticsData }>(
    "/developer/analytics",
    undefined,
    sessionToken,
  );
}

export async function fetchDeveloperScopes(sessionToken?: string) {
  return api<{ items: ScopeDefinition[] }>(
    "/developer/scopes",
    undefined,
    sessionToken,
  );
}

export async function fetchDeveloperAnnouncement() {
  return api<{
    data?: {
      developer_announcement_enabled?: boolean;
      developer_announcement_content?: string;
    };
  }>("/public/settings");
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
