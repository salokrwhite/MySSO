import { useCallback, useMemo, useState } from "react";
import { loadAdminData } from "../services/adminApi";
import { defaultSettings } from "../constants";
import type { AdminPasskeyLogs, AppItem, AuditLog, EmailSendLog, PhoneSendLog, Policy, RiskLog, ScopeDefinition, SystemSettings, User } from "../types";

export function useAdminData(sessionToken: string) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [riskLogs, setRiskLogs] = useState<RiskLog[]>([]);
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadAdminData(sessionToken);
      setUsers(result.users);
      setApps(result.apps);
      setLogs(result.logs);
      setRiskLogs(result.riskLogs);
      setPasskeyLogs(result.passkeyLogs);
      setEmailSendLogs(result.emailSendLogs);
      setPhoneSendLogs(result.phoneSendLogs);
      setPolicies(result.policies);
      setScopes(result.scopes);
      setSettings(result.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  const activeUsers = useMemo(() => users.filter((item) => item.status === "active").length, [users]);
  const pendingApps = useMemo(() => apps.filter((item) => item.status === "pending_review").length, [apps]);
  const approvedApps = useMemo(() => apps.filter((item) => item.status === "approved").length, [apps]);

  return {
    users,
    setUsers,
    apps,
    logs,
    riskLogs,
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
