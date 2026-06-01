import { useCallback, useMemo, useState } from "react";
import {
  fetchAdminApps,
  fetchAdminAuditLogs,
  fetchAdminDashboardSummary,
  fetchAdminDeveloperAccessLogs,
  fetchAdminEmailSendLogs,
  fetchAdminPasskeyLogs,
  fetchAdminPhoneSendLogs,
  fetchAdminPolicies,
  fetchAdminScopes,
  fetchAdminSystemSettings,
  fetchAdminUsers,
} from "../services/adminApi";
import { defaultSettings } from "../constants";
import type {
  AdminPageType,
  AdminPasskeyLogs,
  AdminDashboardSummary,
  AppItem,
  AuditLog,
  DeveloperAccessLog,
  EmailSendLog,
  PhoneSendLog,
  Policy,
  ScopeDefinition,
  SystemSettings,
  User,
} from "../types";

export function useAdminData(
  sessionToken: string,
  pageType: AdminPageType,
  usersQuery?: {
    page: number;
    pageSize: number;
    emailKeyword: string;
    status: string;
    userID: string;
  },
  appsQuery?: {
    page: number;
    pageSize: number;
    status: string;
    nameKeyword: string;
  },
  auditLogsQuery?: {
    page: number;
    pageSize: number;
  },
  developerAccessLogsQuery?: {
    page: number;
    pageSize: number;
  },
) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [dashboardSummary, setDashboardSummary] = useState<AdminDashboardSummary>({
    total_users: 0,
    active_users: 0,
    pending_apps: 0,
    approved_apps: 0,
    audit_logs: 0,
    policies: 0,
  });
  const [apps, setApps] = useState<AppItem[]>([]);
  const [appsTotal, setAppsTotal] = useState(0);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [developerAccessLogs, setDeveloperAccessLogs] = useState<
    DeveloperAccessLog[]
  >([]);
  const [developerAccessLogsTotal, setDeveloperAccessLogsTotal] = useState(0);
  const [passkeyLogs, setPasskeyLogs] = useState<AdminPasskeyLogs>({
    passkeys: [],
    registration_challenges: [],
    login_challenges: [],
    usage_logs: []
  });
  const [emailSendLogs, setEmailSendLogs] = useState<EmailSendLog[]>([]);
  const [phoneSendLogs, setPhoneSendLogs] = useState<PhoneSendLog[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [scopes, setScopes] = useState<ScopeDefinition[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [error, setError] = useState<string>();

  const load = useCallback(async (options?: { force?: boolean }) => {
    setLoading(true);
    try {
      if (pageType === "dashboard") {
        const [nextSummary, nextPolicies] =
          await Promise.all([
            fetchAdminDashboardSummary(sessionToken, options),
            fetchAdminPolicies(sessionToken, options),
          ]);
        setDashboardSummary(nextSummary);
        setPolicies(nextPolicies);
        return;
      }

      if (pageType === "users") {
        const nextUsers = await fetchAdminUsers(sessionToken, usersQuery, options);
        setUsers(nextUsers.items);
        setUsersTotal(nextUsers.total);
        return;
      }

      if (pageType === "apps") {
        const [nextApps, nextScopes] = await Promise.all([
          fetchAdminApps(sessionToken, appsQuery, options),
          fetchAdminScopes(sessionToken, options),
        ]);
        setApps(nextApps.items);
        setAppsTotal(nextApps.total);
        setScopes(nextScopes);
        return;
      }

      if (pageType === "auditLogs") {
        const nextLogs = await fetchAdminAuditLogs(sessionToken, auditLogsQuery, options);
        setLogs(nextLogs.items);
        setLogsTotal(nextLogs.total);
        return;
      }

      if (pageType === "developerAccessLogs") {
        const nextLogs = await fetchAdminDeveloperAccessLogs(sessionToken, developerAccessLogsQuery, options);
        setDeveloperAccessLogs(nextLogs.items);
        setDeveloperAccessLogsTotal(nextLogs.total);
        return;
      }

      if (pageType === "riskLogs") {
        setPasskeyLogs(await fetchAdminPasskeyLogs(sessionToken, options));
        return;
      }

      if (pageType === "emailSendLogs") {
        setEmailSendLogs(await fetchAdminEmailSendLogs(sessionToken, options));
        return;
      }

      if (pageType === "phoneSendLogs") {
        setPhoneSendLogs(await fetchAdminPhoneSendLogs(sessionToken, options));
        return;
      }

      if (pageType === "settings") {
        const [nextScopes, nextSettings] = await Promise.all([
          fetchAdminScopes(sessionToken, options),
          fetchAdminSystemSettings(sessionToken, options),
        ]);
        setScopes(nextScopes);
        setSettings(nextSettings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [appsQuery, auditLogsQuery, developerAccessLogsQuery, pageType, sessionToken, usersQuery]);

  const activeUsers = useMemo(() => users.filter((item) => item.status === "active").length, [users]);
  const pendingApps = useMemo(() => apps.filter((item) => item.status === "pending_review").length, [apps]);
  const approvedApps = useMemo(() => apps.filter((item) => item.status === "approved").length, [apps]);

  return {
    users,
    usersTotal,
    dashboardSummary,
    setUsers,
    apps,
    appsTotal,
    logs,
    logsTotal,
    developerAccessLogs,
    developerAccessLogsTotal,
    passkeyLogs,
    emailSendLogs,
    phoneSendLogs,
    policies,
    scopes,
    settings,
    setSettings,
    loading,
    error,
    setError,
    load,
    activeUsers,
    pendingApps,
    approvedApps
  };
}
